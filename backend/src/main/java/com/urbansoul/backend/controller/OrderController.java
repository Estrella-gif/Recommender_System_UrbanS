package com.urbansoul.backend.controller;

import com.urbansoul.backend.dto.OrderRequest;
import com.urbansoul.backend.entity.Order;
import com.urbansoul.backend.entity.User;
import com.urbansoul.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(@AuthenticationPrincipal User user,
                             @Valid @RequestBody OrderRequest request) {
        return orderService.createOrder(user, request);
    }

    @GetMapping
    public Page<Order> listOrders(@AuthenticationPrincipal User user,
                                  @PageableDefault(size = 10) Pageable pageable) {
        return orderService.findByUser(user.getId(), pageable);
    }

    @GetMapping("/{id}")
    public Order getOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return orderService.findByIdAndUser(id, user.getId());
    }
}
