package com.levelup.backend.resource.dto;

import java.time.Instant;

public record SaveLessonResourcesResponse(
        Long lessonId,
        Instant savedAt
) {}