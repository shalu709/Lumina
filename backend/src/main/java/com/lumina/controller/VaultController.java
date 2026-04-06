package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.VaultNote;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.VaultNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vault")
@CrossOrigin(origins = "*")
public class VaultController {

    @Autowired private VaultNoteRepository vaultRepository;
    @Autowired private AppUserRepository userRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private String generateSectionKey(AppUser user) {
        return user.getCollege() + "_" + user.getCourse() + "_" + user.getBatch() + "_" + user.getSection();
    }

    @GetMapping("/")
    public List<VaultNote> getSectionVault() {
        AppUser user = getAuthenticatedUser();
        return vaultRepository.findBySectionKeyOrderByUpvotesDesc(generateSectionKey(user));
    }

    @PostMapping("/share")
    public ResponseEntity<?> shareResource(@RequestBody VaultNote payload) {
        AppUser user = getAuthenticatedUser();
        payload.setUploadedBy(user);
        payload.setSectionKey(generateSectionKey(user));
        vaultRepository.save(payload);

        // Reward 10 Rep for sharing a resource
        user.setReputationScore(user.getReputationScore() + 10);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Resource added to Vault. +10 Reputation Points!"));
    }

    @PostMapping("/{noteId}/upvote")
    public ResponseEntity<?> upvoteNote(@PathVariable Long noteId) {
        AppUser voter = getAuthenticatedUser();
        VaultNote note = vaultRepository.findById(noteId).orElseThrow();

        if (note.getUploadedBy().getId().equals(voter.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot upvote your own resource."));
        }

        note.setUpvotes(note.getUpvotes() + 1);
        vaultRepository.save(note);

        // Give author 5 Rep for every upvote
        AppUser author = note.getUploadedBy();
        author.setReputationScore(author.getReputationScore() + 5);
        userRepository.save(author);

        return ResponseEntity.ok(Map.of("message", "Upvoted! Author received +5 points."));
    }
}
