package com.levelup.backend.catalog.repository;

import com.levelup.backend.catalog.entity.LessonUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonUnitRepository
        extends JpaRepository<LessonUnit, Long> {

    List<LessonUnit> findAllByLevel_IdOrderByNumberAsc(String levelId);

    Optional<LessonUnit> findByLevel_IdAndNumber(
            String levelId,
            int number
    );
}
