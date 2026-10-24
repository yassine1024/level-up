package com.levelup.backend.student.dto;

public record WritingSubmissionResponse(
        Long submissionId,
        Long lessonId,
        String text,
        String feedback
) {
}
