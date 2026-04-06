package com.lumina.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_subjects")
public class UserSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private String name;

    private int targetAttendancePercent = 75;

    public UserSubject() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getTargetAttendancePercent() { return targetAttendancePercent; }
    public void setTargetAttendancePercent(int targetAttendancePercent) { this.targetAttendancePercent = targetAttendancePercent; }
}
