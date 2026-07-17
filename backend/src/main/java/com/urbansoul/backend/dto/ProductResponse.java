package com.urbansoul.backend.dto;

import com.urbansoul.backend.entity.Product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        String sku,
        String categoryCode,
        Long categoryId,
        String categoryName,
        String brand,
        Long brandId,
        BigDecimal price,
        BigDecimal compareAtPrice,
        int stockQuantity,
        String imageUrl
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getDescription(), p.getSku(),
                p.getCategoryCode(),
                p.getCategory().getId(), p.getCategory().getName(),
                p.getBrand().getName(), p.getBrand().getId(),
                p.getPrice(), p.getCompareAtPrice(), p.getStockQuantity(),
                p.getImageUrl()
        );
    }
}
