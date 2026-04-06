package com.lumina.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private String college;
    private String course;
    private String batch;
    private String section;
    private String collegeId;
    private boolean isClassRep = false;

    private int reputationScore = 100;
    
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean allowReadReceipts = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public AppUser() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getCollegeId() { return collegeId; }
    public void setCollegeId(String collegeId) { this.collegeId = collegeId; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public boolean isClassRep() { return isClassRep; }
    public void setClassRep(boolean classRep) { isClassRep = classRep; }
    public int getReputationScore() { return reputationScore; }
    public void setReputationScore(int reputationScore) { this.reputationScore = reputationScore; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isAllowReadReceipts() { return allowReadReceipts; }
    public void setAllowReadReceipts(boolean allowReadReceipts) { this.allowReadReceipts = allowReadReceipts; }
}
