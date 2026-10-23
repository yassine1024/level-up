package com.levelup.backend.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "lesson_units",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_lesson_unit_level_number",
                        columnNames = {"level_id", "number"}
                )
        }
)
public class LessonUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "level_id", nullable = false)
    private LessonLevel level;

    @Column(name = "number", nullable = false)
    private int number;

    @Column(nullable = false, length = 150)
    private String title;

    protected LessonUnit() {
        // Required by JPA.
    }

    public LessonUnit(LessonLevel level, int number, String title) {
        this.level = level;
        this.number = number;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public LessonLevel getLevel() {
        return level;
    }

    public int getNumber() {
        return number;
    }

    public String getTitle() {
        return title;
    }
}