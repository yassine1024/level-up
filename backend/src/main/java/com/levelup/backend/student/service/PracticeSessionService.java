package com.levelup.backend.student.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.levelup.backend.agent.AgentsClient;
import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.student.dto.PracticeAnswerRequest;
import com.levelup.backend.student.dto.PracticeAnswerResponse;
import com.levelup.backend.student.dto.PracticeFinishResponse;
import com.levelup.backend.student.dto.PracticeQuestionResponse;
import com.levelup.backend.student.dto.PracticeSessionResponse;
import com.levelup.backend.student.entity.GameType;
import com.levelup.backend.student.entity.PracticeAnswer;
import com.levelup.backend.student.entity.PracticeSession;
import com.levelup.backend.student.entity.MistakeSource;
import com.levelup.backend.student.entity.StudentMistake;
import com.levelup.backend.student.repository.PracticeAnswerRepository;
import com.levelup.backend.student.repository.PracticeSessionRepository;
import com.levelup.backend.student.repository.StudentMistakeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PracticeSessionService {

    private static final Logger logger = LoggerFactory.getLogger(PracticeSessionService.class);
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^\\p{L}\\p{N}']+");
    private static final Pattern CONTRACTION = Pattern.compile(
            "\\b(i'm|you're|we're|they're|he's|she's|it's|that's|there's|what's|where's|who's"
                    + "|isn't|aren't|wasn't|weren't|don't|doesn't|didn't|haven't|hasn't|hadn't"
                    + "|can't|couldn't|won't|wouldn't|shouldn't|i've|you've|we've|they've"
                    + "|i'll|you'll|he'll|she'll|we'll|they'll|i'd|let's)\\b"
    );

    private final PracticeSessionRepository sessionRepository;
    private final PracticeAnswerRepository answerRepository;
    private final LessonLookupService lessonLookupService;
    private final GeneratedContentService contentService;
    private final StudentMistakeRepository mistakeRepository;
    private final AgentsClient agentsClient;
    private final ObjectMapper objectMapper;

    public PracticeSessionService(
            PracticeSessionRepository sessionRepository,
            PracticeAnswerRepository answerRepository,
            LessonLookupService lessonLookupService,
            GeneratedContentService contentService,
            StudentMistakeRepository mistakeRepository,
            AgentsClient agentsClient,
            ObjectMapper objectMapper
    ) {
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.lessonLookupService = lessonLookupService;
        this.contentService = contentService;
        this.mistakeRepository = mistakeRepository;
        this.agentsClient = agentsClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PracticeSessionResponse start(User user, Long lessonId, GameType gameType) {
        Lesson lesson = lessonLookupService.requirePublished(lessonId);
        String poolJson = contentService.exercisesFor(user, lesson, gameType);
        List<Map<String, Object>> sessionQuestions = new ArrayList<>(contentService.parseQuestions(poolJson));
        Collections.shuffle(sessionQuestions);
        sessionQuestions = new ArrayList<>(sessionQuestions.subList(0, Math.min(3, sessionQuestions.size())));
        for (int index = 0; index < sessionQuestions.size(); index++) {
            sessionQuestions.get(index).put("index", index);
        }
        String questionsJson;
        try {
            questionsJson = objectMapper.writeValueAsString(sessionQuestions);
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not start practice session");
        }
        PracticeSession session = sessionRepository.save(
                new PracticeSession(user, lesson, gameType, questionsJson)
        );

        List<PracticeQuestionResponse> questions = contentService.parseQuestions(questionsJson).stream()
                .map(question -> new PracticeQuestionResponse(
                        ((Number) question.get("index")).intValue(),
                        (String) question.get("prompt"),
                        castOptions(question.get("options")),
                        question.get("audioText") == null ? null : String.valueOf(question.get("audioText"))
                ))
                .toList();

        return new PracticeSessionResponse(
                session.getId(),
                lesson.getId(),
                gameType.name(),
                questions
        );
    }

    @Transactional
    public PracticeAnswerResponse submitAnswer(
            User user,
            Long sessionId,
            PracticeAnswerRequest request
    ) {
        PracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your practice session");
        }
        if (session.isFinished()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Practice session already finished");
        }

        List<Map<String, Object>> questions = contentService.parseQuestions(session.getQuestionsJson());
        Map<String, Object> question = questions.stream()
                .filter(candidate -> ((Number) candidate.get("index")).intValue() == request.questionIndex())
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown question index"));

        if (answerRepository.findBySession_IdAndQuestionIndex(sessionId, request.questionIndex()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Answer already submitted");
        }

        String correctAnswer = String.valueOf(question.get("correctAnswer"));
        String explanation = explanationText(question.get("explanation"));
        String prompt = question.get("prompt") == null ? null : String.valueOf(question.get("prompt"));

        List<String> acceptedAnswers = castOptions(question.get("acceptedAnswers"));
        boolean correct = normalized(request.answer()).equals(normalized(correctAnswer))
                || acceptedAnswers.stream()
                .map(this::normalized)
                .anyMatch(normalized -> normalized.equals(normalized(request.answer())));
        String correction = correct ? null : correctAnswer;
        String focus = question.get("focus") == null ? "" : String.valueOf(question.get("focus"));
        if (!correct) {
            AnswerCheckResult agentResult = checkWithAgent(
                    session,
                    prompt,
                    correctAnswer,
                    acceptedAnswers,
                    request.answer(),
                    request.spoken()
            );
            if (agentResult != null) {
                correct = agentResult.correct();
                correction = correct ? null : firstNonBlank(agentResult.correction(), correctAnswer);
                explanation = firstNonBlank(agentResult.explanation(), explanation);
                focus = firstNonBlank(agentResult.focus(), focus);
            }
        }

        answerRepository.save(new PracticeAnswer(
                session,
                request.questionIndex(),
                request.answer(),
                correct,
                correction,
                explanation
        ));

        if (!correct) {
            mistakeRepository.save(new StudentMistake(
                    user,
                    session.getLesson(),
                    prompt,
                    request.answer(),
                    correction,
                    explanation,
                    focus,
                    MistakeSource.GAME
            ));
        }

        return new PracticeAnswerResponse(
                request.questionIndex(),
                correct,
                correction,
                explanation
        );
    }

    private AnswerCheckResult checkWithAgent(
            PracticeSession session,
            String prompt,
            String correctAnswer,
            List<String> acceptedAnswers,
            String studentAnswer,
            boolean spoken
    ) {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("level", session.getLesson().getUnit().getLevel().getId());
        request.put("prompt", prompt);
        request.put("correctAnswer", correctAnswer);
        ArrayNode accepted = request.putArray("acceptedAnswers");
        acceptedAnswers.forEach(accepted::add);
        request.put("studentAnswer", studentAnswer);
        request.put("spoken", spoken);

        JsonNode response = agentsClient.checkPracticeAnswer(request).orElse(null);
        if (response == null
                || !response.path("correct").isBoolean()
                || (!response.path("correct").asBoolean()
                && (!response.path("correction").isTextual()
                || response.path("correction").asText().isBlank()))) {
            logger.warn("Agents returned an invalid answer check for practice session {}", session.getId());
            return null;
        }

        String explanation = localizedEnglish(response.get("explanation"));
        String focus = response.path("focus").isTextual() ? response.get("focus").asText() : null;
        String correction = response.path("correction").isTextual()
                ? response.get("correction").asText()
                : null;
        return new AnswerCheckResult(response.get("correct").asBoolean(), correction, explanation, focus);
    }

    private String normalized(String value) {
        String normalized = value.toLowerCase(Locale.ROOT)
                .replace('’', '\'')
                .replace('‘', '\'');
        Matcher matcher = CONTRACTION.matcher(normalized);
        StringBuffer expanded = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(expanded, Matcher.quoteReplacement(expandContraction(matcher.group(1))));
        }
        matcher.appendTail(expanded);
        normalized = expanded.toString();
        return NON_ALPHANUMERIC.matcher(normalized).replaceAll(" ")
                .replace("'", "")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String expandContraction(String contraction) {
        return switch (contraction) {
            case "i'm" -> "i am";
            case "you're" -> "you are";
            case "we're" -> "we are";
            case "they're" -> "they are";
            case "he's" -> "he is";
            case "she's" -> "she is";
            case "it's" -> "it is";
            case "that's" -> "that is";
            case "there's" -> "there is";
            case "what's" -> "what is";
            case "where's" -> "where is";
            case "who's" -> "who is";
            case "isn't" -> "is not";
            case "aren't" -> "are not";
            case "wasn't" -> "was not";
            case "weren't" -> "were not";
            case "don't" -> "do not";
            case "doesn't" -> "does not";
            case "didn't" -> "did not";
            case "haven't" -> "have not";
            case "hasn't" -> "has not";
            case "hadn't" -> "had not";
            case "can't" -> "cannot";
            case "couldn't" -> "could not";
            case "won't" -> "will not";
            case "wouldn't" -> "would not";
            case "shouldn't" -> "should not";
            case "i've" -> "i have";
            case "you've" -> "you have";
            case "we've" -> "we have";
            case "they've" -> "they have";
            case "i'll" -> "i will";
            case "you'll" -> "you will";
            case "he'll" -> "he will";
            case "she'll" -> "she will";
            case "we'll" -> "we will";
            case "they'll" -> "they will";
            case "i'd" -> "i would";
            case "let's" -> "let us";
            default -> contraction;
        };
    }

    private String localizedEnglish(JsonNode localized) {
        if (localized == null || !localized.isObject()) {
            return null;
        }
        return localized.path("en").isTextual() ? localized.get("en").asText() : null;
    }

    private String firstNonBlank(String preferred, String fallback) {
        return preferred != null && !preferred.isBlank() ? preferred : fallback;
    }

    private record AnswerCheckResult(
            boolean correct,
            String correction,
            String explanation,
            String focus
    ) {
    }

    @Transactional
    public PracticeFinishResponse finish(User user, Long sessionId) {
        PracticeSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your practice session");
        }
        if (session.isFinished()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Practice session already finished");
        }

        int totalQuestions = contentService.parseQuestions(session.getQuestionsJson()).size();
        int score = (int) answerRepository.findAllBySession_Id(sessionId).stream()
                .filter(PracticeAnswer::isCorrect)
                .count();

        session.finish(score, totalQuestions);
        sessionRepository.save(session);

        return new PracticeFinishResponse(
                sessionId,
                score,
                totalQuestions,
                "You scored " + score + " out of " + totalQuestions + "."
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> castOptions(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private String explanationText(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String text) {
            return text;
        }
        Map<?, ?> localized = objectMapper.convertValue(value, Map.class);
        Object english = localized.get("en");
        return english == null ? String.valueOf(value) : String.valueOf(english);
    }
}
