package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private AppUserRepository userRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping("/reward")
    public ResponseEntity<?> addReputationReward(@RequestBody Map<String, Integer> payload) {
        AppUser user = getAuthenticatedUser();
        int points = payload.getOrDefault("points", 0);
        
        user.setReputationScore(user.getReputationScore() + points);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Rewarded " + points + " points!", "newScore", user.getReputationScore()));
    }

    @PostMapping("/claim-cr")
    public ResponseEntity<?> claimCR() {
        AppUser user = getAuthenticatedUser();
        if (user.isClassRep()) {
            return ResponseEntity.badRequest().body(Map.of("error", "You are already the Class Representative."));
        }
        
        // Check if there's already a CR for this section
        boolean crExists = userRepository.findAll().stream()
            .anyMatch(u -> u.isClassRep() &&
                           u.getCollege().equals(user.getCollege()) &&
                           u.getCourse().equals(user.getCourse()) &&
                           u.getBatch().equals(user.getBatch()) &&
                           u.getSection().equals(user.getSection()));
                           
        if (crExists) {
            return ResponseEntity.status(409).body(Map.of("error", "A Class Representative already exists for this section."));
        }
        
        user.setClassRep(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "You are now the Class Representative for Section " + user.getSection()));
    }
    @GetMapping("/leaderboard/global")
    public ResponseEntity<java.util.List<Map<String, Object>>> getGlobalLeaderboard() {
        java.util.List<Map<String, Object>> board = userRepository.findTop10ByOrderByReputationScoreDesc().stream()
            .map(u -> Map.<String, Object>of("id", u.getId(), "name", u.getName(), "score", u.getReputationScore(), "college", u.getCollege() != null ? u.getCollege() : "Unknown"))
            .toList();
        return ResponseEntity.ok(board);
    }

    @GetMapping("/leaderboard/section")
    public ResponseEntity<java.util.List<Map<String, Object>>> getSectionLeaderboard() {
        AppUser user = getAuthenticatedUser();
        java.util.List<Map<String, Object>> board = userRepository.findTop10ByCollegeAndCourseAndBatchAndSectionOrderByReputationScoreDesc(
            user.getCollege(), user.getCourse(), user.getBatch(), user.getSection()
        ).stream()
            .map(u -> Map.<String, Object>of("id", u.getId(), "name", u.getName(), "score", u.getReputationScore()))
            .toList();
        return ResponseEntity.ok(board);
    }

    @PostMapping("/privacy")
    public ResponseEntity<?> updatePrivacy(@RequestBody Map<String, Boolean> payload) {
        AppUser user = getAuthenticatedUser();
        if (payload.containsKey("allowReadReceipts")) {
            user.setAllowReadReceipts(payload.get("allowReadReceipts"));
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Privacy settings updated.", "allowReadReceipts", user.isAllowReadReceipts()));
    }
}
