package com.urbansoul.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.urbansoul.backend.enums.EventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "interactions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private UserSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventType eventType;

    @Column(nullable = false)
    private Instant eventTime = Instant.now();

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
