package com.levelup.backend.student.dto;

import java.util.List;

public record PracticeQuestionResponse(
        int index,
        String prompt,
        List<String> options
) {
}
