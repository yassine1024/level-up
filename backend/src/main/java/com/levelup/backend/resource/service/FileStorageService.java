package com.levelup.backend.resource.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf",
            "docx",
            "txt",
            "mp3",
            "wav",
            "m4a",
            "ogg"
    );

    private final Path storageDirectory;

    public FileStorageService(
            @Value("${app.storage.location:./uploads}")
            String storageLocation
    ) {
        this.storageDirectory = Path.of(storageLocation)
                .toAbsolutePath()
                .normalize();
    }

    public StoredFile store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "The uploaded file must not be empty."
            );
        }

        String originalFileName = getSafeOriginalFileName(
                file.getOriginalFilename()
        );

        String extension = getExtension(originalFileName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Only PDF, DOCX, and TXT files are supported."
            );
        }

        Files.createDirectories(storageDirectory);

        // Never use a client-provided filename as the stored filename.
        String storageKey = UUID.randomUUID() + extension;

        Path destination = storageDirectory
                .resolve(storageKey)
                .normalize();

        if (!destination.startsWith(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid storage path."
            );
        }

        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination);
        }

        return new StoredFile(
                storageKey,
                originalFileName,
                file.getContentType(),
                file.getSize()
        );
    }

    public void delete(String storageKey) throws IOException {
        Path file = storageDirectory.resolve(storageKey).normalize();

        if (!file.startsWith(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid storage key."
            );
        }

        Files.deleteIfExists(file);
    }

    private String getSafeOriginalFileName(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException(
                    "The uploaded file must have a filename."
            );
        }

        // Handle both Windows and Unix path separators.
        String normalized = StringUtils.cleanPath(originalFileName)
                .replace('\\', '/');

        if (normalized.contains("..")) {
            throw new IllegalArgumentException(
                    "Invalid filename."
            );
        }

        int lastSlash = normalized.lastIndexOf('/');

        return normalized.substring(lastSlash + 1);
    }

    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');

        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return "";
        }

        return filename.substring(lastDot + 1)
                .toLowerCase(Locale.ROOT);
    }

    public record StoredFile(
            String storageKey,
            String originalFileName,
            String contentType,
            long sizeBytes
    ) {
    }
}