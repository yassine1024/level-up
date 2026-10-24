package com.levelup.backend.student.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PlacementAttemptRequest(
        @NotEmpty @Valid List<PlacementAnswerRequest> answers
) {
}
