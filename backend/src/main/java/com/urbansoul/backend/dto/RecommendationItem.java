package com.urbansoul.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record RecommendationItem(
        @JsonProperty("product_id") int productId,
        double score,
        @JsonProperty("category_code") String categoryCode,
        String brand,
        BigDecimal price
) {}
