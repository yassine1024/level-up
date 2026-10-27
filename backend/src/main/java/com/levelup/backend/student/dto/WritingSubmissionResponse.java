package com.levelup.backend.student.dto;

import java.util.List;

public record WritingSubmissionResponse(
        Long submissionId,
        Long lessonId,
        String text,
        String feedback,
        String headline,
        String correctedText,
        List<WritingCorrectionResponse> corrections
) {
}
