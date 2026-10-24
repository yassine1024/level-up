package com.levelup.backend.resource.controller;


import com.levelup.backend.resource.dto.SaveLessonResourcesResponse;
import com.levelup.backend.resource.entity.LessonResourceType;
import com.levelup.backend.resource.service.LessonResourceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@RestController
@Tag(name = "Teacher Resources")
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/teacher/lessons")
@RequiredArgsConstructor
public class TeacherLessonResourceController {

    private final LessonResourceService resourceService;

    @PostMapping(
            value = "/{lessonId}/resources",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public SaveLessonResourcesResponse uploadResources(
            @PathVariable Long lessonId,
            @RequestParam(required = false) MultipartFile vocabulary,
            @RequestParam(required = false) MultipartFile grammar,
            @RequestParam(required = false) MultipartFile pronunciation,
            @RequestParam(required = false) MultipartFile listening1,
            @RequestParam(name = "listeningAudio", required = false)
            MultipartFile listeningAudio,
            @RequestParam(required = false) MultipartFile listening2,
            @RequestParam(required = false) MultipartFile other,
            @RequestParam(required = false) String writingDescription,
            @RequestParam(required = false) String otherDescription
    ) throws IOException {
        // These two sections are not available in the MVP.
        rejectUnavailable(pronunciation, "Pronunciation");
        rejectUnavailable(listening2, "Listening 2");

        boolean hasChanges =
                hasSelectedFile(vocabulary)
                        || hasSelectedFile(grammar)
                        || hasSelectedFile(listening1)
                        || hasSelectedFile(listeningAudio)
                        || hasSelectedFile(other)
                        || writingDescription != null
                        || otherDescription != null;

        if (!hasChanges) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide at least one file or description."
            );
        }

        if (hasSelectedFile(vocabulary)) {
            resourceService.saveFile(
                    lessonId, LessonResourceType.VOCABULARY, vocabulary
            );
        }

        if (hasSelectedFile(grammar)) {
            resourceService.saveFile(
                    lessonId, LessonResourceType.GRAMMAR, grammar
            );
        }

        if (hasSelectedFile(listening1)) {
            resourceService.saveFile(
                    lessonId, LessonResourceType.LISTENING_1, listening1
            );
        }

        if (hasSelectedFile(listeningAudio)) {
            resourceService.saveAudioFile(lessonId, listeningAudio);
        }

        if (hasSelectedFile(other)) {
            resourceService.saveFile(
                    lessonId, LessonResourceType.OTHER, other
            );
        }

        // Only update a description when its field was supplied.
        // This allows an empty string to clear an existing description.
        if (writingDescription != null) {
            resourceService.saveDescription(
                    lessonId,
                    LessonResourceType.WRITING_DESCRIPTION,
                    writingDescription
            );
        }

        if (otherDescription != null) {
            resourceService.saveDescription(
                    lessonId,
                    LessonResourceType.OTHER,
                    otherDescription
            );
        }

        return new SaveLessonResourcesResponse(lessonId, Instant.now());
    }

    private boolean hasSelectedFile(MultipartFile file) {
        return file != null
                && file.getOriginalFilename() != null
                && !file.getOriginalFilename().isBlank();
    }

    private void rejectUnavailable(
            MultipartFile file,
            String sectionName
    ) {
        if (hasSelectedFile(file)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    sectionName + " uploads are not available yet."
            );
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception
    ) {
        return ResponseEntity.badRequest().body(
                Map.of("error", exception.getMessage())
        );
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            EntityNotFoundException exception
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", exception.getMessage())
        );
    }
}