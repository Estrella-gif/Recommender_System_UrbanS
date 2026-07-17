package com.urbansoul.backend.dto;

import java.math.BigDecimal;

public record RecommendationResponse(
        Long productId,
        String name,
        String categoryCode,
        String brand,
        BigDecimal price,
        String imageUrl,
        double score
) {}
