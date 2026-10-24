package com.levelup.backend.student.dto;

public record PlacementAttemptResponse(
        Long attemptId,
        int score,
        int totalQuestions,
        String assignedLevelId,
        String assignedLevelName
) {
}
