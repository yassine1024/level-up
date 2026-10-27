package com.levelup.backend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;

import java.io.IOException;
import java.util.Optional;

/**
 * The only backend boundary for calls to the internal agents service.
 *
 * Endpoint-specific request and response DTOs can be added as each backend
 * service is wired to an agent. Keeping the fallback here makes model
 * availability an implementation detail of the callers.
 */
public class AgentsClient {

    private static final Logger logger = LoggerFactory.getLogger(AgentsClient.class);

    private final WebClient webClient;

    public AgentsClient(WebClient agentWebClient) {
        this.webClient = agentWebClient;
    }

    public Optional<HealthResponse> health() {
        return get("/api/health", HealthResponse.class);
    }

    public Optional<JsonNode> evaluatePlacement(JsonNode request) {
        return post("/api/agents/placement/evaluate", request);
    }

    public Optional<JsonNode> generateSlides(JsonNode request) {
        return post("/api/agents/slides/generate", request);
    }

    public Optional<JsonNode> generatePracticeQuestions(JsonNode request) {
        return post("/api/agents/practice/questions", request);
    }

    public Optional<JsonNode> checkPracticeAnswer(JsonNode request) {
        return post("/api/agents/practice/check-answer", request);
    }

    public Optional<JsonNode> generateWritingFeedback(JsonNode request) {
        return post("/api/agents/writing/feedback", request);
    }

    public Optional<JsonNode> createCharacterEpisode(JsonNode request) {
        return post("/api/agents/character/episode", request);
    }

    public Optional<JsonNode> createCharacterReply(JsonNode request) {
        return post("/api/agents/character/reply", request);
    }

    public Optional<JsonNode> transcribeSpeech(MultipartFile audio) throws IOException {
        MultipartBodyBuilder body = new MultipartBodyBuilder();
        body.part("audio", audio.getResource())
                .filename(audio.getOriginalFilename())
                .contentType(MediaType.parseMediaType(audio.getContentType()));
        try {
            return Optional.ofNullable(webClient.post()
                    .uri("/api/agents/speech/transcribe")
                    .body(BodyInserters.fromMultipartData(body.build()))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block());
        } catch (WebClientResponseException exception) {
            return fallback("/api/agents/speech/transcribe", exception);
        } catch (WebClientRequestException exception) {
            logger.warn("Agents service unavailable for /api/agents/speech/transcribe", exception);
            return Optional.empty();
        }
    }

    private <T> Optional<T> get(String path, Class<T> responseType) {
        try {
            return Optional.ofNullable(webClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(responseType)
                    .block());
        } catch (WebClientResponseException exception) {
            return fallback(path, exception);
        } catch (WebClientRequestException exception) {
            logger.warn("Agents service unavailable for {}", path, exception);
            return Optional.empty();
        }
    }

    private Optional<JsonNode> post(String path, JsonNode request) {
        try {
            return Optional.ofNullable(webClient.post()
                    .uri(path)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block());
        } catch (WebClientResponseException exception) {
            return fallback(path, exception);
        } catch (WebClientRequestException exception) {
            logger.warn("Agents service unavailable for {}", path, exception);
            return Optional.empty();
        }
    }

    private <T> Optional<T> fallback(String path, WebClientResponseException exception) {
        HttpStatusCode status = exception.getStatusCode();
        if (status.value() == 502 || status.value() == 503) {
            logger.warn("Agents service returned {} for {}; using fallback", status.value(), path);
            return Optional.empty();
        }
        throw exception;
    }

    public record HealthResponse(String status, String service) {
    }
}
