package com.levelup.backend.student.dto;

import java.time.Instant;

public record MistakeResponse(
        Long id,
        Long lessonId,
        String prompt,
        String studentAnswer,
        String correction,
        String explanation,
        Instant createdAt
) {
}
