package com.levelup.backend.admin.controller;

import com.levelup.backend.auth.service.AdminAccessService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.levelup.backend.auth.config.SecurityConfig;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminHealthController.class)
@Import(SecurityConfig.class)
class AdminHealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminAccessService adminAccessService;

    @Test
    void anonymousReturns401() throws Exception {
        doThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED))
                .when(adminAccessService).requireAdmin(null);
        mockMvc.perform(get("/api/admin/health"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void teacherReturns403() throws Exception {
        doThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(adminAccessService).requireAdmin("Bearer teacher-token");
        mockMvc.perform(get("/api/admin/health").header("Authorization", "Bearer teacher-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminReturns200() throws Exception {
        when(adminAccessService.requireAdmin("Bearer admin-token"))
                .thenReturn(new com.levelup.backend.auth.entity.User());
        mockMvc.perform(get("/api/admin/health").header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());
    }
}