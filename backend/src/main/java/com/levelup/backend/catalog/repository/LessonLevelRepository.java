package com.levelup.backend.catalog.repository;

import com.levelup.backend.catalog.entity.LessonLevel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonLevelRepository
        extends JpaRepository<LessonLevel, String> {
}