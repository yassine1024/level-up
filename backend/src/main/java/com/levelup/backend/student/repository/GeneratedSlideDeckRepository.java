package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.ExplanationLanguage;
import com.levelup.backend.student.entity.GeneratedSlideDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GeneratedSlideDeckRepository extends JpaRepository<GeneratedSlideDeck, Long> {

    Optional<GeneratedSlideDeck> findByLesson_IdAndContentVersionAndLanguage(
            Long lessonId,
            int contentVersion,
            ExplanationLanguage language
    );
}
