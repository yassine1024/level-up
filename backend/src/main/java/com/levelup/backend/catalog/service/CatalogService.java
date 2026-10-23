package com.levelup.backend.catalog.service;

import com.levelup.backend.catalog.dto.LessonLevelResponse;
import com.levelup.backend.catalog.dto.LessonResponse;
import com.levelup.backend.catalog.dto.LessonUnitResponse;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.entity.LessonLevel;
import com.levelup.backend.catalog.entity.LessonUnit;
import com.levelup.backend.catalog.repository.LessonLevelRepository;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.catalog.repository.LessonUnitRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CatalogService {

    private final LessonLevelRepository levelRepository;
    private final LessonUnitRepository unitRepository;
    private final LessonRepository lessonRepository;

    public CatalogService(
            LessonLevelRepository levelRepository,
            LessonUnitRepository unitRepository,
            LessonRepository lessonRepository
    ) {
        this.levelRepository = levelRepository;
        this.unitRepository = unitRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional(readOnly = true)
    public List<LessonLevelResponse> getLevels() {
        return levelRepository
                .findAll(Sort.by(Sort.Direction.ASC, "sortOrder"))
                .stream()
                .map(this::toLevelResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LessonUnitResponse> getUnits(String levelId) {
        if (!levelRepository.existsById(levelId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Level not found: " + levelId
            );
        }

        return unitRepository
                .findAllByLevel_IdOrderByNumberAsc(levelId)
                .stream()
                .map(this::toUnitResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getLessons(Long unitId) {
        if (!unitRepository.existsById(unitId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Unit not found: " + unitId
            );
        }

        return lessonRepository
                .findAllByUnit_IdOrderByNumberAsc(unitId)
                .stream()
                .map(this::toLessonResponse)
                .toList();
    }

    private LessonLevelResponse toLevelResponse(LessonLevel level) {
        return new LessonLevelResponse(
                level.getId(),
                level.getName()
        );
    }

    private LessonUnitResponse toUnitResponse(LessonUnit unit) {
        return new LessonUnitResponse(
                unit.getId(),
                unit.getLevel().getId(),
                unit.getNumber(),
                unit.getTitle()
        );
    }

    private LessonResponse toLessonResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getUnit().getId(),
                lesson.getNumber(),
                lesson.getTitle()
        );
    }
}