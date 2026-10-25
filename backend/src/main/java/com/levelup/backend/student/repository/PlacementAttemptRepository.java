package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.PlacementAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlacementAttemptRepository extends JpaRepository<PlacementAttempt, Long> {

    Optional<PlacementAttempt> findFirstByUser_IdOrderByCompletedAtDesc(Long userId);
}
