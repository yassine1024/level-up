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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "student_mistakes")
public class StudentMistake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(nullable = false, length = 500)
    private String prompt;

    @Column(nullable = false, length = 500)
    private String studentAnswer;

    @Column(nullable = false, length = 500)
    private String correction;

    @Column(nullable = false, length = 1000)
    private String explanation;

    @Column(length = 150)
    private String focus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MistakeSource source = MistakeSource.PLACEMENT;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected StudentMistake() {
    }

    public StudentMistake(
            User user,
            Lesson lesson,
            String prompt,
            String studentAnswer,
            String correction,
            String explanation
    ) {
        this(user, lesson, prompt, studentAnswer, correction, explanation, "", MistakeSource.PLACEMENT);
    }

    public StudentMistake(
            User user,
            Lesson lesson,
            String prompt,
            String studentAnswer,
            String correction,
            String explanation,
            String focus,
            MistakeSource source
    ) {
        this.user = user;
        this.lesson = lesson;
        this.prompt = prompt;
        this.studentAnswer = studentAnswer;
        this.correction = correction;
        this.explanation = explanation;
        this.focus = focus;
        this.source = source;
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

    public String getPrompt() {
        return prompt;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public String getCorrection() {
        return correction;
    }

    public String getExplanation() {
        return explanation;
    }

    public String getFocus() {
        return focus;
    }

    public MistakeSource getSource() {
        return source;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
