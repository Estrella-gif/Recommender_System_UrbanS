package com.urbansoul.backend.repository;

import com.urbansoul.backend.entity.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {}
