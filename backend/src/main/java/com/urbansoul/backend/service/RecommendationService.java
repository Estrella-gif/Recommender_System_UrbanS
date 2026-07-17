package com.urbansoul.backend.service;

import com.urbansoul.backend.dto.FastApiRecommendationResponse;
import com.urbansoul.backend.dto.RecommendationItem;
import com.urbansoul.backend.dto.RecommendationResponse;
import com.urbansoul.backend.entity.Product;
import com.urbansoul.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private final RestClient restClient;
    private final ProductRepository productRepository;

    public RecommendationService(@Value("${ia.service.url}") String iaServiceUrl,
                                  ProductRepository productRepository) {
        this.restClient = RestClient.create(iaServiceUrl);
        this.productRepository = productRepository;
    }

    public List<RecommendationResponse> getForUser(Long userId, int topN) {
        try {
            FastApiRecommendationResponse response = restClient.get()
                    .uri("/recommendations/{userId}?top_n={topN}", userId, topN)
                    .retrieve()
                    .body(FastApiRecommendationResponse.class);
            if (response == null || response.recommendations().isEmpty()) {
                return getPopular(topN);
            }
            return enrichWithProducts(response.recommendations(), topN);
        } catch (Exception e) {
            return getPopular(topN);
        }
    }

    public List<RecommendationResponse> getPopular(int topN) {
        return productRepository.findPopular(Pageable.ofSize(topN)).getContent().stream()
                .map(p -> new RecommendationResponse(
                        p.getId(), p.getName(), p.getCategoryCode(), p.getBrand().getName(),
                        p.getPrice(), p.getImageUrl(), 0.0))
                .toList();
    }

    private List<RecommendationResponse> enrichWithProducts(List<RecommendationItem> items, int topN) {
        return items.stream()
                .map(item -> {
                    Product product = productRepository.findById((long) item.productId())
                            .orElse(null);
                    if (product == null) return null;
                    return new RecommendationResponse(
                            product.getId(), product.getName(),
                            product.getCategoryCode(), product.getBrand().getName(),
                            product.getPrice(), product.getImageUrl(), item.score());
                })
                .filter(r -> r != null)
                .limit(topN)
                .toList();
    }
}
