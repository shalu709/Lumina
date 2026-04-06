package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.UserSubject;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.UserSubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private UserSubjectRepository subjectRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping("/")
    public List<UserSubject> getMySubjects() {
        return subjectRepository.findByUserId(getAuthenticatedUser().getId());
    }

    @PostMapping("/")
    public UserSubject createSubject(@RequestBody UserSubject subject) {
        subject.setUser(getAuthenticatedUser());
        return subjectRepository.save(subject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        AppUser user = getAuthenticatedUser();
        UserSubject subject = subjectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subject not found."));
        if (subject.getUser().getId().equals(user.getId())) {
            subjectRepository.delete(subject);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).build();
    }
}
