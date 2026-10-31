package com.levelup.backend.resource.entity;

import com.levelup.backend.catalog.entity.Lesson;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "lesson_resources",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_lesson_resource_type",
                        columnNames = {"lesson_id", "resource_type"}
                )
        }
)
public class LessonResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 40)
    private LessonResourceType type;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "storage_key", length = 255)
    private String storageKey;

    @Lob
    @Column(name = "extracted_text")
    private String extractedText;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "extraction_status", length = 30)
    private ExtractionStatus extractionStatus;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public LessonResource() {
        // Required by JPA.
    }

    public LessonResource(
            Lesson lesson,
            LessonResourceType type
    ) {
        this.lesson = lesson;
        this.type = type;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public LessonResourceType getType() {
        return type;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public String getDescription() {
        return description;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public ExtractionStatus getExtractionStatus() {
        return extractionStatus;
    }

    public void setExtractionStatus(ExtractionStatus extractionStatus) {
        this.extractionStatus = extractionStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateFile(
            String fileName,
            String contentType,
            long sizeBytes,
            String storageKey,
            String extractedText
    ) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.storageKey = storageKey;
        this.extractedText = extractedText;
    }

    public void updateDescription(String description) {
        this.description = description;
    }
}