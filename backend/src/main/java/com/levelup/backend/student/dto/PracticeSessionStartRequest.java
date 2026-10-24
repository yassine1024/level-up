package com.levelup.backend.student.dto;

import com.levelup.backend.student.entity.GameType;
import jakarta.validation.constraints.NotNull;

public record PracticeSessionStartRequest(
        @NotNull GameType gameType
) {
}
