package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByUser_IdAndLesson_Id(Long userId, Long lessonId);

    List<LessonProgress> findAllByUser_Id(Long userId);

    List<LessonProgress> findAllByUser_IdAndLesson_Unit_Level_Id(Long userId, String levelId);
}
