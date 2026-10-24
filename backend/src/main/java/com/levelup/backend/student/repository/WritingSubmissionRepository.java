package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.WritingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WritingSubmissionRepository extends JpaRepository<WritingSubmission, Long> {
}
