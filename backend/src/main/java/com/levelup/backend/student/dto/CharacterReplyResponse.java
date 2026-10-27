package com.levelup.backend.student.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record CharacterReplyResponse(
        Long episodeId,
        String reply,
        String emotion,
        JsonNode correction,
        JsonNode nextInput,
        boolean episodeComplete
) {
}
