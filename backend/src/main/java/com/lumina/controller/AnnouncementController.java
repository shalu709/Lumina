package com.lumina.controller;

import com.lumina.entity.Announcement;
import com.lumina.entity.AppUser;
import com.lumina.repository.AnnouncementRepository;
import com.lumina.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private AnnouncementRepository announcementRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * GET /api/announcements/section
     * Returns all announcements for the authenticated user's section.
     */
    @GetMapping("/section")
    public List<Announcement> getSectionAnnouncements() {
        AppUser user = getAuthenticatedUser();
        return announcementRepository.findByCollegeAndCourseAndBatchAndSectionOrderByCreatedAtDesc(
            user.getCollege(), user.getCourse(), user.getBatch(), user.getSection()
        );
    }

    /**
     * POST /api/announcements/
     * Body: { "title": "Exam Postponed", "body": "Mid-term now on April 5th." }
     * Only Class Representatives can post.
     */
    @PostMapping("/")
    public ResponseEntity<?> createAnnouncement(@RequestBody Map<String, String> payload) {
        AppUser user = getAuthenticatedUser();

        if (!user.isClassRep()) {
            return ResponseEntity.status(403).body(
                Map.of("error", "Only Class Representatives can post announcements.")
            );
        }

        String title = payload.get("title");
        String body = payload.get("body");

        if (title == null || title.isBlank() || body == null || body.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title and body are required."));
        }

        Announcement ann = new Announcement();
        ann.setAuthor(user);
        ann.setTitle(title.trim());
        ann.setBody(body.trim());
        ann.setCollege(user.getCollege());
        ann.setCourse(user.getCourse());
        ann.setBatch(user.getBatch());
        ann.setSection(user.getSection());

        return ResponseEntity.ok(announcementRepository.save(ann));
    }

    /**
     * DELETE /api/announcements/{id}
     * Only the original CR author can delete their announcement.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        AppUser user = getAuthenticatedUser();
        Announcement ann = announcementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if (!ann.getAuthor().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your announcement."));
        }

        announcementRepository.delete(ann);
        return ResponseEntity.ok().build();
    }
}
