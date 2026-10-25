package com.levelup.backend.student.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.repository.LessonResourceRepository;
import com.levelup.backend.student.entity.ExplanationLanguage;
import com.levelup.backend.student.entity.GameType;
import com.levelup.backend.student.entity.GeneratedExerciseSet;
import com.levelup.backend.student.entity.GeneratedSlideDeck;
import com.levelup.backend.student.repository.GeneratedExerciseSetRepository;
import com.levelup.backend.student.repository.GeneratedSlideDeckRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeneratedContentService {

    private final GeneratedSlideDeckRepository slideDeckRepository;
    private final GeneratedExerciseSetRepository exerciseSetRepository;
    private final LessonResourceRepository resourceRepository;
    private final ObjectMapper objectMapper;

    public GeneratedContentService(
            GeneratedSlideDeckRepository slideDeckRepository,
            GeneratedExerciseSetRepository exerciseSetRepository,
            LessonResourceRepository resourceRepository,
            ObjectMapper objectMapper
    ) {
        this.slideDeckRepository = slideDeckRepository;
        this.exerciseSetRepository = exerciseSetRepository;
        this.resourceRepository = resourceRepository;
        this.objectMapper = objectMapper;
    }

    public record CachedSlides(boolean cached, int contentVersion, JsonNode slides) {
    }

    @Transactional
    public CachedSlides slidesFor(Lesson lesson, ExplanationLanguage language) {
        int version = lesson.getContentVersion();
        return slideDeckRepository
                .findByLesson_IdAndContentVersionAndLanguage(lesson.getId(), version, language)
                .map(deck -> new CachedSlides(true, version, readTree(deck.getSlidesJson())))
                .orElseGet(() -> {
                    String json = toJson(buildSlides(lesson, language));
                    slideDeckRepository.save(new GeneratedSlideDeck(lesson, version, language, json));
                    return new CachedSlides(false, version, readTree(json));
                });
    }

    @Transactional
    public String exercisesFor(Lesson lesson, GameType gameType) {
        int version = lesson.getContentVersion();
        return exerciseSetRepository
                .findByLesson_IdAndContentVersionAndGameType(lesson.getId(), version, gameType)
                .map(GeneratedExerciseSet::getQuestionsJson)
                .orElseGet(() -> {
                    String json = toJson(buildExercises(lesson, gameType));
                    exerciseSetRepository.save(new GeneratedExerciseSet(lesson, version, gameType, json));
                    return json;
                });
    }

    public List<Map<String, Object>> parseQuestions(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid exercise cache");
        }
    }

    private List<Map<String, Object>> buildSlides(Lesson lesson, ExplanationLanguage language) {
        String hint = switch (language) {
            case FR -> "Lis attentivement et répète à voix haute.";
            case AR -> "اقرأ بتمعن وكرر بصوت عال.";
            case EN -> "Read carefully and say it out loud.";
        };

        List<Map<String, Object>> slides = new ArrayList<>();
        slides.add(slide(0, lesson.getTitle(), "Let's start this lesson.", hint));

        int index = 1;
        for (LessonResource resource : resourceRepository.findAllByLesson_Id(lesson.getId())) {
            String body = firstNonBlank(resource.getExtractedText(), resource.getDescription());
            if (body == null || body.isBlank()) {
                continue;
            }
            slides.add(slide(index++, resource.getType().name().replace('_', ' '), clip(body, 800), hint));
        }

        if (slides.size() == 1) {
            slides.add(slide(
                    1,
                    "Practice",
                    "Your teacher has not added materials yet. You can still review this lesson title and continue.",
                    hint
            ));
        }
        return slides;
    }

    private List<Map<String, Object>> buildExercises(Lesson lesson, GameType gameType) {
        List<String> tokens = sourceTokens(lesson);
        List<Map<String, Object>> questions = new ArrayList<>();

        if (gameType == GameType.QUIZ) {
            questions.add(question(
                    0,
                    "What is this lesson about?",
                    List.of(lesson.getTitle(), "Sports news", "Cooking recipes", "Airport security"),
                    lesson.getTitle(),
                    "The lesson title is the topic."
            ));
            if (tokens.size() >= 1) {
                String word = tokens.getFirst();
                questions.add(question(
                        1,
                        "Which word appears in the lesson materials?",
                        List.of(word, "xylophone", "submarine", "volcano"),
                        word,
                        "This word was taken from the lesson text."
                ));
            }
        } else {
            String word = tokens.isEmpty() ? "name" : tokens.getFirst();
            questions.add(question(
                    0,
                    "Complete: My ____ is used in this lesson.",
                    List.of(),
                    word,
                    "Use a key word from the lesson."
            ));
            questions.add(question(
                    1,
                    "Complete: This lesson is called \"" + lesson.getTitle() + "\". The topic is ____.",
                    List.of(),
                    lesson.getTitle(),
                    "Use the lesson title."
            ));
        }

        return questions;
    }

    private List<String> sourceTokens(Lesson lesson) {
        StringBuilder text = new StringBuilder();
        for (LessonResource resource : resourceRepository.findAllByLesson_Id(lesson.getId())) {
            if (resource.getType() == LessonResourceType.VOCABULARY
                    || resource.getType() == LessonResourceType.GRAMMAR) {
                if (resource.getExtractedText() != null) {
                    text.append(' ').append(resource.getExtractedText());
                }
            }
        }
        List<String> tokens = new ArrayList<>();
        for (String raw : text.toString().split("[^A-Za-z]+")) {
            if (raw.length() >= 3) {
                tokens.add(raw.toLowerCase());
            }
            if (tokens.size() >= 8) {
                break;
            }
        }
        return tokens;
    }

    private Map<String, Object> slide(int index, String title, String body, String hint) {
        Map<String, Object> slide = new LinkedHashMap<>();
        slide.put("index", index);
        slide.put("title", title);
        slide.put("body", body);
        slide.put("hint", hint);
        return slide;
    }

    private Map<String, Object> question(
            int index,
            String prompt,
            List<String> options,
            String correctAnswer,
            String explanation
    ) {
        Map<String, Object> question = new LinkedHashMap<>();
        question.put("index", index);
        question.put("prompt", prompt);
        question.put("options", options);
        question.put("correctAnswer", correctAnswer);
        question.put("explanation", explanation);
        return question;
    }

    private JsonNode readTree(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid slide cache");
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate content");
        }
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }

    private String clip(String text, int max) {
        String normalized = text.trim();
        if (normalized.length() <= max) {
            return normalized;
        }
        return normalized.substring(0, max) + "…";
    }
}
