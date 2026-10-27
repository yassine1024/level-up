package com.levelup.backend.student.entity;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
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
@Table(name = "character_episodes")
public class CharacterEpisode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User student;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String episodeJson;

    @Column(nullable = false)
    private boolean finished;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected CharacterEpisode() {
    }

    public CharacterEpisode(Lesson lesson, User student, String episodeJson) {
        this.lesson = lesson;
        this.student = student;
        this.episodeJson = episodeJson;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public User getStudent() {
        return student;
    }

    public String getEpisodeJson() {
        return episodeJson;
    }

    public boolean isFinished() {
        return finished;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void finish() {
        this.finished = true;
    }
}
