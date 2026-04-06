package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.DirectMessage;
import com.lumina.entity.UserBlock;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.DirectMessageRepository;
import com.lumina.repository.UserBlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class DirectMessageController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private DirectMessageRepository dmRepository;
    @Autowired private UserBlockRepository blockRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    // --- Core Messaging ---

    @GetMapping("/contacts")
    public List<Map<String, Object>> getRecentContacts() {
        AppUser me = getAuthenticatedUser();
        List<Long> partnerIds = dmRepository.findDistinctChatPartners(me.getId());
        
        List<Map<String, Object>> contacts = new ArrayList<>();
        for (Long pid : partnerIds) {
            AppUser partner = userRepository.findById(pid).orElse(null);
            if (partner != null) {
                Map<String, Object> contact = new HashMap<>();
                contact.put("id", partner.getId());
                contact.put("name", partner.getName());
                contact.put("course", partner.getCourse());
                contact.put("college", partner.getCollege());
                
                // Check if blocked
                boolean iBlockedThem = blockRepository.existsByBlockerIdAndBlockedId(me.getId(), partner.getId());
                boolean theyBlockedMe = blockRepository.existsByBlockerIdAndBlockedId(partner.getId(), me.getId());
                contact.put("isBlockedByMe", iBlockedThem);
                contact.put("isBlockedByThem", theyBlockedMe);
                
                contacts.add(contact);
            }
        }
        return contacts;
    }

    @GetMapping("/thread/{partnerId}")
    public List<Map<String, Object>> getChatThread(@PathVariable Long partnerId) {
        AppUser me = getAuthenticatedUser();
        List<DirectMessage> thread = dmRepository.findChatThread(me.getId(), partnerId);
        
        // Mark as read if I am the receiver
        for (DirectMessage msg : thread) {
            if (msg.getReceiver().getId().equals(me.getId()) && !msg.isRead()) {
                msg.setRead(true);
                dmRepository.save(msg);
            }
        }

        return thread.stream().map(msg -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("senderId", msg.getSender().getId());
            map.put("content", msg.getContent());
            map.put("timestamp", msg.getTimestamp());
            
            // Respect Privacy Rules: Only send read receipt if the receiver allows it!
            if (msg.getSender().getId().equals(me.getId())) {
                // I sent this message. Can I see if they read it?
                boolean theyAllowReceipts = msg.getReceiver().isAllowReadReceipts();
                map.put("isRead", theyAllowReceipts ? msg.isRead() : null);
            } else {
                // They sent this message. It is definitely read by me now.
                map.put("isRead", true);
            }

            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/send/{partnerId}")
    public ResponseEntity<?> sendMessage(@PathVariable Long partnerId, @RequestBody Map<String, String> payload) {
        AppUser me = getAuthenticatedUser();
        AppUser partner = userRepository.findById(partnerId).orElseThrow();

        // Check Blocking
        if (blockRepository.existsByBlockerIdAndBlockedId(me.getId(), partner.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You have blocked this user. Unblock to send messages."));
        }
        if (blockRepository.existsByBlockerIdAndBlockedId(partner.getId(), me.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot send messages to this user."));
        }

        DirectMessage msg = new DirectMessage();
        msg.setSender(me);
        msg.setReceiver(partner);
        msg.setContent(payload.get("content"));
        dmRepository.save(msg);

        // Gamification: First time chatting with someone? Provide tiny reputation boost (max 2 pts) per chat.
        me.setReputationScore(me.getReputationScore() + 1);
        userRepository.save(me);

        return ResponseEntity.ok(Map.of("success", true, "messageId", msg.getId()));
    }

    // --- Blocking System ---

    @PostMapping("/block/{partnerId}")
    public ResponseEntity<?> blockUser(@PathVariable Long partnerId) {
        AppUser me = getAuthenticatedUser();
        AppUser partner = userRepository.findById(partnerId).orElseThrow();

        if (!blockRepository.existsByBlockerIdAndBlockedId(me.getId(), partner.getId())) {
            UserBlock block = new UserBlock(me, partner);
            blockRepository.save(block);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "User blocked."));
    }

    @PostMapping("/unblock/{partnerId}")
    public ResponseEntity<?> unblockUser(@PathVariable Long partnerId) {
        AppUser me = getAuthenticatedUser();
        UserBlock block = blockRepository.findByBlockerIdAndBlockedId(me.getId(), partnerId).orElse(null);
        if (block != null) {
            blockRepository.delete(block);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "User unblocked."));
    }
}
