package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.repository.AppUserRepository;
import com.lumina.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser payload) {
        if (userRepository.findByEmail(payload.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use."));
        }
        
        // Strict Validation Engine
        if (payload.getCollege() == null || payload.getCollege().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Standardized College selection from the GitHub API is mandatory."));
        }
        if (payload.getCollegeId() == null || payload.getCollegeId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A valid College Roll Number / ID is required for verification."));
        }

        // Optional enforcement warning - in prod this would throw
        if (!payload.getEmail().endsWith(".edu.in") && !payload.getEmail().endsWith(".ac.in")) {
            System.out.println("Warning: Non-institutional email registered: " + payload.getEmail());
        }

        AppUser user = new AppUser();
        user.setName(payload.getName());
        user.setEmail(payload.getEmail());
        user.setPassword(passwordEncoder.encode(payload.getPassword()));
        user.setCollege(payload.getCollege());
        user.setCollegeId(payload.getCollegeId());
        user.setCourse(payload.getCourse());
        user.setBatch(payload.getBatch());
        user.setSection(payload.getSection());
        user.setReputationScore(100);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        Optional<AppUser> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
             AppUser user = userOpt.get();
             if (passwordEncoder.matches(password, user.getPassword())) {
                 String token = jwtUtil.generateToken(email);
                 return ResponseEntity.ok(Map.of("token", token, "user", user));
             }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials."));
    }
}
