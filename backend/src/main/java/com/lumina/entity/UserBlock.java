package com.lumina.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_blocks")
public class UserBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "blocker_id", nullable = false)
    private AppUser blocker;

    @ManyToOne
    @JoinColumn(name = "blocked_id", nullable = false)
    private AppUser blocked;

    private LocalDateTime createdAt = LocalDateTime.now();

    public UserBlock() {}

    public UserBlock(AppUser blocker, AppUser blocked) {
        this.blocker = blocker;
        this.blocked = blocked;
    }

    public Long getId() { return id; }
    public AppUser getBlocker() { return blocker; }
    public void setBlocker(AppUser blocker) { this.blocker = blocker; }
    public AppUser getBlocked() { return blocked; }
    public void setBlocked(AppUser blocked) { this.blocked = blocked; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
