package com.levelup.backend.agent;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "generation_runs")
public class GenerationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String agent;

    @Column(nullable = false, length = 120)
    private String endpoint;

    @Column(name = "lesson_id")
    private Long lessonId;

    @Column(name = "content_version")
    private Integer contentVersion;

    @Column(name = "game_type", length = 40)
    private String gameType;

    @Column(name = "triggered_by_user_id")
    private Long triggeredByUserId;

    @Column(name = "triggered_by_role", length = 20)
    private String triggeredByRole;

    @Column(name = "input_hash", length = 64)
    private String inputHash;

    @Column(name = "input_ref", columnDefinition = "TEXT")
    private String inputRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GenerationRunStatus status;

    @Column(nullable = false)
    private int attempts = 1;

    @Column(name = "validation_problems", columnDefinition = "TEXT")
    private String validationProblems;

    @Lob
    @Column(name = "output_json", columnDefinition = "TEXT")
    private String outputJson;

    @Column(name = "error_code")
    private Integer errorCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(length = 80)
    private String model;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "token_usage")
    private Integer tokenUsage;

    @Column(name = "fallback_used", nullable = false)
    private boolean fallbackUsed = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected GenerationRun() {
    }

    public GenerationRun(String agent, String endpoint, GenerationRunStatus status) {
        this.agent = agent;
        this.endpoint = endpoint;
        this.status = status;
        this.createdAt = Instant.now();
    }

    // setters/getters
    public Long getId() { return id; }
    public String getAgent() { return agent; }
    public void setAgent(String agent) { this.agent = agent; }
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public Integer getContentVersion() { return contentVersion; }
    public void setContentVersion(Integer contentVersion) { this.contentVersion = contentVersion; }
    public String getGameType() { return gameType; }
    public void setGameType(String gameType) { this.gameType = gameType; }
    public Long getTriggeredByUserId() { return triggeredByUserId; }
    public void setTriggeredByUserId(Long triggeredByUserId) { this.triggeredByUserId = triggeredByUserId; }
    public String getTriggeredByRole() { return triggeredByRole; }
    public void setTriggeredByRole(String triggeredByRole) { this.triggeredByRole = triggeredByRole; }
    public String getInputHash() { return inputHash; }
    public void setInputHash(String inputHash) { this.inputHash = inputHash; }
    public String getInputRef() { return inputRef; }
    public void setInputRef(String inputRef) { this.inputRef = inputRef; }
    public GenerationRunStatus getStatus() { return status; }
    public void setStatus(GenerationRunStatus status) { this.status = status; }
    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public String getValidationProblems() { return validationProblems; }
    public void setValidationProblems(String validationProblems) { this.validationProblems = validationProblems; }
    public String getOutputJson() { return outputJson; }
    public void setOutputJson(String outputJson) { this.outputJson = outputJson; }
    public Integer getErrorCode() { return errorCode; }
    public void setErrorCode(Integer errorCode) { this.errorCode = errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Long getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Long latencyMs) { this.latencyMs = latencyMs; }
    public Integer getTokenUsage() { return tokenUsage; }
    public void setTokenUsage(Integer tokenUsage) { this.tokenUsage = tokenUsage; }
    public boolean isFallbackUsed() { return fallbackUsed; }
    public void setFallbackUsed(boolean fallbackUsed) { this.fallbackUsed = fallbackUsed; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}