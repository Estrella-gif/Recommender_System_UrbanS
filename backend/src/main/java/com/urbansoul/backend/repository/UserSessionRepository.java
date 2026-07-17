package com.urbansoul.backend.repository;

import com.urbansoul.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {}
