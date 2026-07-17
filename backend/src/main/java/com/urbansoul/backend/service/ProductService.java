package com.urbansoul.backend.service;

import com.urbansoul.backend.dto.ProductResponse;
import com.urbansoul.backend.exception.ResourceNotFoundException;
import com.urbansoul.backend.repository.BrandRepository;
import com.urbansoul.backend.repository.CategoryRepository;
import com.urbansoul.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public Page<ProductResponse> search(String q, String categorySlug, String brandSlug, Pageable pageable) {
        Long categoryId = null;
        Long brandId = null;
        if (categorySlug != null && !categorySlug.isBlank()) {
            categoryId = categoryRepository.findBySlug(categorySlug)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categorySlug))
                    .getId();
        }
        if (brandSlug != null && !brandSlug.isBlank()) {
            brandId = brandRepository.findBySlug(brandSlug)
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + brandSlug))
                    .getId();
        }
        return productRepository.search(q, categoryId, brandId, pageable)
                .map(ProductResponse::from);
    }

    public ProductResponse findById(Long id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}
