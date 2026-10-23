package com.levelup.backend.resource.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class AudioFileValidator {

    private static final long MAX_SIZE_BYTES = 25L * 1024 * 1024;

    private static final Map<String, Set<String>> ALLOWED_AUDIO_TYPES =
            Map.of(
                    "mp3", Set.of(
                            "audio/mpeg",
                            "audio/mp3",
                            "audio/x-mpeg"
                    ),
                    "wav", Set.of(
                            "audio/vnd.wave",
                            "audio/wav",
                            "audio/x-wav"
                    ),
                    "m4a", Set.of(
                            "audio/mp4",
                            "audio/x-m4a",
                            "audio/m4a"
                    ),
                    "ogg", Set.of(
                            "audio/ogg",
                            "application/ogg"
                    )
            );

    private final Tika tika = new Tika();

    public String validateAndGetContentType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "A non-empty audio file is required."
            );
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "Audio files must not exceed 25 MB."
            );
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException(
                    "The audio file must have a filename."
            );
        }

        String filename = StringUtils.getFilename(
                StringUtils.cleanPath(originalFilename)
        );

        String extension = StringUtils.getFilenameExtension(filename);

        if (extension == null) {
            throw new IllegalArgumentException(
                    "The audio file must have an extension."
            );
        }

        extension = extension.toLowerCase(Locale.ROOT);

        Set<String> allowedTypes = ALLOWED_AUDIO_TYPES.get(extension);

        if (allowedTypes == null) {
            throw new IllegalArgumentException(
                    "Unsupported audio format. Use MP3, WAV, M4A, or OGG."
            );
        }

        final String detectedType;

        try (InputStream input = file.getInputStream()) {
            detectedType = tika.detect(input, filename)
                    .split(";", 2)[0]
                    .trim()
                    .toLowerCase(Locale.ROOT);
        } catch (IOException exception) {
            throw new IllegalArgumentException(
                    "Unable to read the audio file.", exception
            );
        }

        if (!allowedTypes.contains(detectedType)) {
            throw new IllegalArgumentException(
                    "The audio content does not match its filename extension."
            );
        }

        return detectedType;
    }
}