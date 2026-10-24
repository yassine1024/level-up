package com.levelup.backend.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PlacementAnswerRequest(
        @NotNull Long questionId,
        @NotBlank @Pattern(regexp = "[A-Da-d]") String selectedOption
) {
}
