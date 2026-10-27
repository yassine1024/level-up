package com.levelup.backend.student.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PracticeSessionService {

    private final PracticeSessionRepository sessionRepository;
    private final PracticeAnswerRepository answerRepository;
    private final LessonLookupService lessonLookupService;
    private final GeneratedContentService contentService;
    private final StudentMistakeRepository mistakeRepository;
    private final ObjectMapper objectMapper;

    public PracticeSessionService(
            PracticeSessionRepository sessionRepository,
            PracticeAnswerRepository answerRepository,
            LessonLookupService lessonLookupService,
            GeneratedContentService contentService,
            StudentMistakeRepository mistakeRepository,
            ObjectMapper objectMapper
    ) {
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.lessonLookupService = lessonLookupService;
        this.contentService = contentService;
        this.mistakeRepository = mistakeRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PracticeSessionResponse start(User user, Long lessonId, GameType gameType) {
        Lesson lesson = lessonLookupService.requirePublished(lessonId);
        String questionsJson = contentService.exercisesFor(lesson, gameType);
        PracticeSession session = sessionRepository.save(
                new PracticeSession(user, lesson, gameType, questionsJson)
        );

        List<PracticeQuestionResponse> questions = contentService.parseQuestions(questionsJson).stream()
                .map(question -> new PracticeQuestionResponse(
                        ((Number) question.get("index")).intValue(),
                        (String) question.get("prompt"),
                        castOptions(question.get("options"))
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
        String explanation = question.get("explanation") == null ? null : String.valueOf(question.get("explanation"));
        String prompt = question.get("prompt") == null ? null : String.valueOf(question.get("prompt"));

        boolean correct = request.answer().trim().equalsIgnoreCase(correctAnswer.trim());
        String correction = correct ? null : correctAnswer;

        answerRepository.save(new PracticeAnswer(
                session,
                request.questionIndex(),
                request.answer(),
                correct,
                correction,
                explanation
        ));

        if (!correct) {
            String focus = question.get("focus") == null
                    ? ""
                    : String.valueOf(question.get("focus"));
            mistakeRepository.save(new StudentMistake(
                    user,
                    session.getLesson(),
                    prompt,
                    request.answer(),
                    correctAnswer,
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
}
