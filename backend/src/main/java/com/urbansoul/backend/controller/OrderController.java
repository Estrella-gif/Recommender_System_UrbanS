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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(@Valid @RequestBody OrderRequest request) {
        return orderService.createOrder(currentUser(), request);
    }

    @GetMapping
    public Page<Order> listOrders(@PageableDefault(size = 10) Pageable pageable) {
        return orderService.findByUser(currentUser().getId(), pageable);
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.findByIdAndUser(id, currentUser().getId());
    }
}
