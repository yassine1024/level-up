package com.levelup.backend.catalog.controller;

import com.levelup.backend.catalog.dto.LessonLevelResponse;
import com.levelup.backend.catalog.dto.LessonResponse;
import com.levelup.backend.catalog.dto.LessonUnitResponse;
import com.levelup.backend.catalog.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/lessons/levels")
    public List<LessonLevelResponse> getLevels() {
        return catalogService.getLevels();
    }

    @GetMapping("/lessons/levels/{levelId}/units")
    public List<LessonUnitResponse> getUnits(
            @PathVariable String levelId
    ) {
        return catalogService.getUnits(levelId);
    }

    @GetMapping("/units/{unitId}/lessons")
    public List<LessonResponse> getLessons(
            @PathVariable Long unitId
    ) {
        return catalogService.getLessons(unitId);
    }
}