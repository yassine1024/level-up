package com.levelup.backend.student.dto;

import jakarta.validation.constraints.Size;

public record CharacterEpisodeStartRequest(
        @Size(max = 40) String characterRole,
        @Size(max = 300) String scenario
) {
}
