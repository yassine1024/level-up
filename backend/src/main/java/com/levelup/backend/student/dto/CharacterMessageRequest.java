package com.levelup.backend.student.dto;

import jakarta.validation.constraints.NotBlank;

public record CharacterMessageRequest(
        @NotBlank String studentMessage,
        boolean spoken
) {
}
