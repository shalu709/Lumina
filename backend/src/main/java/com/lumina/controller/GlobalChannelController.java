package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.GlobalMessage;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.GlobalMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/global")
@CrossOrigin(origins = "*")
public class GlobalChannelController {

    private static final Set<String> VALID_CHANNELS = Set.of(
        "general", "gate-prep", "java-help", "placements", "off-topic",
        "dsa-algo", "projects", "internships"
    );

    @Autowired private AppUserRepository userRepository;
    @Autowired private GlobalMessageRepository globalRepo;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean containsAbusiveContent(String text) {
        String lower = text.toLowerCase();
        // Basic profanity/abuse word filter — expand list as needed
        List<String> blocked = List.of(
            "fuck", "shit", "bastard", "asshole", "bitch", "cunt", "dick", "porn",
            "rape", "kill yourself", "kys"
        );
        return blocked.stream().anyMatch(lower::contains);
    }

    /**
     * GET /api/global/{channel}?since=timestamp
     * Returns last 50 messages or messages since given time.
     */
    @GetMapping("/{channel}")
    public ResponseEntity<?> getMessages(
            @PathVariable String channel,
            @RequestParam(required = false) String since) {

        if (!VALID_CHANNELS.contains(channel)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid channel."));
        }

        if (since != null && !since.isBlank()) {
            return ResponseEntity.ok(
                globalRepo.findByChannelAndCreatedAtAfterAndIsHiddenFalseOrderByCreatedAtAsc(
                    channel, LocalDateTime.parse(since)
                )
            );
        }

        List<GlobalMessage> all = globalRepo.findByChannelAndIsHiddenFalseOrderByCreatedAtAsc(channel);
        int start = Math.max(0, all.size() - 50);
        return ResponseEntity.ok(all.subList(start, all.size()));
    }

    /**
     * POST /api/global/{channel}/send
     * Body: { "content": "..." } — file sharing is hard-blocked.
     */
    @PostMapping("/{channel}/send")
    public ResponseEntity<?> sendMessage(
            @PathVariable String channel,
            @RequestBody Map<String, String> payload) {

        if (!VALID_CHANNELS.contains(channel)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid channel."));
        }

        String content = payload.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty."));
        }
        if (content.length() > 1000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message too long."));
        }

        // AI profanity filter
        if (containsAbusiveContent(content)) {
            return ResponseEntity.status(400).body(
                Map.of("error", "Your message contains prohibited content and was blocked.")
            );
        }

        AppUser user = getAuthenticatedUser();
        GlobalMessage msg = new GlobalMessage();
        msg.setSender(user);
        msg.setContent(content.trim());
        msg.setChannel(channel);

        return ResponseEntity.ok(globalRepo.save(msg));
    }

    /**
     * POST /api/global/{channel}/{id}/report
     * Auto-hides after 3 reports in global channels (stricter than section).
     */
    @PostMapping("/{channel}/{id}/report")
    public ResponseEntity<?> reportMessage(
            @PathVariable String channel,
            @PathVariable Long id) {

        GlobalMessage msg = globalRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setReportCount(msg.getReportCount() + 1);
        if (msg.getReportCount() >= 3) msg.setHidden(true);
        globalRepo.save(msg);
        return ResponseEntity.ok(Map.of("message", "Reported."));
    }

    @PostMapping("/{channel}/{id}/unreport")
    public ResponseEntity<?> unreportMessage(
            @PathVariable String channel,
            @PathVariable Long id) {

        GlobalMessage msg = globalRepo.findById(id).orElseThrow();
        if (msg.getReportCount() > 0) {
            msg.setReportCount(msg.getReportCount() - 1);
        }
        if (msg.getReportCount() < 3) msg.setHidden(false);
        globalRepo.save(msg);
        return ResponseEntity.ok(Map.of("message", "Report flag removed."));
    }

    @DeleteMapping("/{channel}/{id}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable String channel,
            @PathVariable Long id) {
        AppUser user = getAuthenticatedUser();
        GlobalMessage msg = globalRepo.findById(id).orElseThrow();
        if (!msg.getSender().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your message."));
        }
        globalRepo.delete(msg);
        return ResponseEntity.ok(Map.of("message", "Deleted."));
    }
}
