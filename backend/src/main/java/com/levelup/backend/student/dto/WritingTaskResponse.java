package com.levelup.backend.student.dto;

public record WritingTaskResponse(
        Long lessonId,
        String instructions
) {
}
