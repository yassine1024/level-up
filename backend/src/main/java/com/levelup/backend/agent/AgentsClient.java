package com.levelup.backend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * The only backend boundary for calls to the internal agents service.
 *
 * Every call writes one row to `generation_runs` (fail-safe: a logging failure
 * never breaks the caller). Pass a {@link RunContext} to link the run to a
 * lesson/user; callers that do not have context may use the no-context
 * overloads, which still log an unlinked run.
 */
public class AgentsClient {

    private static final Logger logger = LoggerFactory.getLogger(AgentsClient.class);

    private final WebClient webClient;
    private final GenerationRunService runService;
    private final ObjectMapper objectMapper;

    private static final ThreadLocal<Long> LAST_RUN_ID = new ThreadLocal<>();

    public AgentsClient(WebClient webClient) {
        this(webClient, null, new ObjectMapper());
    }

    public AgentsClient(WebClient webClient, GenerationRunService runService, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.runService = runService;
        this.objectMapper = objectMapper == null ? new ObjectMapper() : objectMapper;
    }

    public Optional<HealthResponse> health() {
        return get("/api/health", HealthResponse.class, null, "health", null);
    }

    public Optional<JsonNode> evaluatePlacement(JsonNode request) {
        return evaluatePlacement(request, null);
    }

    public Optional<JsonNode> evaluatePlacement(JsonNode request, RunContext context) {
        return execute("placement", "/api/agents/placement/evaluate", request, context);
    }

    public Optional<JsonNode> generateSlides(JsonNode request) {
        return generateSlides(request, null);
    }

    public Optional<JsonNode> generateSlides(JsonNode request, RunContext context) {
        return execute("slides", "/api/agents/slides/generate", request, context);
    }

    public Optional<JsonNode> generatePracticeQuestions(JsonNode request) {
        return generatePracticeQuestions(request, null);
    }

    public Optional<JsonNode> generatePracticeQuestions(JsonNode request, RunContext context) {
        return execute("practice", "/api/agents/practice/questions", request, context);
    }

    public Optional<JsonNode> checkPracticeAnswer(JsonNode request) {
        return checkPracticeAnswer(request, null);
    }

    public Optional<JsonNode> checkPracticeAnswer(JsonNode request, RunContext context) {
        return execute("practice", "/api/agents/practice/check-answer", request, context);
    }

    public Optional<JsonNode> generateWritingFeedback(JsonNode request) {
        return generateWritingFeedback(request, null);
    }

    public Optional<JsonNode> generateWritingFeedback(JsonNode request, RunContext context) {
        return execute("writing", "/api/agents/writing/feedback", request, context);
    }

    public Optional<JsonNode> createCharacterEpisode(JsonNode request) {
        return createCharacterEpisode(request, null);
    }

    public Optional<JsonNode> createCharacterEpisode(JsonNode request, RunContext context) {
        return execute("character", "/api/agents/character/episode", request, context);
    }

    public Optional<JsonNode> createCharacterReply(JsonNode request) {
        return createCharacterReply(request, null);
    }

    public Optional<JsonNode> createCharacterReply(JsonNode request, RunContext context) {
        return execute("character", "/api/agents/character/reply", request, context);
    }

    public Optional<JsonNode> transcribeSpeech(JsonNode request) {
        return transcribeSpeech(request, null);
    }

    public Optional<JsonNode> transcribeSpeech(JsonNode request, RunContext context) {
        return execute("speech", "/api/agents/speech/transcribe", request, context);
    }

    private Optional<JsonNode> execute(String agent, String path, JsonNode request, RunContext context) {
        LAST_RUN_ID.remove();
        long start = System.currentTimeMillis();
        String inputHash = sha256(request == null ? "" : request.toString());
        RunContext ctx = context == null ? RunContext.of(agent, path) : context;

        try {
            JsonNode body = webClient.post()
                    .uri(path)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            long latency = System.currentTimeMillis() - start;
            int attempts = 1;
            List<String> problems = new ArrayList<>();
            String model = null;
            Integer tokenUsage = null;
            if (body != null && body.has("meta") && body.get("meta").isObject()) {
                JsonNode meta = body.get("meta");
                attempts = meta.path("attempts").asInt(1);
                model = meta.path("model").asText(null);
                if (model != null && model.isBlank()) model = null;
                tokenUsage = meta.has("tokenUsage") && !meta.get("tokenUsage").isNull()
                        ? meta.get("tokenUsage").asInt() : null;
                if (meta.has("validationProblems") && meta.get("validationProblems").isArray()) {
                    for (JsonNode p : meta.get("validationProblems")) {
                        problems.add(p.asText());
                    }
                }
            }

            GenerationRunStatus status = attempts > 1
                    ? GenerationRunStatus.ACCEPTED_AFTER_RETRY
                    : GenerationRunStatus.ACCEPTED;

            persistRun(ctx, agent, path, status, attempts, problems, body == null ? null : body.toString(),
                    null, null, model, latency, tokenUsage, false, inputHash);

            return Optional.ofNullable(body);
        } catch (WebClientResponseException exception) {
            long latency = System.currentTimeMillis() - start;
            HttpStatusCode status = exception.getStatusCode();
            int code = status.value();
            GenerationRunStatus runStatus;
            boolean fallbackUsed;
            List<String> problems = parseProblems(exception.getResponseBodyAsString());

            if (code == 502 || code == 503) {
                runStatus = GenerationRunStatus.FALLBACK_USED;
                fallbackUsed = true;
            } else if (code == 422) {
                runStatus = GenerationRunStatus.REJECTED_VALIDATION;
                fallbackUsed = true;
            } else {
                runStatus = GenerationRunStatus.ERROR;
                fallbackUsed = false;
            }

            persistRun(ctx, agent, path, runStatus, 1, problems, null, code,
                    shortMessage(exception), null, latency, null, fallbackUsed, inputHash);

            if (runStatus == GenerationRunStatus.FALLBACK_USED
                    || runStatus == GenerationRunStatus.REJECTED_VALIDATION) {
                return Optional.empty();
            }
            throw exception;
        } catch (WebClientRequestException exception) {
            long latency = System.currentTimeMillis() - start;
            persistRun(ctx, agent, path, GenerationRunStatus.FALLBACK_USED, 1, List.of(),
                    null, 503, "Agents service unavailable", null, latency, null, true, inputHash);
            logger.warn("Agents service unavailable for {}", path, exception);
            return Optional.empty();
        } catch (RuntimeException exception) {
            long latency = System.currentTimeMillis() - start;
            persistRun(ctx, agent, path, GenerationRunStatus.ERROR, 1, List.of(),
                    null, 500, shortMessage(exception), null, latency, null, false, inputHash);
            throw exception;
        }
    }

    private <T> Optional<T> get(String path, Class<T> responseType, RunContext context, String agent, RunContext ignored) {
        long start = System.currentTimeMillis();
        RunContext ctx = context == null ? RunContext.of(agent, path) : context;
        String inputHash = sha256("");
        try {
            T body = webClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(responseType)
                    .block();
            long latency = System.currentTimeMillis() - start;
            persistRun(ctx, agent == null ? "health" : agent, path, GenerationRunStatus.ACCEPTED, 1,
                    List.of(), body == null ? null : body.toString(), null, null, null, latency, null, false, inputHash);
            return Optional.ofNullable(body);
        } catch (WebClientResponseException exception) {
            long latency = System.currentTimeMillis() - start;
            persistRun(ctx, agent == null ? "health" : agent, path, GenerationRunStatus.FALLBACK_USED, 1,
                    List.of(), null, exception.getStatusCode().value(), shortMessage(exception),
                    null, latency, null, true, inputHash);
            return Optional.empty();
        } catch (WebClientRequestException exception) {
            long latency = System.currentTimeMillis() - start;
            persistRun(ctx, agent == null ? "health" : agent, path, GenerationRunStatus.FALLBACK_USED, 1,
                    List.of(), null, 503, "Agents service unavailable", null, latency, null, true, inputHash);
            logger.warn("Agents service unavailable for {}", path, exception);
            return Optional.empty();
        }
    }

    private void persistRun(RunContext ctx, String agent, String path, GenerationRunStatus status,
                            int attempts, List<String> problems, String outputJson, Integer errorCode,
                            String errorMessage, String model, Long latencyMs, Integer tokenUsage,
                            boolean fallbackUsed, String inputHash) {
        if (runService == null) return;
        try {
            GenerationRun run = new GenerationRun(agent, path, status);
            run.setEndpoint(path);
            run.setAgent(agent);
            run.setLessonId(ctx.lessonId());
            run.setContentVersion(ctx.contentVersion());
            run.setGameType(ctx.gameType());
            run.setTriggeredByUserId(ctx.triggeredByUserId());
            run.setTriggeredByRole(ctx.triggeredByRole());
            run.setInputRef(ctx.inputRef());
            run.setInputHash(inputHash);
            run.setAttempts(attempts);
            run.setValidationProblems(problems == null || problems.isEmpty() ? null : String.join("\n", problems));
            run.setOutputJson(outputJson);
            run.setErrorCode(errorCode);
            run.setErrorMessage(errorMessage);
            run.setModel(model);
            run.setLatencyMs(latencyMs);
            run.setTokenUsage(tokenUsage);
            run.setFallbackUsed(fallbackUsed);
            GenerationRun saved = runService.save(run);
            if (saved != null && saved.getId() != null) {
                LAST_RUN_ID.set(saved.getId());
            }
        } catch (RuntimeException exception) {
            logger.warn("Failed to persist generation run for {}", path, exception);
        }
    }

    private List<String> parseProblems(String body) {
        List<String> problems = new ArrayList<>();
        if (body == null || body.isBlank()) return problems;
        try {
            JsonNode node = objectMapper.readTree(body);
            if (node.has("validationProblems") && node.get("validationProblems").isArray()) {
                for (JsonNode p : node.get("validationProblems")) problems.add(p.asText());
            } else if (node.has("detail")) {
                problems.add(node.get("detail").asText());
            }
        } catch (Exception ignored) {
            problems.add(body.length() > 500 ? body.substring(0, 500) : body);
        }
        return problems;
    }

    private String shortMessage(Exception exception) {
        String message = exception.getMessage();
        if (message == null) return exception.getClass().getSimpleName();
        return message.length() > 500 ? message.substring(0, 500) : message;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception exception) {
            return null;
        }
    }

    public Long lastRunId() {
        return LAST_RUN_ID.get();
    }

    public record HealthResponse(String status, String service) {
    }
}