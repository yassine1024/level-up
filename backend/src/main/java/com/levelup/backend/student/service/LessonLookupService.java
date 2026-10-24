package com.levelup.backend.student.service;

import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.repository.LessonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LessonLookupService {

    private final LessonRepository lessonRepository;

    public LessonLookupService(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    public Lesson requirePublished(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        if (!lesson.isPublished()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found");
        }
        return lesson;
    }
}
