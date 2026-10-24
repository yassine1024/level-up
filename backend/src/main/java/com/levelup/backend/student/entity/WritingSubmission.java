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
@Table(name = "writing_submissions")
public class WritingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Lob
    @Column(nullable = false)
    private String studentText;

    @Lob
    @Column(nullable = false)
    private String feedback;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected WritingSubmission() {
    }

    public WritingSubmission(User user, Lesson lesson, String studentText, String feedback) {
        this.user = user;
        this.lesson = lesson;
        this.studentText = studentText;
        this.feedback = feedback;
        this.createdAt = Instant.now();
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

    public String getStudentText() {
        return studentText;
    }

    public String getFeedback() {
        return feedback;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
