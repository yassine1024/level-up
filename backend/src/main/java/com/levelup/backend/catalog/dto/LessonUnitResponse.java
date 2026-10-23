package com.levelup.backend.catalog.dto;

public record LessonUnitResponse(
        Long id,
        String levelId,
        int number,
        String title
) {
}