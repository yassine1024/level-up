package com.levelup.backend.agent;

public enum GenerationRunStatus {
    ACCEPTED,
    ACCEPTED_AFTER_RETRY,
    REJECTED_VALIDATION,
    FALLBACK_USED,
    ERROR
}