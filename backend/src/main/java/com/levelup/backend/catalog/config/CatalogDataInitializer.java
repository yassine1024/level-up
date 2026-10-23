package com.levelup.backend.catalog.config;

import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.entity.LessonLevel;
import com.levelup.backend.catalog.entity.LessonUnit;
import com.levelup.backend.catalog.repository.LessonLevelRepository;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.catalog.repository.LessonUnitRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class CatalogDataInitializer {

    @Bean
    CommandLineRunner seedCatalog(
            LessonLevelRepository levelRepository,
            LessonUnitRepository unitRepository,
            LessonRepository lessonRepository
    ) {
        return args -> initializeCatalog(
                levelRepository,
                unitRepository,
                lessonRepository
        );
    }

    @Transactional
    void initializeCatalog(
            LessonLevelRepository levelRepository,
            LessonUnitRepository unitRepository,
            LessonRepository lessonRepository
    ) {
        LessonLevel level = levelRepository.findById("A1")
                .orElseGet(() -> levelRepository.save(
                        new LessonLevel("A1", "Beginner", 1)
                ));

        LessonUnit unit1 = unitRepository
                .findByLevel_IdAndNumber(level.getId(), 1)
                .orElseGet(() -> unitRepository.save(
                        new LessonUnit(
                                level, 1, "Greetings and Introductions"
                        )
                ));

        LessonUnit unit2 = unitRepository
                .findByLevel_IdAndNumber(level.getId(), 2)
                .orElseGet(() -> unitRepository.save(
                        new LessonUnit(
                                level, 2, "Everyday English"
                        )
                ));

        seedLesson(lessonRepository, unit1, 1, "Hello and Introductions");
        seedLesson(lessonRepository, unit1, 2, "Personal Information");
        seedLesson(lessonRepository, unit1, 3, "Countries and Nationalities");

        seedLesson(lessonRepository, unit2, 1, "Daily Routines");
        seedLesson(lessonRepository, unit2, 2, "Time and Schedules");
        seedLesson(lessonRepository, unit2, 3, "Everyday Activities");
    }

    private void seedLesson(
            LessonRepository repository,
            LessonUnit unit,
            int number,
            String title
    ) {
        repository.findByUnit_IdAndNumber(unit.getId(), number)
                .orElseGet(() -> repository.save(
                        new Lesson(unit, number, title)
                ));
    }
}