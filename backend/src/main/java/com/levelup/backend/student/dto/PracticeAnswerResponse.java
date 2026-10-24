package com.levelup.backend.student.dto;

public record PracticeAnswerResponse(
        int questionIndex,
        boolean correct,
        String correction,
        String explanation
) {
}
