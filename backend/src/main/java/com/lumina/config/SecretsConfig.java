package com.lumina.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class SecretsConfig {

    private String groqApiKey;
    private String openRouterApiKey;
    private String nvidiaApiKey;

    public String getGroqApiKey() { return groqApiKey; }
    public String getOpenRouterApiKey() { return openRouterApiKey; }
    public String getNvidiaApiKey() { return nvidiaApiKey; }

    @PostConstruct
    public void loadSecrets() {
        try {
            // Adjust relative path based on execution dir (assumes running from backend/)
            File configFile = new File("../secrets/config.json");
            if (!configFile.exists()) {
                // Try from root
                configFile = new File("secrets/config.json");
            }
            // Try absolute path for safety during local testing
            // configFile = new File("d:/AI/Antigravity/lumina/secrets/config.json");

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(configFile);

            this.groqApiKey = root.path("groqApiKey").asText();
            this.openRouterApiKey = root.path("openRouterApiKey").asText();
            this.nvidiaApiKey = root.path("nvidiaApiKey").asText();

            System.out.println("Secrets loaded successfully from config.json");

        } catch (IOException e) {
            System.err.println("CRITICAL: Failed to load secrets from config.json");
            e.printStackTrace();
        }
    }
}
