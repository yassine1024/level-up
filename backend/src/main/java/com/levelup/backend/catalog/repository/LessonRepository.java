package com.levelup.backend.catalog.repository;

import com.levelup.backend.catalog.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findAllByUnit_IdOrderByNumberAsc(Long unitId);

    Optional<Lesson> findByUnit_IdAndNumber(Long unitId, int number);
}