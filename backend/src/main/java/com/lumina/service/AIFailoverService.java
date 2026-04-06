package com.lumina.service;

import com.lumina.config.SecretsConfig;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class AIFailoverService {

    private final SecretsConfig secretsConfig;
    private final RestTemplate restTemplate;

    public AIFailoverService(SecretsConfig secretsConfig) {
        this.secretsConfig = secretsConfig;
        this.restTemplate = new RestTemplate();
    }

    public String askAITutor(String systemPrompt, String userPrompt) {
        // Try Groq First
        try {
            return callGroq(systemPrompt, userPrompt);
        } catch (Exception e1) {
            System.out.println("Groq failed. Failing over to OpenRouter...");
            // Try OpenRouter Backup 1
            try {
                return callOpenRouter(systemPrompt, userPrompt);
            } catch (Exception e2) {
                System.out.println("OpenRouter failed. Failing over to Nvidia...");
                // Try Nvidia Backup 2
                try {
                    return callNvidia(systemPrompt, userPrompt);
                } catch (Exception e3) {
                    System.err.println("ALL AI MODELS FAILED.");
                    return "Sorry, I am currently experiencing high demand. Please try again later.";
                }
            }
        }
    }

    private String callGroq(String systemPrompt, String userPrompt) {
        String url = "https://api.groq.com/openai/v1/chat/completions";
        HttpHeaders headers = buildHeaders(secretsConfig.getGroqApiKey());
        Map<String, Object> body = buildRequestBody("llama3-8b-8192", systemPrompt, userPrompt);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        return extractResponse(response.getBody());
    }

    private String callOpenRouter(String systemPrompt, String userPrompt) {
        String url = "https://openrouter.ai/api/v1/chat/completions";
        HttpHeaders headers = buildHeaders(secretsConfig.getOpenRouterApiKey());
        headers.set("HTTP-Referer", "http://localhost:8080");
        headers.set("X-Title", "Lumina");
        // We'll use a free model on OpenRouter like mistralai/mixtral-8x7b-instruct
        Map<String, Object> body = buildRequestBody("mistralai/mixtral-8x7b-instruct", systemPrompt, userPrompt);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        return extractResponse(response.getBody());
    }

    private String callNvidia(String systemPrompt, String userPrompt) {
        String url = "https://integrate.api.nvidia.com/v1/chat/completions";
        HttpHeaders headers = buildHeaders(secretsConfig.getNvidiaApiKey());
        Map<String, Object> body = buildRequestBody("meta/llama3-70b-instruct", systemPrompt, userPrompt);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        return extractResponse(response.getBody());
    }

    private HttpHeaders buildHeaders(String apiKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        return headers;
    }

    private Map<String, Object> buildRequestBody(String model, String systemPrompt, String userPrompt) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userPrompt)
        ));
        return body;
    }

    private String extractResponse(Map<String, Object> body) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            throw new RuntimeException("Malformed response from AI provider");
        }
    }
}
