package com.levelup.backend.student.entity;

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
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "generated_exercise_sets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_exercise_set_lesson_version_game",
                        columnNames = {"lesson_id", "content_version", "game_type"}
                )
        }
)
public class GeneratedExerciseSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "content_version", nullable = false)
    private int contentVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false, length = 20)
    private GameType gameType;

    @Lob
    @Column(nullable = false)
    private String questionsJson;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected GeneratedExerciseSet() {
    }

    public GeneratedExerciseSet(
            Lesson lesson,
            int contentVersion,
            GameType gameType,
            String questionsJson
    ) {
        this.lesson = lesson;
        this.contentVersion = contentVersion;
        this.gameType = gameType;
        this.questionsJson = questionsJson;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public int getContentVersion() {
        return contentVersion;
    }

    public GameType getGameType() {
        return gameType;
    }

    public String getQuestionsJson() {
        return questionsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
