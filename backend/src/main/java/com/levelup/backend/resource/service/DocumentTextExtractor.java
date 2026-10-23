package com.levelup.backend.resource.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;

@Service
public class DocumentTextExtractor {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "pdf", "application/pdf",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "txt", "text/plain"
    );

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A non-empty file is required.");
        }

        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("The file must have a name.");
        }

        String cleanFilename = StringUtils.cleanPath(filename);
        String extension = StringUtils.getFilenameExtension(cleanFilename);

        if (extension == null) {
            throw new IllegalArgumentException("The file must have an extension.");
        }

        extension = extension.toLowerCase(Locale.ROOT);

        String expectedType = ALLOWED_TYPES.get(extension);

        if (expectedType == null) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Only PDF, DOCX, and TXT are allowed."
            );
        }

        // Detect the actual content instead of trusting the filename or
        // the Content-Type supplied by the client.
        try (InputStream input = file.getInputStream()) {
            String detectedType = tika.detect(input, cleanFilename);
            detectedType = detectedType.split(";", 2)[0]
                    .trim()
                    .toLowerCase(Locale.ROOT);

            if (!expectedType.equals(detectedType)) {
                throw new IllegalArgumentException(
                        "The file content does not match its extension."
                );
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException(
                    "Unable to read the uploaded file.", exception
            );
        }

        // Reopen the stream because content detection has already read it.
        try (InputStream input = file.getInputStream()) {
            String extractedText = tika.parseToString(input).trim();

            if (extractedText.isBlank()) {
                throw new IllegalArgumentException(
                        "The document contains no extractable text."
                );
            }

            return extractedText;
        } catch (IOException | TikaException exception) {
            throw new IllegalArgumentException(
                    "Unable to extract text from the document.", exception
            );
        }
    }
}