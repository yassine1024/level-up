package com.levelup.backend.student.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.levelup.backend.agent.AgentsClient;
import com.levelup.backend.agent.RunContext;
import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.repository.LessonResourceRepository;
import com.levelup.backend.student.entity.ExplanationLanguage;
import com.levelup.backend.student.entity.GameType;
import com.levelup.backend.student.entity.GeneratedExerciseSet;
import com.levelup.backend.student.entity.GeneratedSlideDeck;
import com.levelup.backend.student.entity.StudentMistake;
import com.levelup.backend.student.repository.GeneratedExerciseSetRepository;
import com.levelup.backend.student.repository.GeneratedSlideDeckRepository;
import com.levelup.backend.student.repository.StudentMistakeRepository;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GeneratedContentService {

    private static final Logger logger = LoggerFactory.getLogger(GeneratedContentService.class);
    private static final int EXERCISE_COUNT = 15;

    private final GeneratedSlideDeckRepository slideDeckRepository;
    private final GeneratedExerciseSetRepository exerciseSetRepository;
    private final LessonResourceRepository resourceRepository;
    private final StudentMistakeRepository mistakeRepository;
    private final AgentsClient agentsClient;
    private final ObjectMapper objectMapper;

    public GeneratedContentService(
            GeneratedSlideDeckRepository slideDeckRepository,
            GeneratedExerciseSetRepository exerciseSetRepository,
            LessonResourceRepository resourceRepository,
            StudentMistakeRepository mistakeRepository,
            AgentsClient agentsClient,
            ObjectMapper objectMapper
    ) {
        this.slideDeckRepository = slideDeckRepository;
        this.exerciseSetRepository = exerciseSetRepository;
        this.resourceRepository = resourceRepository;
        this.mistakeRepository = mistakeRepository;
        this.agentsClient = agentsClient;
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
    public String exercisesFor(User user, Lesson lesson, GameType gameType) {
        int version = lesson.getContentVersion();
        return exerciseSetRepository
                .findByLesson_IdAndContentVersionAndGameType(lesson.getId(), version, gameType)
                .map(GeneratedExerciseSet::getQuestionsJson)
                .orElseGet(() -> {
                    String json = toJson(generateExercises(user, lesson, gameType)
                            .orElseGet(() -> buildExercises(lesson, gameType)));
                    Long runId = agentsClient.lastRunId();
                    exerciseSetRepository.save(new GeneratedExerciseSet(lesson, version, gameType, json, runId));
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

        for (int index = 0; index < EXERCISE_COUNT; index++) {
            String word = tokens.isEmpty() ? "name" : tokens.get(index % tokens.size());
            if (gameType == GameType.QUIZ) {
                questions.add(question(
                        index,
                        "Which word appears in the lesson materials?",
                        List.of(word, "xylophone", "submarine", "volcano"),
                        word,
                        "This word was taken from the lesson text."
                ));
            } else {
                List<String> options = new ArrayList<>();
                options.add(word);
                for (String token : tokens) {
                    if (!options.contains(token)) {
                        options.add(token);
                    }
                    if (options.size() == 4) {
                        break;
                    }
                }
                while (options.size() < 3) {
                    options.add("different");
                }
                questions.add(question(
                        index,
                        "Complete: The lesson includes the word ____.",
                        options,
                        word,
                        "Use a key word from the lesson."
                ));
            }
        }

        return questions;
    }

    private Optional<List<Map<String, Object>>> generateExercises(
            User user,
            Lesson lesson,
            GameType gameType
    ) {
        ObjectNode request = objectMapper.createObjectNode();
        request.set("lesson", lessonInfo(lesson));
        request.put("gameType", gameType.name());
        request.put("count", EXERCISE_COUNT);
        request.put("vocabularyText", resourceText(lesson, LessonResourceType.VOCABULARY));
        request.put("grammarText", resourceText(lesson, LessonResourceType.GRAMMAR));
        request.put("pronunciationText", "");
        request.put("listeningTranscript", resourceText(lesson, LessonResourceType.LISTENING_1));
        request.put("writingDescription", resourceText(lesson, LessonResourceType.WRITING_DESCRIPTION));

        ArrayNode recentMistakes = request.putArray("recentMistakes");
        ArrayNode excludePrompts = request.putArray("excludePrompts");
        for (StudentMistake mistake : mistakeRepository.findTop50ByUser_IdOrderByCreatedAtDesc(user.getId())) {
            ObjectNode recentMistake = recentMistakes.addObject();
            recentMistake.put("prompt", mistake.getPrompt());
            recentMistake.put("studentAnswer", mistake.getStudentAnswer());
            recentMistake.put("correction", mistake.getCorrection());
            recentMistake.put("focus", firstNonBlank(mistake.getFocus(), ""));
            excludePrompts.add(mistake.getPrompt());
        }

        RunContext runContext = new RunContext(
                "practice",
                "/api/agents/practice/questions",
                lesson.getId(),
                lesson.getContentVersion(),
                gameType.name(),
                user.getId(),
                user.getRole().name(),
                "lesson:" + lesson.getId()
        );
        Optional<JsonNode> response = agentsClient.generatePracticeQuestions(request, runContext);
        if (response.isEmpty()) {
            return Optional.empty();
        }
        JsonNode body = response.get();
        JsonNode items = body.get("items");
        if (!gameType.name().equals(body.path("gameType").asText())
                || !items.isArray() || items.size() < 10 || items.size() > EXERCISE_COUNT) {
            logger.warn("Agents returned an invalid practice pool for lesson {} and game {}",
                    lesson.getId(), gameType);
            return Optional.empty();
        }

        List<Map<String, Object>> questions = new ArrayList<>();
        for (int index = 0; index < items.size(); index++) {
            JsonNode item = items.get(index);
            if (!validAgentItem(item, index, gameType)) {
                logger.warn("Agents returned an invalid practice item {} for lesson {} and game {}",
                        index, lesson.getId(), gameType);
                return Optional.empty();
            }
            Map<String, Object> question = new LinkedHashMap<>();
            question.put("index", index);
            question.put("prompt", item.get("prompt").asText());
            question.put("options", objectMapper.convertValue(item.get("options"), List.class));
            question.put("correctAnswer", item.get("correctAnswer").asText());
            question.put("acceptedAnswers", objectMapper.convertValue(item.get("acceptedAnswers"), List.class));
            question.put("explanation", item.get("explanation"));
            question.put("focus", item.path("focus").asText(""));
            if (item.has("audioText") && !item.get("audioText").isNull()) {
                question.put("audioText", item.get("audioText").asText());
            }
            questions.add(question);
        }
        return Optional.of(questions);
    }

    private ObjectNode lessonInfo(Lesson lesson) {
        ObjectNode info = objectMapper.createObjectNode();
        info.put("title", lesson.getTitle());
        info.put("level", lesson.getUnit().getLevel().getId());
        info.put("unitTitle", lesson.getUnit().getTitle());
        return info;
    }

    private String resourceText(Lesson lesson, LessonResourceType type) {
        return resourceRepository.findAllByLesson_Id(lesson.getId()).stream()
                .filter(resource -> resource.getType() == type)
                .map(resource -> firstNonBlank(resource.getExtractedText(), resource.getDescription()))
                .filter(text -> text != null && !text.isBlank())
                .findFirst()
                .orElse("");
    }

    private boolean validAgentItem(JsonNode item, int expectedIndex, GameType gameType) {
        JsonNode options = item == null ? null : item.get("options");
        int optionCount = options == null || !options.isArray() ? 0 : options.size();
        boolean validOptions = gameType == GameType.QUIZ
                ? optionCount == 4
                : optionCount >= 3 && optionCount <= 4;
        return item != null
                && item.isObject()
                && item.path("prompt").isTextual()
                && !item.path("prompt").asText().isBlank()
                && item.path("correctAnswer").isTextual()
                && !item.path("correctAnswer").asText().isBlank()
                && validOptions
                && containsOption(options, item.path("correctAnswer").asText())
                && item.path("acceptedAnswers").isArray()
                && item.path("explanation").isObject()
                && item.path("explanation").path("en").isTextual()
                && item.path("explanation").path("fr").isTextual()
                && item.path("explanation").path("ar").isTextual()
                && item.path("focus").isTextual()
                && item.has("index")
                && item.path("index").isIntegralNumber()
                && item.path("index").asInt() == expectedIndex
                && (gameType != GameType.FILL_BLANK
                || item.path("prompt").asText().split("____", -1).length - 1 == 1);
    }

    private boolean containsOption(JsonNode options, String answer) {
        boolean found = false;
        for (JsonNode option : options) {
            if (!option.isTextual()) {
                return false;
            }
            if (option.asText().equals(answer)) {
                found = true;
            }
        }
        return found;
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
        question.put("acceptedAnswers", List.of());
        question.put("explanation", explanation);
        question.put("focus", "");
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
