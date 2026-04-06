package com.lumina.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_reports")
public class TaskReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private AppUser reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_task_id", nullable = false)
    private AppTask reportedTask;

    private String reason;
    private LocalDateTime reportedAt = LocalDateTime.now();

    public TaskReport() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getReporter() { return reporter; }
    public void setReporter(AppUser reporter) { this.reporter = reporter; }
    public AppTask getReportedTask() { return reportedTask; }
    public void setReportedTask(AppTask reportedTask) { this.reportedTask = reportedTask; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }
}
