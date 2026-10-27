package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.CharacterEpisode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CharacterEpisodeRepository extends JpaRepository<CharacterEpisode, Long> {

    List<CharacterEpisode> findAllByStudent_IdAndLesson_IdOrderByCreatedAtDesc(
            Long studentId,
            Long lessonId
    );
}
