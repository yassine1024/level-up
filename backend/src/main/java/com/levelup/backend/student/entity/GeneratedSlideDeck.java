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
        name = "generated_slide_decks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_slide_deck_lesson_version_lang",
                        columnNames = {"lesson_id", "content_version", "language"}
                )
        }
)
public class GeneratedSlideDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "content_version", nullable = false)
    private int contentVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private ExplanationLanguage language;

    @Lob
    @Column(nullable = false)
    private String slidesJson;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected GeneratedSlideDeck() {
    }

    public GeneratedSlideDeck(
            Lesson lesson,
            int contentVersion,
            ExplanationLanguage language,
            String slidesJson
    ) {
        this.lesson = lesson;
        this.contentVersion = contentVersion;
        this.language = language;
        this.slidesJson = slidesJson;
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

    public ExplanationLanguage getLanguage() {
        return language;
    }

    public String getSlidesJson() {
        return slidesJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
