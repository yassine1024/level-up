package com.levelup.backend.resource.controller;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.auth.repository.UserRepository;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.student.entity.LessonProgress;
import com.levelup.backend.student.entity.ProgressStatus;
import com.levelup.backend.student.repository.LessonProgressRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherStudentController {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;

    public TeacherStudentController(
            UserRepository userRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository progressRepository
    ) {
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
    }

    @GetMapping("/students")
    public List<Map<String, Object>> listStudents(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        long totalLessons = lessonRepository.count();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (u.getRole() != User.Role.STUDENT) continue;
            List<LessonProgress> progress =
                    progressRepository.findAllByUser_Id(u.getId());
            long completed = progress.stream()
                    .filter(p -> p.getStatus() == ProgressStatus.COMPLETED)
                    .count();
            int progressPct = totalLessons > 0
                    ? (int) Math.round(completed * 100.0 / totalLessons)
                    : 0;
            String level = progress.stream()
                    .map(p -> p.getLesson().getUnit().getLevel().getId())
                    .findFirst()
                    .orElse("A1");
            String lastActive = u.getLastLoginAt() != null
                    ? u.getLastLoginAt().toString()
                    : (u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getUsername());
            m.put("level", level);
            m.put("progress", progressPct);
            m.put("lastActive", lastActive);
            result.add(m);
        }
        return result;
    }
}