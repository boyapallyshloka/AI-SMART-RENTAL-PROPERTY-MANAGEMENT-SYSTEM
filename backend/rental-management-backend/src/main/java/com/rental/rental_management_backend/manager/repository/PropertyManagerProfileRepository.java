package com.rental.rental_management_backend.manager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.manager.entity.PropertyManagerProfile;

public interface PropertyManagerProfileRepository
        extends JpaRepository<PropertyManagerProfile, Long> {

    Optional<PropertyManagerProfile> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);
}