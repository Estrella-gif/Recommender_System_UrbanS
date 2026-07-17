package com.urbansoul.backend.controller;

import com.urbansoul.backend.dto.RecommendationResponse;
import com.urbansoul.backend.entity.User;
import com.urbansoul.backend.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public List<RecommendationResponse> getForUser(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "10") int topN) {
        return recommendationService.getForUser(user.getId(), topN);
    }

    @GetMapping("/popular")
    public List<RecommendationResponse> popular(@RequestParam(defaultValue = "10") int topN) {
        return recommendationService.getPopular(topN);
    }
}
