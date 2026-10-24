package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.PracticeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PracticeAnswerRepository extends JpaRepository<PracticeAnswer, Long> {

    Optional<PracticeAnswer> findBySession_IdAndQuestionIndex(Long sessionId, int questionIndex);

    List<PracticeAnswer> findAllBySession_Id(Long sessionId);

    long countBySession_IdAndCorrectTrue(Long sessionId);
}
