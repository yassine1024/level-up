package com.levelup.backend.student.entity;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "practice_sessions")
public class PracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameType gameType;

    @Lob
    @Column(nullable = false)
    private String questionsJson;

    @Column(nullable = false)
    private boolean finished = false;

    private Integer score;

    private Integer totalQuestions;

    @Column(nullable = false)
    private Instant startedAt = Instant.now();

    private Instant finishedAt;

    protected PracticeSession() {
    }

    public PracticeSession(User user, Lesson lesson, GameType gameType, String questionsJson) {
        this.user = user;
        this.lesson = lesson;
        this.gameType = gameType;
        this.questionsJson = questionsJson;
        this.startedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public GameType getGameType() {
        return gameType;
    }

    public String getQuestionsJson() {
        return questionsJson;
    }

    public boolean isFinished() {
        return finished;
    }

    public Integer getScore() {
        return score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void finish(int score, int totalQuestions) {
        this.finished = true;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.finishedAt = Instant.now();
    }
}
