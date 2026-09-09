package com.rental.rental_management_backend.tenant.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.tenant.entity.Tenant;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByUser(User user);

    Optional<Tenant> findByUser_Id(Long userId);

    boolean existsByUser(User user);

    boolean existsByUser_Id(Long userId);
}