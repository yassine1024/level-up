package com.levelup.backend.student.dto;

import java.util.List;

public record StudentCourseResponse(
        String levelId,
        String levelName,
        List<UnitSummary> previousUnits,
        CurrentUnit currentUnit,
        List<UnitSummary> nextUnits
) {
    public record UnitSummary(int number, String title) {
    }

    public record CurrentLesson(Long id, int number, String title) {
    }

    public record CurrentUnit(
            int number,
            String title,
            int completedLessons,
            int totalLessons,
            double progress,
            CurrentLesson currentLesson
    ) {
    }
}
