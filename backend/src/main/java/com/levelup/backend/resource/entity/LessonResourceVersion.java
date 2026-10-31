package com.levelup.backend.resource.entity;

import com.levelup.backend.catalog.entity.Lesson;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "lesson_resource_versions")
public class LessonResourceVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_resource_id")
    private Long lessonResourceId;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "extraction_status", length = 30)
    private ExtractionStatus extractionStatus;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected LessonResourceVersion() {
    }

    public LessonResourceVersion(
            LessonResource resource,
            Long uploadedBy,
            ExtractionStatus status
    ) {
        this.lessonResourceId = resource.getId();
        this.lesson = resource.getLesson();
        this.type = resource.getType();
        this.fileName = resource.getFileName();
        this.contentType = resource.getContentType();
        this.sizeBytes = resource.getSizeBytes();
        this.storageKey = resource.getStorageKey();
        this.extractedText = resource.getExtractedText();
        this.extractionStatus = status;
        this.uploadedBy = uploadedBy;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getLessonResourceId() { return lessonResourceId; }
    public Lesson getLesson() { return lesson; }
    public LessonResourceType getType() { return type; }
    public String getFileName() { return fileName; }
    public String getContentType() { return contentType; }
    public Long getSizeBytes() { return sizeBytes; }
    public String getStorageKey() { return storageKey; }
    public String getExtractedText() { return extractedText; }
    public ExtractionStatus getExtractionStatus() { return extractionStatus; }
    public Long getUploadedBy() { return uploadedBy; }
    public Instant getCreatedAt() { return createdAt; }
}