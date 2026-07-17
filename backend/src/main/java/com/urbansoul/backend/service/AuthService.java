package com.urbansoul.backend.service;

import com.urbansoul.backend.dto.AuthResponse;
import com.urbansoul.backend.dto.LoginRequest;
import com.urbansoul.backend.dto.RegisterRequest;
import com.urbansoul.backend.entity.User;
import com.urbansoul.backend.exception.BadRequestException;
import com.urbansoul.backend.repository.UserRepository;
import com.urbansoul.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }
        var user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        userRepository.save(user);
        return new AuthResponse(jwtTokenProvider.generateToken(user), user.getId(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        return new AuthResponse(jwtTokenProvider.generateToken(user), user.getId(), user.getEmail());
    }
}
