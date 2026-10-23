package com.levelup.backend.catalog.dto;

public record LessonResponse(
        Long id,
        Long unitId,
        int number,
        String title
) {
}