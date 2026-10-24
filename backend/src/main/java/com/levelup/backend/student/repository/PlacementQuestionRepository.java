package com.levelup.backend.student.repository;

import com.levelup.backend.student.entity.PlacementQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlacementQuestionRepository extends JpaRepository<PlacementQuestion, Long> {

    List<PlacementQuestion> findAllByOrderBySortOrderAsc();
}
