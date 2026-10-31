package com.levelup.backend.resource.service;


import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.resource.entity.ExtractionStatus;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.entity.LessonResourceVersion;
import com.levelup.backend.resource.repository.LessonResourceRepository;
import com.levelup.backend.resource.repository.LessonResourceVersionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LessonResourceService {

    private final LessonRepository lessonRepository;
    private final LessonResourceRepository resourceRepository;
    private final LessonResourceVersionRepository versionRepository;
    private final DocumentTextExtractor documentTextExtractor;
    private final FileStorageService fileStorageService;
    private final AudioFileValidator audioFileValidator;

    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "pdf", "application/pdf",
            "docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "txt", "text/plain"
    );

    @Transactional
    public void saveFile(
            Long lessonId,
            LessonResourceType type,
            MultipartFile file,
            Long uploadedBy
    ) throws IOException {
        if (type == LessonResourceType.WRITING_DESCRIPTION) {
            throw new IllegalArgumentException(
                    "Writing descriptions are text fields, not files."
            );
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Lesson not found: " + lessonId
                        )
                );

        String filename = StringUtils.cleanPath(
                file.getOriginalFilename()
        );

        String extension = StringUtils.getFilenameExtension(filename);

        if (extension == null) {
            throw new IllegalArgumentException(
                    "The uploaded file must have an extension."
            );
        }

        String contentType = CONTENT_TYPES.get(
                extension.toLowerCase(Locale.ROOT)
        );

        if (contentType == null) {
            throw new IllegalArgumentException(
                    "Only PDF, DOCX, and TXT files are supported."
            );
        }

        // Extract text (best effort); failures are recorded as ERROR but do not
        // abort the upload.
        String extractedText;
        ExtractionStatus status;
        try {
            extractedText = documentTextExtractor.extractText(file);
            status = extractionStatus(extractedText);
        } catch (RuntimeException exception) {
            extractedText = "";
            status = ExtractionStatus.ERROR;
        }

        String storageKey = String.valueOf(fileStorageService.store(file));

        LessonResource resource = resourceRepository
                .findByLesson_IdAndType(lessonId, type)
                .orElseGet(() -> newResource(lesson, type));

        resource.updateFile(
                filename,
                contentType,
                file.getSize(),
                storageKey,
                extractedText
        );
        resource.setUploadedBy(uploadedBy);
        resource.setExtractionStatus(status);

        // A new/changed file invalidates cached generated content (slides, exercises).
        lesson.incrementContentVersion();
        lessonRepository.save(lesson);

        LessonResource saved = resourceRepository.save(resource);
        versionRepository.save(new LessonResourceVersion(saved, uploadedBy, status));
    }


    @Transactional
    public void saveAudioFile(Long lessonId, MultipartFile file, Long uploadedBy) throws IOException {

        // Validate the audio before writing anything to disk.
        String contentType =
                audioFileValidator.validateAndGetContentType(file);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Lesson not found: " + lessonId
                        )
                );

        String filename = StringUtils.getFilename(
                StringUtils.cleanPath(file.getOriginalFilename())
        );

        String storageKey = String.valueOf(fileStorageService.store(file));

        LessonResource resource = resourceRepository
                .findByLesson_IdAndType(
                        lessonId,
                        LessonResourceType.LISTENING_1_AUDIO
                )
                .orElseGet(() -> newResource(
                        lesson,
                        LessonResourceType.LISTENING_1_AUDIO
                ));

        resource.updateFile(
                filename,
                contentType,
                file.getSize(),
                storageKey,
                ""
        );
        resource.setUploadedBy(uploadedBy);
        resource.setExtractionStatus(ExtractionStatus.OK);

        // A new/changed file invalidates cached generated content (slides, exercises).
        lesson.incrementContentVersion();
        lessonRepository.save(lesson);

        LessonResource saved = resourceRepository.save(resource);
        versionRepository.save(new LessonResourceVersion(saved, uploadedBy, ExtractionStatus.OK));
    }

    private LessonResource newResource(
            Lesson lesson,
            LessonResourceType type
    ) {

        return new LessonResource(lesson, type);
    }

    private ExtractionStatus extractionStatus(String text) {
        if (text == null || text.isBlank()) {
            return ExtractionStatus.EMPTY;
        }
        String trimmed = text.trim();
        if (trimmed.length() < 50) {
            return ExtractionStatus.TOO_SHORT;
        }
        long letters = trimmed.chars().filter(Character::isLetter).count();
        double ratio = (double) letters / (double) trimmed.length();
        if (ratio < 0.5) {
            return ExtractionStatus.MOSTLY_NON_TEXT;
        }
        return ExtractionStatus.OK;
    }



    @Transactional
    public void saveDescription(
            Long lessonId,
            LessonResourceType type,
            String description,
            Long uploadedBy
    ) {
        if (type != LessonResourceType.WRITING_DESCRIPTION
                && type != LessonResourceType.OTHER) {
            throw new IllegalArgumentException(
                    "Descriptions are only supported for Writing and Other."
            );
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Lesson not found: " + lessonId
                        )
                );

        LessonResource resource = resourceRepository
                .findByLesson_IdAndType(lessonId, type)
                .orElseGet(() -> newResource(lesson, type));

        // An empty description clears the saved description.
        resource.updateDescription(description);
        resource.setUploadedBy(uploadedBy);
        resource.setExtractionStatus(ExtractionStatus.OK);
        lesson.incrementContentVersion();
        lessonRepository.save(lesson);
        resourceRepository.save(resource);
    }
}