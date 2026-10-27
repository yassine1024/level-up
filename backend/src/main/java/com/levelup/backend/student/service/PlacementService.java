package com.levelup.backend.student.service;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.LessonLevel;
import com.levelup.backend.catalog.repository.LessonLevelRepository;
import com.levelup.backend.student.dto.PlacementAnswerRequest;
import com.levelup.backend.student.dto.PlacementAttemptRequest;
import com.levelup.backend.student.dto.PlacementAttemptResponse;
import com.levelup.backend.student.dto.PlacementQuestionResponse;
import com.levelup.backend.student.entity.PlacementAnswer;
import com.levelup.backend.student.entity.PlacementAttempt;
import com.levelup.backend.student.entity.PlacementQuestion;
import com.levelup.backend.student.entity.StudentMistake;
import com.levelup.backend.student.entity.MistakeSource;
import com.levelup.backend.student.repository.PlacementAnswerRepository;
import com.levelup.backend.student.repository.PlacementAttemptRepository;
import com.levelup.backend.student.repository.PlacementQuestionRepository;
import com.levelup.backend.student.repository.StudentMistakeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PlacementService {

    private final PlacementQuestionRepository questionRepository;
    private final PlacementAttemptRepository attemptRepository;
    private final PlacementAnswerRepository answerRepository;
    private final LessonLevelRepository levelRepository;
    private final StudentMistakeRepository mistakeRepository;

    public PlacementService(
            PlacementQuestionRepository questionRepository,
            PlacementAttemptRepository attemptRepository,
            PlacementAnswerRepository answerRepository,
            LessonLevelRepository levelRepository,
            StudentMistakeRepository mistakeRepository
    ) {
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.levelRepository = levelRepository;
        this.mistakeRepository = mistakeRepository;
    }

    @Transactional(readOnly = true)
    public List<PlacementQuestionResponse> getQuestions() {
        return questionRepository.findAllByOrderBySortOrderAsc().stream()
                .map(question -> new PlacementQuestionResponse(
                        question.getId(),
                        question.getPrompt(),
                        question.getOptionA(),
                        question.getOptionB(),
                        question.getOptionC(),
                        question.getOptionD(),
                        question.getSortOrder()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<PlacementAttempt> latestAttempt(Long userId) {
        return attemptRepository.findFirstByUser_IdOrderByCompletedAtDesc(userId);
    }

    @Transactional
    public PlacementAttemptResponse submitAttempt(User user, PlacementAttemptRequest request) {
        List<PlacementQuestion> questions = questionRepository.findAllByOrderBySortOrderAsc();
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Placement test is not ready");
        }

        Map<Long, PlacementQuestion> byId = questions.stream()
                .collect(Collectors.toMap(PlacementQuestion::getId, Function.identity()));

        Set<Long> answeredIds = new HashSet<>();
        for (PlacementAnswerRequest answer : request.answers()) {
            if (!answeredIds.add(answer.questionId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate answer for a question");
            }
            if (!byId.containsKey(answer.questionId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown question: " + answer.questionId());
            }
        }
        if (answeredIds.size() != questions.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer every placement question");
        }

        int score = 0;
        for (PlacementAnswerRequest submitted : request.answers()) {
            PlacementQuestion question = byId.get(submitted.questionId());
            if (submitted.selectedOption().toUpperCase().equals(question.getCorrectOption())) {
                score++;
            }
        }

        LessonLevel assignedLevel = assignLevel(score, questions.size());
        PlacementAttempt attempt = attemptRepository.save(
                new PlacementAttempt(user, score, questions.size(), assignedLevel)
        );

        for (PlacementAnswerRequest submitted : request.answers()) {
            PlacementQuestion question = byId.get(submitted.questionId());
            String selected = submitted.selectedOption().toUpperCase();
            boolean correct = selected.equals(question.getCorrectOption());
            answerRepository.save(new PlacementAnswer(attempt, question, selected, correct));
            if (!correct) {
                mistakeRepository.save(new StudentMistake(
                        user,
                        null,
                        question.getPrompt(),
                        selected,
                        question.getCorrectOption(),
                        question.getExplanation(),
                        question.getFocus(),
                        MistakeSource.PLACEMENT
                ));
            }
        }

        return new PlacementAttemptResponse(
                attempt.getId(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                assignedLevel.getId(),
                assignedLevel.getName()
        );
    }

    private LessonLevel assignLevel(int score, int total) {
        int percent = total == 0 ? 0 : (score * 100) / total;
        String preferredCode;
        if (percent >= 80) {
            preferredCode = "B1";
        } else if (percent >= 50) {
            preferredCode = "A2";
        } else {
            preferredCode = "A1";
        }

        return levelRepository.findById(preferredCode)
                .or(() -> levelRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder")).stream().findFirst())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "No course levels are available"
                ));
    }
}
