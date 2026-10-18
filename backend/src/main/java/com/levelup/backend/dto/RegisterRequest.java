package com.levelup.backend.dto;

import com.levelup.backend.entity.User.Role;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String username,
        @NotBlank @Size(min = 6, message = "password must be at least 6 characters") String password,
        @NotNull Role role
) {}