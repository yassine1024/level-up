package com.levelup.backend.exception;

import java.time.Instant;

// DTO for error response
public record ErrorResponse(Instant timestamp, int status, String error, String message, String path) {}