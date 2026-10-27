package com.levelup.backend.student.dto;

import java.util.Map;

public record PlacementAttemptResponse(
        Long attemptId,
        int score,
        int totalQuestions,
        String assignedLevelId,
        String assignedLevelName,
        Map<String, String> summary
) {
}
