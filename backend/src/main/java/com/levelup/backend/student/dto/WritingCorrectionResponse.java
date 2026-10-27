package com.levelup.backend.student.dto;

public record WritingCorrectionResponse(
        String category,
        String sentence,
        String wrong,
        String right,
        String explanation,
        String focus
) {
}
