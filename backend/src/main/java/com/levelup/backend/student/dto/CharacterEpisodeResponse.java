package com.levelup.backend.student.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record CharacterEpisodeResponse(
        Long episodeId,
        Long lessonId,
        JsonNode episode,
        String openingLine
) {
}
