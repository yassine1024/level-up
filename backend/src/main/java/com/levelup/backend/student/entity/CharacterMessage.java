package com.levelup.backend.student.entity;

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
@Table(name = "character_messages")
public class CharacterMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "episode_id", nullable = false)
    private CharacterEpisode episode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String correctionJson;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected CharacterMessage() {
    }

    public CharacterMessage(
            CharacterEpisode episode,
            Role role,
            String text,
            String correctionJson
    ) {
        this.episode = episode;
        this.role = role;
        this.text = text;
        this.correctionJson = correctionJson;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public CharacterEpisode getEpisode() {
        return episode;
    }

    public Role getRole() {
        return role;
    }

    public String getText() {
        return text;
    }

    public String getCorrectionJson() {
        return correctionJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public enum Role {
        CHARACTER,
        STUDENT
    }
}
