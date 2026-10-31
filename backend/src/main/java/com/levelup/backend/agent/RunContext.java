package com.levelup.backend.agent;

public record RunContext(
        String agent,
        String endpoint,
        Long lessonId,
        Integer contentVersion,
        String gameType,
        Long triggeredByUserId,
        String triggeredByRole,
        String inputRef
) {
    public static RunContext of(String agent, String endpoint) {
        return new RunContext(agent, endpoint, null, null, null, null, null, null);
    }
}