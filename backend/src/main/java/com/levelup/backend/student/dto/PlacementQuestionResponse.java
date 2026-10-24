package com.levelup.backend.student.dto;

public record PlacementQuestionResponse(
        Long id,
        String prompt,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        int sortOrder
) {
}
