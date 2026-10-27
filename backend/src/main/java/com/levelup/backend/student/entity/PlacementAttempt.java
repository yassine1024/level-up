package com.levelup.backend.student.entity;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.LessonLevel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "placement_attempts")
public class PlacementAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int totalQuestions;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_level_id", nullable = false)
    private LessonLevel assignedLevel;

    @Column(nullable = false)
    private Instant completedAt = Instant.now();

    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    protected PlacementAttempt() {
    }

    public PlacementAttempt(User user, int score, int totalQuestions, LessonLevel assignedLevel) {
        this.user = user;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.assignedLevel = assignedLevel;
        this.completedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public int getScore() {
        return score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public LessonLevel getAssignedLevel() {
        return assignedLevel;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void applyScore(int score, LessonLevel assignedLevel) {
        this.score = score;
        this.assignedLevel = assignedLevel;
    }
}
