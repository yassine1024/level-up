package com.levelup.backend.student.dto;

import java.util.List;

public record PracticeSessionResponse(
        Long sessionId,
        Long lessonId,
        String gameType,
        List<PracticeQuestionResponse> questions
) {
}
