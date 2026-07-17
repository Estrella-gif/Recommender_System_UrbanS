package com.urbansoul.backend.service;

import com.urbansoul.backend.dto.OrderRequest;
import com.urbansoul.backend.entity.Order;
import com.urbansoul.backend.entity.OrderItem;
import com.urbansoul.backend.entity.Product;
import com.urbansoul.backend.entity.User;
import com.urbansoul.backend.exception.BadRequestException;
import com.urbansoul.backend.exception.ResourceNotFoundException;
import com.urbansoul.backend.repository.OrderRepository;
import com.urbansoul.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order createOrder(User user, OrderRequest request) {
        var order = new Order();
        order.setUser(user);
        order.setOrderNumber(UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());

        List<OrderItem> items = request.items().stream().map(item -> {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.productId()));
            if (product.getStockQuantity() < item.quantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - item.quantity());

            var orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(item.quantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
            return orderItem;
        }).toList();

        order.setItems(items);

        BigDecimal subtotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setSubtotal(subtotal);
        order.setTotal(subtotal.setScale(2, RoundingMode.HALF_UP));

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Page<Order> findByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Order findByIdAndUser(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found");
        }
        return order;
    }
}
