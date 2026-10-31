package com.levelup.backend.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.levelup.backend.admin.entity.AuditLog;
import com.levelup.backend.admin.service.AuditLogService;
import com.levelup.backend.agent.AgentsClient;
import com.levelup.backend.agent.GenerationRun;
import com.levelup.backend.agent.GenerationRunRepository;
import com.levelup.backend.agent.GenerationRunStatus;
import com.levelup.backend.auth.entity.User;
import com.levelup.backend.auth.repository.UserRepository;
import com.levelup.backend.auth.service.AdminAccessService;
import com.levelup.backend.catalog.entity.Lesson;
import com.levelup.backend.catalog.repository.LessonRepository;
import com.levelup.backend.resource.entity.LessonResource;
import com.levelup.backend.resource.repository.LessonResourceRepository;
import com.levelup.backend.student.entity.GeneratedExerciseSet;
import com.levelup.backend.student.entity.GeneratedSlideDeck;
import com.levelup.backend.student.repository.GeneratedExerciseSetRepository;
import com.levelup.backend.student.repository.GeneratedSlideDeckRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAccessService adminAccessService;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LessonResourceRepository resourceRepository;
    private final GenerationRunRepository runRepository;
    private final GeneratedExerciseSetRepository exerciseSetRepository;
    private final GeneratedSlideDeckRepository slideDeckRepository;
    private final AuditLogService auditLogService;
    private final AgentsClient agentsClient;
    private final ObjectMapper objectMapper;

    public AdminController(AdminAccessService adminAccessService,
                           UserRepository userRepository,
                           LessonRepository lessonRepository,
                           LessonResourceRepository resourceRepository,
                           GenerationRunRepository runRepository,
                           GeneratedExerciseSetRepository exerciseSetRepository,
                           GeneratedSlideDeckRepository slideDeckRepository,
                           AuditLogService auditLogService,
                           AgentsClient agentsClient,
                           ObjectMapper objectMapper) {
        this.adminAccessService = adminAccessService;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
        this.resourceRepository = resourceRepository;
        this.runRepository = runRepository;
        this.exerciseSetRepository = exerciseSetRepository;
        this.slideDeckRepository = slideDeckRepository;
        this.auditLogService = auditLogService;
        this.agentsClient = agentsClient;
        this.objectMapper = objectMapper;
    }

    private User admin(String auth) {
        return adminAccessService.requireAdmin(auth);
    }

    private Pageable pageable(int page, int size, String sort) {
        int s = Math.min(Math.max(size, 1), 100);
        Sort st = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC : Sort.Direction.DESC;
            st = Sort.by(dir, parts[0]);
        }
        return PageRequest.of(Math.max(page, 0), s, st);
    }

    @GetMapping("/overview")
    public Map<String, Object> overview(@RequestHeader(value = "Authorization", required = false) String authorization) {
        admin(authorization);
        long teachers = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.TEACHER).count();
        long students = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.STUDENT).count();
        long lessons = lessonRepository.count();
        long runs = runRepository.count();
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (GenerationRunStatus st : GenerationRunStatus.values()) byStatus.put(st.name(), 0L);
        for (GenerationRun r : runRepository.findAll()) {
            byStatus.put(r.getStatus().name(), byStatus.get(r.getStatus().name()) + 1);
        }
        double avgLatency = runRepository.findAll().stream()
                .filter(r -> r.getLatencyMs() != null)
                .mapToLong(GenerationRun::getLatencyMs).average().orElse(0);
        List<GenerationRun> recentFailures = runRepository.findAll().stream()
                .filter(r -> r.getStatus() == GenerationRunStatus.FALLBACK_USED
                        || r.getStatus() == GenerationRunStatus.REJECTED_VALIDATION
                        || r.getStatus() == GenerationRunStatus.ERROR)
                .sorted(Comparator.comparing(GenerationRun::getCreatedAt).reversed())
                .limit(5).toList();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("teachers", teachers);
        res.put("students", students);
        res.put("lessons", lessons);
        res.put("runs", runs);
        res.put("runsByStatus", byStatus);
        res.put("averageLatencyMs", avgLatency);
        res.put("recentFailures", recentFailures.stream().map(this::runSummary).toList());
        return res;
    }

    @GetMapping("/teachers")
    public Map<String, Object> teachers(@RequestHeader(value = "Authorization", required = false) String authorization,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        admin(authorization);
        Page<User> p = userRepository.findAll(pageable(page, size, "createdAt,desc"));
        // filter teachers in memory (small scale); better query but okay
        List<User> teachers = p.getContent().stream().filter(u -> u.getRole() == User.Role.TEACHER).toList();
        List<Map<String, Object>> content = new ArrayList<>();
        for (User u : teachers) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("createdAt", u.getCreatedAt());
            m.put("lastLoginAt", u.getLastLoginAt());
            m.put("uploadCount", resourceRepository.findAll().stream()
                    .filter(r -> Objects.equals(r.getUploadedBy(), u.getId())).count());
            content.add(m);
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", teachers.size());
        res.put("totalPages", 1);
        return res;
    }

    @GetMapping("/teachers/{id}")
    public Map<String, Object> teacherDetail(@RequestHeader(value = "Authorization", required = false) String authorization,
                                            @PathVariable Long id) {
        admin(authorization);
        User u = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", u.getId());
        res.put("username", u.getUsername());
        res.put("role", u.getRole().name());
        res.put("createdAt", u.getCreatedAt());
        res.put("lastLoginAt", u.getLastLoginAt());
        res.put("uploads", resourceRepository.findAll().stream()
                .filter(r -> Objects.equals(r.getUploadedBy(), id))
                .map(this::resourceSummary).toList());
        return res;
    }

    @GetMapping("/students")
    public Map<String, Object> students(@RequestHeader(value = "Authorization", required = false) String authorization,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        admin(authorization);
        List<User> all = userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.STUDENT).toList();
        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        List<Map<String, Object>> content = new ArrayList<>();
        for (User u : all.subList(from, to)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("createdAt", u.getCreatedAt());
            m.put("lastLoginAt", u.getLastLoginAt());
            content.add(m);
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", all.size());
        res.put("totalPages", (int) Math.ceil((double) all.size() / size));
        return res;
    }

    @GetMapping("/students/{id}")
    public Map<String, Object> studentDetail(@RequestHeader(value = "Authorization", required = false) String authorization,
                                            @PathVariable Long id) {
        admin(authorization);
        User a = admin(authorization);
        User u = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        auditLogService.log(a.getId(), "VIEW_STUDENT", "USER", id, null);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", u.getId());
        res.put("username", u.getUsername());
        res.put("createdAt", u.getCreatedAt());
        res.put("lastLoginAt", u.getLastLoginAt());
        return res;
    }

    @GetMapping("/students/{id}/chat")
    public Map<String, Object> studentChat(@RequestHeader(value = "Authorization", required = false) String authorization,
                                          @PathVariable Long id) {
        admin(authorization);
        // Audit log the view
        auditLogService.log(admin(authorization).getId(), "VIEW_STUDENT_CHAT", "USER", id, null);
        return Map.of("studentId", id, "conversations", List.of());
    }

    @GetMapping("/lessons")
    public Map<String, Object> lessons(@RequestHeader(value = "Authorization", required = false) String authorization,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        admin(authorization);
        Page<Lesson> p = lessonRepository.findAll(pageable(page, size, "id,asc"));
        List<Map<String, Object>> content = new ArrayList<>();
        for (Lesson l : p.getContent()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("title", l.getTitle());
            m.put("level", l.getUnit().getLevel().getId());
            m.put("unit", l.getUnit().getTitle());
            m.put("contentVersion", l.getContentVersion());
            m.put("resourceCount", resourceRepository.findAllByLesson_Id(l.getId()).size());
            m.put("runCount", runRepository.findAll().stream().filter(r -> Objects.equals(r.getLessonId(), l.getId())).count());
            content.add(m);
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("page", p.getNumber());
        res.put("size", p.getSize());
        res.put("totalElements", p.getTotalElements());
        res.put("totalPages", p.getTotalPages());
        return res;
    }

    @GetMapping("/lessons/{id}/resources")
    public Map<String, Object> lessonResources(@RequestHeader(value = "Authorization", required = false) String authorization,
                                               @PathVariable Long id) {
        admin(authorization);
        auditLogService.log(admin(authorization).getId(), "VIEW_LESSON_RESOURCES", "LESSON", id, null);
        List<Map<String, Object>> resources = new ArrayList<>();
        for (LessonResource r : resourceRepository.findAllByLesson_Id(id)) {
            resources.add(resourceSummary(r));
        }
        return Map.of("lessonId", id, "resources", resources);
    }

    @GetMapping("/lessons/{id}/pipeline")
    public Map<String, Object> pipeline(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @PathVariable Long id) {
        admin(authorization);
        auditLogService.log(admin(authorization).getId(), "VIEW_PIPELINE", "LESSON", id, null);
        Lesson lesson = lessonRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<GenerationRun> runs = runRepository.findAll().stream()
                .filter(r -> Objects.equals(r.getLessonId(), id))
                .sorted(Comparator.comparing(GenerationRun::getCreatedAt)).toList();
        List<Map<String, Object>> steps = new ArrayList<>();
        // upload/extraction step
        for (LessonResource r : resourceRepository.findAllByLesson_Id(id)) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("step", "upload:" + r.getType().name());
            s.put("status", r.getExtractionStatus() == null ? "UNKNOWN" : r.getExtractionStatus().name());
            s.put("inputRef", "lesson_resource:" + r.getId());
            s.put("uploadedBy", r.getUploadedBy());
            s.put("updatedAt", r.getUpdatedAt());
            steps.add(s);
        }
        for (GenerationRun r : runs) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("step", "generation:" + r.getAgent());
            s.put("status", r.getStatus().name());
            s.put("runId", r.getId());
            s.put("attempts", r.getAttempts());
            s.put("validationProblems", r.getValidationProblems());
            s.put("fallbackUsed", r.isFallbackUsed());
            s.put("createdAt", r.getCreatedAt());
            steps.add(s);
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("lessonId", id);
        res.put("title", lesson.getTitle());
        res.put("contentVersion", lesson.getContentVersion());
        res.put("steps", steps);
        return res;
    }

    @GetMapping("/generation-runs")
    public Map<String, Object> runs(@RequestHeader(value = "Authorization", required = false) String authorization,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(required = false) String agent,
                                    @RequestParam(required = false) Long lessonId) {
        admin(authorization);
        List<GenerationRun> all = runRepository.findAll().stream()
                .filter(r -> status == null || r.getStatus().name().equalsIgnoreCase(status))
                .filter(r -> agent == null || r.getAgent().equalsIgnoreCase(agent))
                .filter(r -> lessonId == null || Objects.equals(r.getLessonId(), lessonId))
                .sorted(Comparator.comparing(GenerationRun::getCreatedAt).reversed())
                .toList();
        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", all.subList(from, to).stream().map(this::runDetail).toList());
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", all.size());
        res.put("totalPages", (int) Math.ceil((double) all.size() / Math.max(size, 1)));
        return res;
    }

    @GetMapping("/generation-runs/{id}")
    public Map<String, Object> runDetailEndpoint(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                @PathVariable Long id) {
        admin(authorization);
        GenerationRun r = runRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        auditLogService.log(admin(authorization).getId(), "VIEW_GENERATION_RUN", "GENERATION_RUN", id, null);
        return runDetail(r);
    }

    @GetMapping("/rejections/summary")
    public Map<String, Object> rejectionsSummary(@RequestHeader(value = "Authorization", required = false) String authorization) {
        admin(authorization);
        Map<String, Long> byStatus = new LinkedHashMap<>();
        Map<String, Long> byAgent = new LinkedHashMap<>();
        for (GenerationRun r : runRepository.findAll()) {
            if (r.getStatus() == GenerationRunStatus.REJECTED_VALIDATION
                    || r.getStatus() == GenerationRunStatus.FALLBACK_USED
                    || r.getStatus() == GenerationRunStatus.ERROR) {
                byStatus.merge(r.getStatus().name(), 1L, Long::sum);
                byAgent.merge(r.getAgent(), 1L, Long::sum);
            }
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("byStatus", byStatus);
        res.put("byAgent", byAgent);
        return res;
    }

    @GetMapping("/generated/{type}/{id}")
    public Map<String, Object> generated(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @PathVariable String type,
                                        @PathVariable Long id) {
        admin(authorization);
        auditLogService.log(admin(authorization).getId(), "VIEW_GENERATED", "GENERATED_" + type.toUpperCase(), id, null);
        if (type.equalsIgnoreCase("exercise")) {
            GeneratedExerciseSet s = exerciseSetRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("type", "exercise");
            m.put("hidden", s.isHidden());
            m.put("contentVersion", s.getContentVersion());
            m.put("questionsJson", s.getQuestionsJson());
            m.put("generationRunId", s.getGenerationRunId());
            return m;
        }
        if (type.equalsIgnoreCase("slide")) {
            GeneratedSlideDeck s = slideDeckRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("type", "slide");
            m.put("hidden", s.isHidden());
            m.put("contentVersion", s.getContentVersion());
            m.put("slidesJson", s.getSlidesJson());
            m.put("generationRunId", s.getGenerationRunId());
            return m;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown type");
    }

    @PostMapping("/generated/{type}/{id}/hide")
    public Map<String, Object> hide(@RequestHeader(value = "Authorization", required = false) String authorization,
                                    @PathVariable String type,
                                    @PathVariable Long id,
                                    @RequestParam(defaultValue = "true") boolean hidden) {
        User a = admin(authorization);
        if (type.equalsIgnoreCase("exercise")) {
            GeneratedExerciseSet s = exerciseSetRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            s.setHidden(hidden);
            exerciseSetRepository.save(s);
        } else if (type.equalsIgnoreCase("slide")) {
            GeneratedSlideDeck s = slideDeckRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            s.setHidden(hidden);
            slideDeckRepository.save(s);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown type");
        }
        auditLogService.log(a.getId(), hidden ? "HIDE_CONTENT" : "UNHIDE_CONTENT", "GENERATED_" + type.toUpperCase(), id, null);
        return Map.of("type", type, "id", id, "hidden", hidden);
    }

    @PostMapping("/lessons/{id}/regenerate")
    public Map<String, Object> regenerate(@RequestHeader(value = "Authorization", required = false) String authorization,
                                          @PathVariable Long id) {
        User a = admin(authorization);
        Lesson lesson = lessonRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        lesson.incrementContentVersion();
        lessonRepository.save(lesson);
        auditLogService.log(a.getId(), "REGENERATE_LESSON", "LESSON", id, "newVersion=" + lesson.getContentVersion());
        return Map.of("lessonId", id, "contentVersion", lesson.getContentVersion());
    }

    @GetMapping("/activity")
    public Map<String, Object> activity(@RequestHeader(value = "Authorization", required = false) String authorization) {
        admin(authorization);
        List<Map<String, Object>> items = new ArrayList<>();
        for (GenerationRun r : runRepository.findAll().stream()
                .sorted(Comparator.comparing(GenerationRun::getCreatedAt).reversed()).limit(50).toList()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", "generation_run");
            m.put("id", r.getId());
            m.put("status", r.getStatus().name());
            m.put("agent", r.getAgent());
            m.put("lessonId", r.getLessonId());
            m.put("createdAt", r.getCreatedAt());
            items.add(m);
        }
        items.sort((a, b) -> ((Instant) b.get("createdAt")).compareTo((Instant) a.get("createdAt")));
        return Map.of("items", items);
    }

    @GetMapping("/audit-log")
    public Map<String, Object> auditLog(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        admin(authorization);
        Page<AuditLog> p = auditLogService.list(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Map<String, Object>> content = new ArrayList<>();
        for (AuditLog a : p.getContent()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("adminUserId", a.getAdminUserId());
            m.put("action", a.getAction());
            m.put("targetType", a.getTargetType());
            m.put("targetId", a.getTargetId());
            m.put("details", a.getDetails());
            m.put("createdAt", a.getCreatedAt());
            content.add(m);
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", content);
        res.put("page", p.getNumber());
        res.put("size", p.getSize());
        res.put("totalElements", p.getTotalElements());
        res.put("totalPages", p.getTotalPages());
        return res;
    }

    @GetMapping("/system/health")
    public Map<String, Object> systemHealth(@RequestHeader(value = "Authorization", required = false) String authorization) {
        admin(authorization);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("backend", "UP");
        try {
            var h = agentsClient.health();
            res.put("agents", h.isPresent() ? h.get().status() : "DOWN");
        } catch (Exception e) {
            res.put("agents", "DOWN");
        }
        long recentErrors = runRepository.findAll().stream()
                .filter(r -> r.getCreatedAt().isAfter(Instant.now().minusSeconds(3600)))
                .filter(r -> r.getStatus() == GenerationRunStatus.FALLBACK_USED
                        || r.getStatus() == GenerationRunStatus.REJECTED_VALIDATION
                        || r.getStatus() == GenerationRunStatus.ERROR)
                .count();
        res.put("recentErrorCountLastHour", recentErrors);
        return res;
    }

    private Map<String, Object> runSummary(GenerationRun r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("agent", r.getAgent());
        m.put("status", r.getStatus().name());
        m.put("lessonId", r.getLessonId());
        m.put("createdAt", r.getCreatedAt());
        m.put("latencyMs", r.getLatencyMs());
        return m;
    }

    private Map<String, Object> runDetail(GenerationRun r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("agent", r.getAgent());
        m.put("endpoint", r.getEndpoint());
        m.put("lessonId", r.getLessonId());
        m.put("contentVersion", r.getContentVersion());
        m.put("gameType", r.getGameType());
        m.put("triggeredByUserId", r.getTriggeredByUserId());
        m.put("triggeredByRole", r.getTriggeredByRole());
        m.put("inputHash", r.getInputHash());
        m.put("inputRef", r.getInputRef());
        m.put("status", r.getStatus().name());
        m.put("attempts", r.getAttempts());
        m.put("validationProblems", r.getValidationProblems());
        m.put("outputJson", r.getOutputJson());
        m.put("errorCode", r.getErrorCode());
        m.put("errorMessage", r.getErrorMessage());
        m.put("model", r.getModel());
        m.put("latencyMs", r.getLatencyMs());
        m.put("tokenUsage", r.getTokenUsage());
        m.put("fallbackUsed", r.isFallbackUsed());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }

    private Map<String, Object> resourceSummary(LessonResource r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("type", r.getType().name());
        m.put("fileName", r.getFileName());
        m.put("contentType", r.getContentType());
        m.put("sizeBytes", r.getSizeBytes());
        m.put("extractedText", r.getExtractedText());
        m.put("extractionStatus", r.getExtractionStatus() == null ? null : r.getExtractionStatus().name());
        m.put("uploadedBy", r.getUploadedBy());
        m.put("createdAt", r.getCreatedAt());
        m.put("updatedAt", r.getUpdatedAt());
        return m;
    }
}