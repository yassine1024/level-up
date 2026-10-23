package com.levelup.backend.resource.service;


import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class DocumentTextExtractorTest {

    private final DocumentTextExtractor extractor =
            new DocumentTextExtractor();

    @Test
    void extractsTextFromTxtFile() {
        var file = new MockMultipartFile(
                "file",
                "lesson.txt",
                "text/plain",
                "Hello Level Up".getBytes(StandardCharsets.UTF_8)
        );

        assertEquals("Hello Level Up", extractor.extractText(file));
    }

    @Test
    void rejectsUnsupportedFileExtension() {
        var file = new MockMultipartFile(
                "file",
                "lesson.png",
                "image/png",
                "some content".getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> extractor.extractText(file)
        );
    }

    @Test
    void rejectsTextRenamedAsPdf() {
        var file = new MockMultipartFile(
                "file",
                "lesson.pdf",
                "application/pdf",
                "This is ordinary text, not a PDF."
                        .getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> extractor.extractText(file)
        );
    }
}