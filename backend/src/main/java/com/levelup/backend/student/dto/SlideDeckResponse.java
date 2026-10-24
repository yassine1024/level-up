package com.levelup.backend.student.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record SlideDeckResponse(
        Long lessonId,
        boolean cached,
        int contentVersion,
        String language,
        JsonNode slides
) {
}
