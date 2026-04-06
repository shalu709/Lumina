package com.lumina.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_ratings")
public class CourseRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseName;
    private String professorName;
    private int stars; // 1 to 5
    
    @Column(columnDefinition = "TEXT")
    private String reviewText;

    private String college;
    private String anonymousIdentifier; // Hash of User ID or random string for privacy
    
    // To allow users to edit/delete their own rating without revealing identity publicly
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    private LocalDateTime createdAt = LocalDateTime.now();

    public CourseRating() {}

    public Long getId() { return id; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getAnonymousIdentifier() { return anonymousIdentifier; }
    public void setAnonymousIdentifier(String anonymousIdentifier) { this.anonymousIdentifier = anonymousIdentifier; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
