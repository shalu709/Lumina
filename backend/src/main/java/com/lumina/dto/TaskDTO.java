package com.lumina.dto;

import com.lumina.entity.AppTask;
import com.lumina.entity.AppUser;

import java.time.LocalDateTime;

public class TaskDTO {
    private Long id;
    private String title;
    private String tag;
    private LocalDateTime dueDate;
    private boolean completed; // Global or Creator completion
    private boolean isCompletedByMe; // Logged user completion
    private int reportCount;
    private AppUser createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime postedAt;
    private boolean isPublic;

    public TaskDTO() {}

    public TaskDTO(AppTask task, boolean isCompletedByMe) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.tag = task.getTag();
        this.dueDate = task.getDueDate();
        this.completed = task.isCompleted();
        this.isCompletedByMe = isCompletedByMe;
        this.reportCount = task.getReportCount();
        this.createdBy = task.getCreatedBy();
        this.postedAt = task.getPostedAt();
        this.isPublic = task.isPublic();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getTag() { return tag; }
    public LocalDateTime getDueDate() { return dueDate; }
    public boolean getCompleted() { return completed; }
    public boolean isCompletedByMe() { return isCompletedByMe; }
    public int getReportCount() { return reportCount; }
    public AppUser getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public boolean isPublic() { return isPublic; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setTag(String tag) { this.tag = tag; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public void setCompletedByMe(boolean isCompletedByMe) { this.isCompletedByMe = isCompletedByMe; }
    public void setReportCount(int reportCount) { this.reportCount = reportCount; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
}
