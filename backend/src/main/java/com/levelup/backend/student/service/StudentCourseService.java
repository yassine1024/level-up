package com.levelup.backend.student.service;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.entity.LessonLevel;
import com.levelup.backend.catalog.entity.LessonUnit;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.catalog.repository.LessonUnitRepository;
import com.levelup.backend.student.dto.StudentCourseResponse;
import com.levelup.backend.student.entity.LessonProgress;
import com.levelup.backend.student.entity.PlacementAttempt;
import com.levelup.backend.student.entity.ProgressStatus;
import com.levelup.backend.student.repository.LessonProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentCourseService {

    private final PlacementService placementService;
    private final LessonUnitRepository unitRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;

    public StudentCourseService(
            PlacementService placementService,
            LessonUnitRepository unitRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository
    ) {
        this.placementService = placementService;
        this.unitRepository = unitRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
    }

    @Transactional(readOnly = true)
    public StudentCourseResponse getCourse(User user) {
        PlacementAttempt attempt = placementService.latestAttempt(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Complete the placement test first"
                ));

        LessonLevel level = attempt.getAssignedLevel();
        List<LessonUnit> units = unitRepository.findAllByLevel_IdOrderByNumberAsc(level.getId());
        if (units.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No units for assigned level");
        }

        Map<Long, ProgressStatus> progressByLesson = progressRepository
                .findAllByUser_IdAndLesson_Unit_Level_Id(user.getId(), level.getId())
                .stream()
                .collect(Collectors.toMap(
                        progress -> progress.getLesson().getId(),
                        LessonProgress::getStatus
                ));

        List<StudentCourseResponse.UnitSummary> previous = new ArrayList<>();
        List<StudentCourseResponse.UnitSummary> next = new ArrayList<>();
        StudentCourseResponse.CurrentUnit currentUnit = null;
        boolean foundCurrent = false;

        for (LessonUnit unit : units) {
            List<Lesson> lessons = lessonRepository.findAllByUnit_IdOrderByNumberAsc(unit.getId()).stream()
                    .filter(Lesson::isPublished)
                    .toList();
            if (lessons.isEmpty()) {
                continue;
            }

            int completed = 0;
            Lesson firstIncomplete = null;
            for (Lesson lesson : lessons) {
                ProgressStatus status = progressByLesson.get(lesson.getId());
                if (status == ProgressStatus.COMPLETED) {
                    completed++;
                } else if (firstIncomplete == null) {
                    firstIncomplete = lesson;
                }
            }

            boolean unitComplete = completed == lessons.size();
            if (!foundCurrent && !unitComplete) {
                Lesson currentLesson = firstIncomplete != null ? firstIncomplete : lessons.getLast();
                currentUnit = new StudentCourseResponse.CurrentUnit(
                        unit.getNumber(),
                        unit.getTitle(),
                        completed,
                        lessons.size(),
                        lessons.isEmpty() ? 0 : (double) completed / lessons.size(),
                        new StudentCourseResponse.CurrentLesson(
                                currentLesson.getId(),
                                currentLesson.getNumber(),
                                currentLesson.getTitle()
                        )
                );
                foundCurrent = true;
            } else if (!foundCurrent && unitComplete) {
                previous.add(new StudentCourseResponse.UnitSummary(unit.getNumber(), unit.getTitle()));
            } else {
                next.add(new StudentCourseResponse.UnitSummary(unit.getNumber(), unit.getTitle()));
            }
        }

        if (currentUnit == null) {
            LessonUnit lastUnit = units.getLast();
            List<Lesson> lessons = lessonRepository.findAllByUnit_IdOrderByNumberAsc(lastUnit.getId()).stream()
                    .filter(Lesson::isPublished)
                    .toList();
            if (lessons.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No published lessons");
            }
            Lesson lastLesson = lessons.getLast();
            currentUnit = new StudentCourseResponse.CurrentUnit(
                    lastUnit.getNumber(),
                    lastUnit.getTitle(),
                    lessons.size(),
                    lessons.size(),
                    1.0,
                    new StudentCourseResponse.CurrentLesson(
                            lastLesson.getId(),
                            lastLesson.getNumber(),
                            lastLesson.getTitle()
                    )
            );
            previous.removeIf(summary -> summary.number() == lastUnit.getNumber());
        }

        return new StudentCourseResponse(
                level.getId(),
                level.getName(),
                previous,
                currentUnit,
                next
        );
    }
}
