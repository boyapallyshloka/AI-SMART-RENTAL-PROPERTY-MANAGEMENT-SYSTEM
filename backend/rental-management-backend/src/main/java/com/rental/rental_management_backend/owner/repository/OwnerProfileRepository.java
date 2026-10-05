package com.rental.rental_management_backend.owner.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.owner.entity.OwnerProfile;

public interface OwnerProfileRepository
        extends JpaRepository<OwnerProfile, Long> {

    Optional<OwnerProfile> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);
}