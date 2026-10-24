package com.levelup.backend.student.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProgressUpdateRequest(
        @NotNull @Min(0) Integer lastSlideIndex
) {
}
