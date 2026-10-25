package com.levelup.backend.student.service;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.student.dto.MistakeResponse;
import com.levelup.backend.student.entity.StudentMistake;
import com.levelup.backend.student.repository.StudentMistakeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentMistakeService {

    private final StudentMistakeRepository mistakeRepository;

    public StudentMistakeService(StudentMistakeRepository mistakeRepository) {
        this.mistakeRepository = mistakeRepository;
    }

    @Transactional(readOnly = true)
    public List<MistakeResponse> getMistakes(User user) {
        return mistakeRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(mistake -> new MistakeResponse(
                        mistake.getId(),
                        mistake.getLesson() == null ? null : mistake.getLesson().getId(),
                        mistake.getPrompt(),
                        mistake.getStudentAnswer(),
                        mistake.getCorrection(),
                        mistake.getExplanation(),
                        mistake.getCreatedAt()
                ))
                .toList();
    }
}
