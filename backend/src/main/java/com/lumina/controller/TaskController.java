package com.lumina.controller;

import com.lumina.dto.TaskDTO;
import com.lumina.entity.*;
import com.lumina.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired private AppUserRepository userRepository;
    @Autowired private AppTaskRepository taskRepository;
    @Autowired private TaskReportRepository reportRepository;
    @Autowired private UserTaskCompletionRepository completionRepository;

    private AppUser getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping("/section")
    public List<TaskDTO> getSectionTasks() {
        AppUser user = getAuthenticatedUser();
        List<AppTask> globalTasks = taskRepository.findSectionAndPersonalTasks(
                user.getId(), user.getCollege(), user.getCourse(), user.getBatch(), user.getSection()
        );
        
        List<UserTaskCompletion> myCompletions = completionRepository.findByUserId(user.getId());
        
        return globalTasks.stream().map(task -> {
            boolean done = myCompletions.stream().anyMatch(c -> c.getTask().getId().equals(task.getId()));
            return new TaskDTO(task, done);
        }).collect(Collectors.toList());
    }

    @PostMapping("/")
    public AppTask createGlobalTask(@RequestBody AppTask task) {
        AppUser user = getAuthenticatedUser();
        task.setCollege(user.getCollege());
        task.setCourse(user.getCourse());
        task.setBatch(user.getBatch());
        task.setSection(user.getSection());
        task.setCreatedBy(user);
        return taskRepository.save(task);
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<?> markTaskComplete(@PathVariable Long taskId) {
        AppUser user = getAuthenticatedUser();
        AppTask task = taskRepository.findById(taskId).orElseThrow();
        
        UserTaskCompletion completion = new UserTaskCompletion();
        completion.setUser(user);
        completion.setTask(task);
        completionRepository.save(completion);
        
        return ResponseEntity.ok(Map.of("message", "Task marked as completed personally."));
    }

    @PostMapping("/{taskId}/report")
    public ResponseEntity<?> reportTask(@PathVariable Long taskId, @RequestBody Map<String, String> payload) {
        AppUser user = getAuthenticatedUser();
        AppTask task = taskRepository.findById(taskId).orElseThrow();

        // Save report
        TaskReport report = new TaskReport();
        report.setReporter(user);
        report.setReportedTask(task);
        report.setReason(payload.getOrDefault("reason", "Spam / False info"));
        reportRepository.save(report);

        // Increment task reports
        task.setReportCount(task.getReportCount() + 1);
        
        // Threshold logic (Simulated: if > 3 reports, hide task, deduct author rep)
        if (task.getReportCount() >= 3) {
            task.setHidden(true);
            AppUser author = task.getCreatedBy();
            author.setReputationScore(author.getReputationScore() - 20); // Penalty
            userRepository.save(author);
        }
        
        taskRepository.save(task);
        return ResponseEntity.ok(Map.of("message", "Abuse reported successfully."));
    }
}
