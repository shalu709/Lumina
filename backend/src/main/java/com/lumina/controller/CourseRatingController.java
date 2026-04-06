package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.CourseRating;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.CourseRatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
public class CourseRatingController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private CourseRatingRepository ratingRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private String generateAnonymousId(AppUser user) {
        // Simple hash logic to keep it anonymous but consistent per user per course
        return "Student-" + Math.abs((user.getId() + user.getCollege().hashCode()) % 10000);
    }

    @GetMapping("/")
    public List<Map<String, Object>> getCollegeRatings() {
        AppUser user = getAuthenticatedUser();
        List<CourseRating> ratings = ratingRepository.findByCollegeOrderByCreatedAtDesc(user.getCollege());
        
        return ratings.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("courseName", r.getCourseName());
            map.put("professorName", r.getProfessorName());
            map.put("stars", r.getStars());
            map.put("reviewText", r.getReviewText());
            map.put("anonymousIdentifier", r.getAnonymousIdentifier());
            map.put("createdAt", r.getCreatedAt());
            map.put("isMine", r.getUser() != null && r.getUser().getId().equals(user.getId()));
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/")
    public CourseRating postRating(@RequestBody CourseRating rating) {
        AppUser user = getAuthenticatedUser();
        rating.setUser(user);
        rating.setCollege(user.getCollege());
        rating.setAnonymousIdentifier(generateAnonymousId(user));
        
        // Gamification Reward: +15 Rep points for helping peers
        user.setReputationScore(user.getReputationScore() + 15);
        userRepository.save(user);

        return ratingRepository.save(rating);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRating(@PathVariable Long id) {
        AppUser user = getAuthenticatedUser();
        CourseRating rating = ratingRepository.findById(id).orElseThrow();
        
        if (rating.getUser() != null && rating.getUser().getId().equals(user.getId())) {
            ratingRepository.delete(rating);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).body("Not authorized to delete this review.");
    }
}
