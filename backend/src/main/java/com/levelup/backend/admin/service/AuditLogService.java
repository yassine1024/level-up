package com.levelup.backend.admin.service;

import com.levelup.backend.admin.entity.AuditLog;
import com.levelup.backend.admin.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(Long adminUserId, String action, String targetType, Long targetId, String details) {
        repository.save(new AuditLog(adminUserId, action, targetType, targetId, details));
    }

    public Page<AuditLog> list(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable);
    }
}