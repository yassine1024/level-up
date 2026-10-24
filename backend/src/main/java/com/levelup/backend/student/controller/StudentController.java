package com.levelup.backend.student.controller;

import com.levelup.backend.auth.entity.User;
import com.levelup.backend.student.dto.PlacementAnswerRequest;
import com.levelup.backend.student.dto.PlacementAttemptRequest;
import com.levelup.backend.student.dto.PlacementAttemptResponse;
import com.levelup.backend.student.dto.PlacementQuestionResponse;
import com.levelup.backend.student.dto.PracticeAnswerRequest;
import com.levelup.backend.student.dto.PracticeAnswerResponse;
import com.levelup.backend.student.dto.PracticeFinishResponse;
import com.levelup.backend.student.dto.PracticeSessionResponse;
import com.levelup.backend.student.dto.PracticeSessionStartRequest;
import com.levelup.backend.student.dto.ProgressResponse;
import com.levelup.backend.student.dto.ProgressUpdateRequest;
import com.levelup.backend.student.dto.SlideDeckResponse;
import com.levelup.backend.student.dto.StudentCourseResponse;
import com.levelup.backend.student.dto.WritingSubmissionResponse;
import com.levelup.backend.student.dto.WritingSubmitRequest;
import com.levelup.backend.student.dto.WritingTaskResponse;
import com.levelup.backend.student.entity.ExplanationLanguage;
import com.levelup.backend.student.service.LessonStudyService;
import com.levelup.backend.student.service.PlacementService;
import com.levelup.backend.student.service.PracticeSessionService;
import com.levelup.backend.student.service.StudentAccessService;
import com.levelup.backend.student.service.StudentCourseService;
import com.levelup.backend.student.service.StudentMistakeService;
import com.levelup.backend.student.dto.MistakeResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@Tag(name = "Student")
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/student")
public class StudentController {

    private final StudentAccessService accessService;
    private final PlacementService placementService;
    private final StudentCourseService courseService;
    private final LessonStudyService lessonStudyService;
    private final PracticeSessionService practiceSessionService;
    private final StudentMistakeService mistakeService;

    public StudentController(
            StudentAccessService accessService,
            PlacementService placementService,
            StudentCourseService courseService,
            LessonStudyService lessonStudyService,
            PracticeSessionService practiceSessionService,
            StudentMistakeService mistakeService
    ) {
        this.accessService = accessService;
        this.placementService = placementService;
        this.courseService = courseService;
        this.lessonStudyService = lessonStudyService;
        this.practiceSessionService = practiceSessionService;
        this.mistakeService = mistakeService;
    }

    @GetMapping("/placement-test/questions")
    public List<PlacementQuestionResponse> getPlacementQuestions(
            @RequestHeader("Authorization") String authorization
    ) {
        accessService.requireStudent(authorization);
        return placementService.getQuestions();
    }

    @PostMapping("/placement-test/attempts")
    public PlacementAttemptResponse submitPlacementAttempt(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody PlacementAttemptRequest request
    ) {
        User user = accessService.requireStudent(authorization);
        return placementService.submitAttempt(user, request);
    }

    @GetMapping("/course")
    public StudentCourseResponse getCourse(
            @RequestHeader("Authorization") String authorization
    ) {
        User user = accessService.requireStudent(authorization);
        return courseService.getCourse(user);
    }

    @PostMapping("/lessons/{lessonId}/slides/generate")
    public SlideDeckResponse generateSlides(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = "EN") ExplanationLanguage language
    ) {
        User user = accessService.requireStudent(authorization);
        return lessonStudyService.generateSlides(user, lessonId, language);
    }

    @PatchMapping("/lessons/{lessonId}/progress")
    public ProgressResponse updateProgress(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long lessonId,
            @Valid @RequestBody ProgressUpdateRequest request
    ) {
        User user = accessService.requireStudent(authorization);
        return lessonStudyService.updateProgress(user, lessonId, request.lastSlideIndex());
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ProgressResponse completeLesson(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long lessonId
    ) {
        User user = accessService.requireStudent(authorization);
        return lessonStudyService.completeLesson(user, lessonId);
    }

    @PostMapping("/lessons/{lessonId}/practice-sessions")
    public PracticeSessionResponse startPracticeSession(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long lessonId,
            @Valid @RequestBody PracticeSessionStartRequest request
    ) {
        User user = accessService.requireStudent(authorization);
        return practiceSessionService.start(user, lessonId, request.gameType());
    }

    @PostMapping("/practice-sessions/{sessionId}/answers")
    public PracticeAnswerResponse submitPracticeAnswer(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long sessionId,
            @Valid @RequestBody PracticeAnswerRequest request
    ) {
        User user = accessService.requireStudent(authorization);
        return practiceSessionService.submitAnswer(user, sessionId, request);
    }

    @PostMapping("/practice-sessions/{sessionId}/finish")
    public PracticeFinishResponse finishPracticeSession(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long sessionId
    ) {
        User user = accessService.requireStudent(authorization);
        return practiceSessionService.finish(user, sessionId);
    }

    @GetMapping("/lessons/{lessonId}/writing-task")
    public WritingTaskResponse getWritingTask(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long lessonId
    ) {
        accessService.requireStudent(authorization);
        return lessonStudyService.getWritingTask(lessonId);
    }

    @PostMapping("/lessons/{lessonId}/writing-submissions")
    public WritingSubmissionResponse submitWriting(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long lessonId,
            @Valid @RequestBody WritingSubmitRequest request
    ) {
        User user = accessService.requireStudent(authorization);
        return lessonStudyService.submitWriting(user, lessonId, request.text());
    }

    @GetMapping("/mistakes")
    public List<MistakeResponse> getMistakes(
            @RequestHeader("Authorization") String authorization
    ) {
        User user = accessService.requireStudent(authorization);
        return mistakeService.getMistakes(user);
    }
}
