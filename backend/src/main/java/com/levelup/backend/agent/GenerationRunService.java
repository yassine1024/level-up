package com.levelup.backend.agent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GenerationRunService {

    private static final Logger logger = LoggerFactory.getLogger(GenerationRunService.class);

    private final GenerationRunRepository repository;

    public GenerationRunService(GenerationRunRepository repository) {
        this.repository = repository;
    }

    public GenerationRun save(GenerationRun run) {
        try {
            return repository.save(run);
        } catch (RuntimeException exception) {
            logger.warn("Failed to persist generation run", exception);
            return run;
        }
    }
}