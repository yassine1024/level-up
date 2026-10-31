package com.levelup.backend.agent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class GenerationRunRetention {

    private static final Logger logger = LoggerFactory.getLogger(GenerationRunRetention.class);
    private static final int RETENTION_DAYS = 90;

    private final GenerationRunRepository repository;

    public GenerationRunRetention(GenerationRunRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeOldPayloads() {
        Instant cutoff = Instant.now().minus(RETENTION_DAYS, ChronoUnit.DAYS);
        int count = 0;
        for (GenerationRun run : repository.findAll()) {
            if (run.getCreatedAt() != null && run.getCreatedAt().isBefore(cutoff)) {
                if (run.getOutputJson() != null || run.getValidationProblems() != null) {
                    run.setOutputJson(null);
                    run.setValidationProblems(null);
                    repository.save(run);
                    count++;
                }
            }
        }
        if (count > 0) {
            logger.info("Purged payloads for {} generation runs older than {} days", count, RETENTION_DAYS);
        }
    }
}