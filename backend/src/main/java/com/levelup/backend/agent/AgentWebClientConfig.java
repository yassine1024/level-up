package com.levelup.backend.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class AgentWebClientConfig {


    @Bean
    public AgentsClient agentsClient(
            @Value("${AGENTS_BASE_URL:http://localhost:8000}")
            String agentsBaseUrl,
            GenerationRunService runService,
            ObjectMapper objectMapper) {

        WebClient webClient = WebClient.builder()
                .baseUrl(agentsBaseUrl)
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofSeconds(45))))
                .build();
        return new AgentsClient(webClient, runService, objectMapper);
    }
}