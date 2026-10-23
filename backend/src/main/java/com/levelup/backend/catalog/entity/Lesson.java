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
        name = "lessons",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_lesson_unit_number",
                        columnNames = {"unit_id", "number"}
                )
        }
)
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private LessonUnit unit;

    @Column(name = "number", nullable = false)
    private int number;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "content_version", nullable = false)
    private int contentVersion = 0;

    @Column(nullable = false)
    private boolean published = true;

    protected Lesson() {
        // Required by JPA.
    }

    public Lesson(LessonUnit unit, int number, String title) {
        this.unit = unit;
        this.number = number;
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public LessonUnit getUnit() {
        return unit;
    }

    public int getNumber() {
        return number;
    }

    public String getTitle() {
        return title;
    }

    public int getContentVersion() {
        return contentVersion;
    }

    public boolean isPublished() {
        return published;
    }

    public void incrementContentVersion() {
        this.contentVersion++;
    }
}