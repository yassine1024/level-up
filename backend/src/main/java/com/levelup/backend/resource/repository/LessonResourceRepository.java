package com.levelup.backend.resource.repository;

import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonResourceRepository
        extends JpaRepository<LessonResource, Long> {

    List<LessonResource> findAllByLesson_Id(Long lessonId);

    Optional<LessonResource> findByLesson_IdAndType(
            Long lessonId,
            LessonResourceType type
    );
}