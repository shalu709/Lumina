package com.lumina.controller;

import com.lumina.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private AppTaskRepository taskRepository;
    @Autowired private AttendanceLogRepository attendanceLogRepository;
    @Autowired private UserSubjectRepository subjectRepository;
    @Autowired private UserTaskCompletionRepository completionRepository;

    @DeleteMapping("/reset")
    public ResponseEntity<?> resetDatabase(@RequestHeader("X-Admin-Key") String key) {
        if (!"lumina-reset-2024".equals(key)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden."));
        }
        completionRepository.deleteAll();
        subjectRepository.deleteAll();
        attendanceLogRepository.deleteAll();
        taskRepository.deleteAll();
        userRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "Database wiped successfully."));
    }
}
