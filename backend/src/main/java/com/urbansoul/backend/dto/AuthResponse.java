package com.urbansoul.backend.dto;

public record AuthResponse(String token, Long userId, String email) {}
