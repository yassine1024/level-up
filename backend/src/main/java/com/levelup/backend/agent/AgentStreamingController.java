package com.levelup.backend.agent;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/agents")
public class AgentStreamingController {

    private final WebClient agentWebClient;

    public AgentStreamingController(WebClient agentWebClient) {
        this.agentWebClient = agentWebClient;
    }

    public record StreamRequest(String prompt) {}

    @PostMapping(
            value = "/stream",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public ResponseEntity<StreamingResponseBody> stream(
            @RequestBody StreamRequest request) {

        if (request.prompt() == null
                || request.prompt().isBlank()
                || request.prompt().length() > 8000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Prompt must contain between 1 and 8000 characters."
            );
        }

        StreamingResponseBody responseBody = outputStream -> {

            Flux<DataBuffer> chunks = agentWebClient.post()
                    .uri("/api/agents/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("prompt", request.prompt()))
                    .exchangeToFlux(response -> {
                        if (response.statusCode().isError()) {
                            return response.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMapMany(message ->
                                            Flux.<DataBuffer>error(
                                                    new IllegalStateException(
                                                            "Agent service returned HTTP "
                                                                    + response.statusCode().value()
                                                                    + ": " + message
                                                    )
                                            )
                                    );
                        }

                        return response.bodyToFlux(DataBuffer.class);
                    });

            chunks.doOnNext(buffer -> {
                try {
                    byte[] bytes = new byte[buffer.readableByteCount()];
                    buffer.read(bytes);

                    outputStream.write(bytes);
                    outputStream.flush();
                } catch (IOException exception) {
                    throw new UncheckedIOException(exception);
                } finally {
                    DataBufferUtils.release(buffer);
                }
            }).blockLast();
        };

        return ResponseEntity.ok()
                .contentType(new MediaType(
                        "text",
                        "plain",
                        StandardCharsets.UTF_8
                ))
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-transform")
                .header("X-Accel-Buffering", "no")
                .body(responseBody);
    }
}