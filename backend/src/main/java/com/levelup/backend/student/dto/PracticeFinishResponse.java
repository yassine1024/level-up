package com.levelup.backend.student.dto;

public record PracticeFinishResponse(
        Long sessionId,
        int score,
        int totalQuestions,
        String summary
) {
}
