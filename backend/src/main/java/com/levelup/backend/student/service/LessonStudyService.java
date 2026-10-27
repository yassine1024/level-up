package com.levelup.backend.student.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.levelup.backend.agent.AgentsClient;
import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.repository.LessonResourceRepository;
import com.levelup.backend.student.dto.ProgressResponse;
import com.levelup.backend.student.dto.SlideDeckResponse;
import com.levelup.backend.student.dto.WritingSubmissionResponse;
import com.levelup.backend.student.dto.WritingTaskResponse;
import com.levelup.backend.student.entity.ExplanationLanguage;
import com.levelup.backend.student.entity.GeneratedSlideDeck;
import com.levelup.backend.student.entity.LessonProgress;
import com.levelup.backend.student.entity.WritingSubmission;
import com.levelup.backend.student.repository.GeneratedSlideDeckRepository;
import com.levelup.backend.student.repository.LessonProgressRepository;
import com.levelup.backend.student.repository.WritingSubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class LessonStudyService {

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final LessonResourceRepository resourceRepository;
    private final GeneratedSlideDeckRepository slideDeckRepository;
    private final WritingSubmissionRepository writingSubmissionRepository;
    private final ObjectMapper objectMapper;
    private final AgentsClient agentsClient;

    public LessonStudyService(
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository,
            LessonResourceRepository resourceRepository,
            GeneratedSlideDeckRepository slideDeckRepository,
            WritingSubmissionRepository writingSubmissionRepository,
            ObjectMapper objectMapper,
            AgentsClient agentsClient
    ) {
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
        this.resourceRepository = resourceRepository;
        this.slideDeckRepository = slideDeckRepository;
        this.writingSubmissionRepository = writingSubmissionRepository;
        this.objectMapper = objectMapper;
        this.agentsClient = agentsClient;
    }

    @Transactional
    public SlideDeckResponse generateSlides(User user, Long lessonId, ExplanationLanguage language) {
        Lesson lesson = requirePublishedLesson(lessonId);
        int version = lesson.getContentVersion();

        return slideDeckRepository
                .findByLesson_IdAndContentVersionAndLanguage(lessonId, version, language)
                .map(deck -> toSlideResponse(lesson, version, language, deck.getSlidesJson(), true))
                .orElseGet(() -> {
                    String json = buildSlidesJson(lesson, language);
                    slideDeckRepository.save(new GeneratedSlideDeck(lesson, version, language, json));
                    ensureProgress(user, lesson);
                    return toSlideResponse(lesson, version, language, json, false);
                });
    }

    @Transactional
    public ProgressResponse updateProgress(User user, Long lessonId, int lastSlideIndex) {
        Lesson lesson = requirePublishedLesson(lessonId);
        LessonProgress progress = ensureProgress(user, lesson);
        progress.updateSlide(lastSlideIndex);
        progressRepository.save(progress);
        return toProgressResponse(progress);
    }

    @Transactional
    public ProgressResponse completeLesson(User user, Long lessonId) {
        Lesson lesson = requirePublishedLesson(lessonId);
        LessonProgress progress = ensureProgress(user, lesson);
        progress.complete();
        progressRepository.save(progress);
        return toProgressResponse(progress);
    }

    @Transactional(readOnly = true)
    public WritingTaskResponse getWritingTask(Long lessonId) {
        requirePublishedLesson(lessonId);
        LessonResource resource = resourceRepository
                .findByLesson_IdAndType(lessonId, LessonResourceType.WRITING_DESCRIPTION)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No writing task for this lesson"
                ));
        String instructions = resource.getDescription();
        if (instructions == null || instructions.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No writing task for this lesson");
        }
        return new WritingTaskResponse(lessonId, instructions);
    }

    @Transactional
    public WritingSubmissionResponse submitWriting(User user, Long lessonId, String text) {
        Lesson lesson = requirePublishedLesson(lessonId);
        getWritingTask(lessonId);
        String feedback = buildWritingFeedback(text);
        WritingSubmission submission = writingSubmissionRepository.save(
                new WritingSubmission(user, lesson, text, feedback)
        );
        return new WritingSubmissionResponse(
                submission.getId(),
                lessonId,
                submission.getStudentText(),
                submission.getFeedback()
        );
    }

    Lesson requirePublishedLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        if (!lesson.isPublished()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found");
        }
        return lesson;
    }

    private LessonProgress ensureProgress(User user, Lesson lesson) {
        return progressRepository.findByUser_IdAndLesson_Id(user.getId(), lesson.getId())
                .orElseGet(() -> progressRepository.save(new LessonProgress(user, lesson)));
    }

    private ProgressResponse toProgressResponse(LessonProgress progress) {
        return new ProgressResponse(
                progress.getLesson().getId(),
                progress.getStatus().name(),
                progress.getLastSlideIndex()
        );
    }

    private SlideDeckResponse toSlideResponse(
            Lesson lesson,
            int version,
            ExplanationLanguage language,
            String json,
            boolean cached
    ) {
        try {
            JsonNode node = objectMapper.readTree(json);
            JsonNode slides = node.has("slides") ? node.get("slides") : node;
            return new SlideDeckResponse(lesson.getId(), cached, version, language.name(), slides);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored slides are invalid");
        }
    }

    private String buildSlidesJson(Lesson lesson, ExplanationLanguage language) {
        List<LessonResource> resources = resourceRepository.findAllByLesson_Id(lesson.getId());
        String vocab = textOf(resources, LessonResourceType.VOCABULARY);
        String grammar = textOf(resources, LessonResourceType.GRAMMAR);
        String pronunciation = "";
        String agentJson = generateAgentSlides(lesson, language, vocab, grammar, pronunciation);
        if (agentJson != null) {
            return agentJson;
        }
        String hint = switch (language) {
            case FR -> "Lis chaque diapositive et répète à voix haute.";
            case AR -> "اقرأ كل شريحة وكرر بصوت عال.";
            case EN -> "Read each slide and say it out loud.";
        };

        List<Map<String, Object>> slides = new ArrayList<>();
        slides.add(slide(0, lesson.getTitle(), "Let's start this lesson.", hint));
        addContentSlides(slides, "Vocabulary", vocab, hint);
        addContentSlides(slides, "Grammar", grammar, hint);
        if (slides.size() == 1) {
            slides.add(slide(1, "Practice", "Your teacher has not uploaded materials yet. You can still continue.", hint));
        }

        try {
            return objectMapper.writeValueAsString(Map.of("slides", slides));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate slides");
        }
    }

    private String generateAgentSlides(
            Lesson lesson,
            ExplanationLanguage language,
            String vocabulary,
            String grammar,
            String pronunciation
    ) {
        if (vocabulary.isBlank() && grammar.isBlank() && pronunciation.isBlank()) {
            return null;
        }

        Map<String, Object> lessonInfo = new LinkedHashMap<>();
        lessonInfo.put("title", lesson.getTitle());
        lessonInfo.put("level", lesson.getUnit().getLevel().getId());
        lessonInfo.put("unitTitle", lesson.getUnit().getTitle());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("lesson", lessonInfo);
        payload.put("vocabularyText", vocabulary);
        payload.put("grammarText", grammar);
        payload.put("pronunciationText", pronunciation);
        payload.put("language", language.name().toLowerCase());
        payload.put("maxSlides", 10);

        JsonNode request = objectMapper.valueToTree(payload);
        return agentsClient.generateSlides(request)
                .filter(response -> isValidAgentDeck(response, vocabulary, grammar, pronunciation))
                .map(JsonNode::toString)
                .orElse(null);
    }

    private boolean isValidAgentDeck(
            JsonNode response,
            String vocabulary,
            String grammar,
            String pronunciation
    ) {
        JsonNode slides = response.get("slides");
        if (slides == null || !slides.isArray() || slides.size() < 3 || slides.size() > 10) {
            return false;
        }

        java.util.Set<String> kinds = new java.util.HashSet<>();
        for (JsonNode slide : slides) {
            String kind = slide.path("kind").asText("");
            if (!Set.of("intro", "vocabulary", "grammar", "pronunciation", "recap").contains(kind)) {
                return false;
            }
            kinds.add(kind);
            JsonNode bullets = slide.get("bullets");
            if (bullets == null || !bullets.isArray() || bullets.size() < 1 || bullets.size() > 5) {
                return false;
            }
            JsonNode exercise = slide.get("miniExercise");
            if (exercise != null && !exercise.isNull()) {
                JsonNode options = exercise.get("options");
                String answer = exercise.path("answer").asText("");
                if (options == null || !options.isArray() || options.size() < 2
                        || options.size() > 4 || answer.isBlank()) {
                    return false;
                }
                boolean answerFound = false;
                for (JsonNode option : options) {
                    if (answer.equals(option.asText())) {
                        answerFound = true;
                        break;
                    }
                }
                if (!answerFound) {
                    return false;
                }
            }
        }
        return (!vocabulary.isBlank() && kinds.contains("vocabulary")
                || vocabulary.isBlank())
                && (!grammar.isBlank() && kinds.contains("grammar") || grammar.isBlank())
                && (!pronunciation.isBlank() && kinds.contains("pronunciation")
                || pronunciation.isBlank());
    }

    private void addContentSlides(
            List<Map<String, Object>> slides,
            String title,
            String text,
            String hint
    ) {
        if (text == null || text.isBlank()) {
            return;
        }
        String[] chunks = text.split("\\R{2,}|\\n");
        int added = 0;
        for (String chunk : chunks) {
            String body = chunk.trim();
            if (body.isEmpty()) {
                continue;
            }
            if (body.length() > 400) {
                body = body.substring(0, 400) + "…";
            }
            slides.add(slide(slides.size(), title, body, hint));
            added++;
            if (added == 4) {
                break;
            }
        }
    }

    private Map<String, Object> slide(int index, String title, String body, String hint) {
        Map<String, Object> slide = new LinkedHashMap<>();
        slide.put("index", index);
        slide.put("title", title);
        slide.put("body", body);
        slide.put("hint", hint);
        return slide;
    }

    private String textOf(List<LessonResource> resources, LessonResourceType type) {
        return resources.stream()
                .filter(resource -> resource.getType() == type)
                .map(LessonResource::getExtractedText)
                .filter(text -> text != null && !text.isBlank())
                .findFirst()
                .orElse("");
    }

    private String buildWritingFeedback(String text) {
        int words = text.trim().isEmpty() ? 0 : text.trim().split("\\s+").length;
        return "Thanks for your writing (" + words + " words). "
                + "Check your capital letters and try to use full sentences. "
                + "A richer AI review will be added when the writing agent is connected.";
    }
}
