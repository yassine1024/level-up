package com.levelup.backend.resource.service;


import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.repository.LessonResourceRepository;
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
            MultipartFile file
    ) throws IOException {
        if (type == LessonResourceType.WRITING_DESCRIPTION) {
            throw new IllegalArgumentException(
                    "Writing descriptions are text fields, not files."
            );
        }

        // Validate the file and extract its text before storing it.
        String extractedText = documentTextExtractor.extractText(file);

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

        // Adapt this call if your FileStorageService uses a different
        // method name or return type.
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

        resourceRepository.save(resource);
    }


    @Transactional
    public void saveAudioFile(Long lessonId, MultipartFile file) throws IOException {

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

        resourceRepository.save(resource);
    }

    private LessonResource newResource(
            Lesson lesson,
            LessonResourceType type
    ) {

        return new LessonResource(lesson, type);
    }



    @Transactional
    public void saveDescription(
            Long lessonId,
            LessonResourceType type,
            String description
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
        resourceRepository.save(resource);
    }
}