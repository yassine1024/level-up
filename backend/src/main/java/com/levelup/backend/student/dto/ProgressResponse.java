package com.levelup.backend.student.dto;

public record ProgressResponse(
        Long lessonId,
        String status,
        int lastSlideIndex
) {
}
