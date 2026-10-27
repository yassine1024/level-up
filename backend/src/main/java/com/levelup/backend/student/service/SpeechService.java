package com.levelup.backend.student.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.levelup.backend.agent.AgentsClient;
import com.levelup.backend.student.dto.SpeechTranscriptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Set;

@Service
public class SpeechService {

    private static final long MAX_AUDIO_BYTES = 10 * 1024 * 1024;
    private static final Set<String> AUDIO_TYPES = Set.of(
            "audio/wav", "audio/x-wav", "audio/wave",
            "audio/mp3", "audio/mpeg",
            "audio/aiff", "audio/x-aiff",
            "audio/aac", "audio/ogg", "audio/flac", "audio/x-flac",
            "audio/m4a", "audio/x-m4a", "audio/mp4",
            "audio/opus", "audio/webm"
    );

    private final AgentsClient agentsClient;

    public SpeechService(AgentsClient agentsClient) {
        this.agentsClient = agentsClient;
    }

    public SpeechTranscriptionResponse transcribe(MultipartFile audio) {
        validate(audio);
        JsonNode response;
        try {
            response = agentsClient.transcribeSpeech(audio).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "Speech transcription service is unavailable"
                    ));
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Could not read the audio recording",
                    exception
            );
        }
        return new SpeechTranscriptionResponse(
                response.path("text").asText(""),
                response.path("language").asText("")
        );
    }

    private void validate(MultipartFile audio) {
        if (audio == null || audio.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The audio file is empty.");
        }
        if (audio.getSize() > MAX_AUDIO_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Audio is larger than 10 MB.");
        }
        String contentType = audio.getContentType();
        if (contentType == null || !AUDIO_TYPES.contains(contentType.split(";")[0].trim().toLowerCase())) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported audio type: " + contentType
            );
        }
    }
}
