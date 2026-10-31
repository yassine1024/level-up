package com.levelup.backend.admin.controller;

import com.levelup.backend.auth.service.AdminAccessService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminHealthController {

    private final AdminAccessService adminAccessService;

    public AdminHealthController(AdminAccessService adminAccessService) {
        this.adminAccessService = adminAccessService;
    }

    @GetMapping("/health")
    public Map<String, Object> health(@RequestHeader(value = "Authorization", required = false) String authorization) {
        adminAccessService.requireAdmin(authorization);
        return Map.of("status", "UP", "service", "admin");
    }
}