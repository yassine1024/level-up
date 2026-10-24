package com.levelup.backend.student.dto;

import jakarta.validation.constraints.NotBlank;

public record WritingSubmitRequest(
        @NotBlank String text
) {
}
