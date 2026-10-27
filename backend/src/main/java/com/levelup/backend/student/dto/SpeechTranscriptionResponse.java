package com.levelup.backend.student.dto;

public record SpeechTranscriptionResponse(
        String text,
        String language
) {
}
