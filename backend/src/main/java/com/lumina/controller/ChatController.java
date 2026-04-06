package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.ChatMessage;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private ChatMessageRepository chatRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String buildSectionKey(AppUser u) {
        return u.getCollege() + "|" + u.getCourse() + "|" + u.getBatch() + "|" + u.getSection();
    }

    /**
     * GET /api/chat/section?since=2024-03-01T00:00:00
     * Polls for messages newer than the given timestamp (ISO format).
     * If no 'since' param, returns last 50 messages.
     */
    @GetMapping("/section")
    public List<ChatMessage> getSectionMessages(
            @RequestParam(required = false) String since) {
        AppUser user = getAuthenticatedUser();
        String key = buildSectionKey(user);

        if (since != null && !since.isBlank()) {
            LocalDateTime sinceTime = LocalDateTime.parse(since);
            return chatRepository
                .findBySectionKeyAndCreatedAtAfterAndIsHiddenFalseOrderByCreatedAtAsc(key, sinceTime);
        }

        List<ChatMessage> all = chatRepository
            .findBySectionKeyAndIsHiddenFalseOrderByCreatedAtAsc(key);
        // Return last 50 only for initial load
        int start = Math.max(0, all.size() - 50);
        return all.subList(start, all.size());
    }

    /**
     * POST /api/chat/send
     * Body: { "content": "Hello class!" }
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> payload) {
        AppUser user = getAuthenticatedUser();
        String content = payload.get("content");

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty."));
        }
        if (content.length() > 1000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message too long (max 1000 chars)."));
        }

        ChatMessage msg = new ChatMessage();
        msg.setSender(user);
        msg.setContent(content.trim());
        msg.setSectionKey(buildSectionKey(user));

        return ResponseEntity.ok(chatRepository.save(msg));
    }

    /**
     * POST /api/chat/{id}/report
     * Reports a message. Auto-hides after 5 reports.
     */
    @PostMapping("/{id}/report")
    public ResponseEntity<?> reportMessage(@PathVariable Long id) {
        ChatMessage msg = chatRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));

        msg.setReportCount(msg.getReportCount() + 1);
        if (msg.getReportCount() >= 5) {
            msg.setHidden(true);
        }
        chatRepository.save(msg);
        return ResponseEntity.ok(Map.of("message", "Reported."));
    }

    @PostMapping("/{id}/unreport")
    public ResponseEntity<?> unreportMessage(@PathVariable Long id) {
        ChatMessage msg = chatRepository.findById(id).orElseThrow();
        if (msg.getReportCount() > 0) {
            msg.setReportCount(msg.getReportCount() - 1);
        }
        if (msg.getReportCount() < 5) {
            msg.setHidden(false);
        }
        chatRepository.save(msg);
        return ResponseEntity.ok(Map.of("message", "Report flag removed."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        AppUser user = getAuthenticatedUser();
        ChatMessage msg = chatRepository.findById(id).orElseThrow();
        if (!msg.getSender().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own messages."));
        }
        chatRepository.delete(msg);
        return ResponseEntity.ok(Map.of("message", "Message deleted."));
    }
}
