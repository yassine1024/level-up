package com.levelup.backend.agent;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AgentWebClientConfig {


    @Bean
    public WebClient agentWebClient(
            @Value("${AGENTS_BASE_URL:http://localhost:8000}")
            String agentsBaseUrl) {

        return WebClient.builder()
                .baseUrl(agentsBaseUrl)
                .build();
    }
}