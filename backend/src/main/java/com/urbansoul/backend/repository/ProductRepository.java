package com.urbansoul.backend.repository;

import com.urbansoul.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE (:q IS NULL OR LOWER(CAST(p.name AS string)) LIKE CONCAT('%', LOWER(CAST(:q AS string)), '%'))
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND (:brandId IS NULL OR p.brand.id = :brandId)
          AND p.isActive = true
        """)
    Page<Product> search(@Param("q") String q,
                         @Param("categoryId") Long categoryId,
                         @Param("brandId") Long brandId,
                         Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.id IN (
            SELECT i.product.id FROM Interaction i
            WHERE i.eventType = 'purchase'
            GROUP BY i.product.id
            ORDER BY COUNT(i) DESC
        )
        AND p.isActive = true
        """)
    Page<Product> findPopular(Pageable pageable);
}
