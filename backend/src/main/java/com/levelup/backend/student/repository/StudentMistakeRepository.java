package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.StudentMistake;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentMistakeRepository extends JpaRepository<StudentMistake, Long> {

    List<StudentMistake> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
}
