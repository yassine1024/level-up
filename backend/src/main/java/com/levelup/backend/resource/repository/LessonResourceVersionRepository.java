package com.levelup.backend.resource.repository;

import com.levelup.backend.resource.entity.LessonResourceVersion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonResourceVersionRepository extends JpaRepository<LessonResourceVersion, Long> {
}