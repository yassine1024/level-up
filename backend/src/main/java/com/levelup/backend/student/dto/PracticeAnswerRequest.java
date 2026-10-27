package com.levelup.backend.student.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PracticeAnswerRequest(
        @NotNull @Min(0) Integer questionIndex,
        @NotBlank String answer,
        boolean spoken
) {
}
