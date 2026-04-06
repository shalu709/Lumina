package com.lumina.controller;

import com.lumina.entity.AppUser;
import com.lumina.entity.AttendanceLog;
import com.lumina.repository.AppUserRepository;
import com.lumina.repository.AttendanceLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private AttendanceLogRepository attendanceLogRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }

    @GetMapping("/")
    public List<AttendanceLog> getMyAttendance() {
        return attendanceLogRepository.findByUser(getAuthenticatedUser());
    }

    @PostMapping("/log")
    public ResponseEntity<?> logAttendance(@RequestBody Map<String, Object> payload) {
        AppUser user = getAuthenticatedUser();
        String courseName = (String) payload.get("courseName");
        boolean present = (Boolean) payload.get("present");
        
        // Exact date or fallback to today
        String dateStr = (String) payload.get("date");
        LocalDate date = (dateStr != null) ? LocalDate.parse(dateStr) : LocalDate.now();

        // Check if a record already exists for this exact date and course
        List<AttendanceLog> existingLogs = attendanceLogRepository.findByUser(user).stream()
            .filter(log -> log.getCourseName().equals(courseName) && log.getDateRecorded().equals(date))
            .toList();

        if (!existingLogs.isEmpty()) {
            AttendanceLog existing = existingLogs.get(existingLogs.size() - 1);
            // Editable till midnight rule: You can only edit it if the real world clock is currently the same day OR you created it today.
            if (!LocalDate.now().equals(existing.getLoggedAt().toLocalDate())) {
                return ResponseEntity.status(403).body(Map.of("message", "Attendance records are locked at midnight and cannot be changed anymore."));
            }
            // Reverse points if changing from true to false
            if(existing.isAttended() && !present) user.setReputationScore(user.getReputationScore() - 5);
            else if(!existing.isAttended() && present) user.setReputationScore(user.getReputationScore() + 5);
            
            existing.setAttended(present);
            attendanceLogRepository.save(existing);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Updated entry before midnight.", "points", user.getReputationScore()));
        }

        // Create new log (future dates included if user explicitly sends it)
        AttendanceLog log = new AttendanceLog();
        log.setUser(user);
        log.setCourseName(courseName);
        log.setDateRecorded(date);
        log.setAttended(present);
        
        // Gamification
        if (present) user.setReputationScore(user.getReputationScore() + 5);
        
        attendanceLogRepository.save(log);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Logged successfully.", "points", user.getReputationScore()));
    }
}
