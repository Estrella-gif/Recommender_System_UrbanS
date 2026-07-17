package com.urbansoul.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record FastApiRecommendationResponse(
        @JsonProperty("user_id") int userId,
        List<RecommendationItem> recommendations
) {}
