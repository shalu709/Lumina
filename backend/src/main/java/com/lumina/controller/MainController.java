package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.StudyNote;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.StudyNoteRepository;
import com.lumina.service.AIFailoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For React local testing
public class MainController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private StudyNoteRepository noteRepository;
    @Autowired private AIFailoverService aiService;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping("/ping")
    public String ping() {
        return "Lumina API Backend is Running!";
    }

    // --- Study Buddy AI Features ---
    @PostMapping("/ai/tutor")
    public ResponseEntity<Map<String, String>> askTutor(@RequestBody Map<String, String> payload) {
        String question = payload.getOrDefault("prompt", payload.get("question"));
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("response", "No question provided."));
        }
        String systemPrompt = "You are Study Buddy, a world-class academic tutor for Indian college students. " +
            "Answer clearly, helpfully and concisely. Use examples when relevant. Avoid unnecessary filler phrases.";
        
        String answer = aiService.askAITutor(systemPrompt, question);
        return ResponseEntity.ok(Map.of("response", answer));
    }

    @PostMapping("/ai/scribe")
    public ResponseEntity<StudyNote> convertNotesToMarkdown(@RequestBody Map<String, String> payload) {
        String roughNotes = payload.get("roughNotes");
        String title = payload.getOrDefault("title", "Untitled Note");

        String systemPrompt = "Convert into formatted markdown study guide...";
        String cleanNotes = aiService.askAITutor(systemPrompt, roughNotes);

        StudyNote note = new StudyNote();
        note.setTitle(title);
        note.setContent(roughNotes);
        note.setAiSummary(cleanNotes);
        note.setCreatedAt(LocalDateTime.now());
        
        try {
            note.setUser(getAuthenticatedUser());
        } catch(Exception e) {
            // Unauthenticated
        }

        StudyNote saved = noteRepository.save(note);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/ai/quiz")
    public ResponseEntity<Map<String, Object>> generateQuiz(@RequestBody Map<String, String> payload) {
        String topic = payload.get("topic");
        String systemPrompt = "You are a specialized AI Quiz Generator. Generate a 5-question multiple choice quiz on the topic provided. " +
            "Return ONLY a strict JSON object with this structure: { \"quiz\": [ { \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctIndex\": 0 }, ... ] } " +
            "Do not include any other text or markdown formatting.";
        
        String response = aiService.askAITutor(systemPrompt, "Generate a quiz for: " + topic);
        
        // Basic cleanup in case AI adds markdown blocks
        String cleanJson = response.replaceAll("```json", "").replaceAll("```", "").trim();
        
        return ResponseEntity.ok(Map.of("data", cleanJson));
    }

    @PostMapping("/ai/summarize")
    public ResponseEntity<Map<String, String>> summarizeText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        String systemPrompt = "Distill the following study material into dense, semantic markdown bullet points. Highlight key terms in bold.";
        
        String summary = aiService.askAITutor(systemPrompt, text);
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}
