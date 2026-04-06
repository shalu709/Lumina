package com.lumina.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "global_messages")
public class GlobalMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private AppUser sender;

    @Column(nullable = false, length = 1000)
    private String content;

    // Predefined channels: general, gate-prep, java-help, placements, off-topic
    @Column(nullable = false)
    private String channel;

    private int reportCount = 0;
    private boolean isHidden = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public GlobalMessage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getSender() { return sender; }
    public void setSender(AppUser sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public int getReportCount() { return reportCount; }
    public void setReportCount(int r) { this.reportCount = r; }
    public boolean isHidden() { return isHidden; }
    public void setHidden(boolean h) { this.isHidden = h; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
