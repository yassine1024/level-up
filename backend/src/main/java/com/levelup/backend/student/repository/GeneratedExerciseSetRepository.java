package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.GameType;
import com.levelup.backend.student.entity.GeneratedExerciseSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeneratedExerciseSetRepository extends JpaRepository<GeneratedExerciseSet, Long> {

    Optional<GeneratedExerciseSet> findByLesson_IdAndContentVersionAndGameType(
            Long lessonId,
            int contentVersion,
            GameType gameType
    );
}
