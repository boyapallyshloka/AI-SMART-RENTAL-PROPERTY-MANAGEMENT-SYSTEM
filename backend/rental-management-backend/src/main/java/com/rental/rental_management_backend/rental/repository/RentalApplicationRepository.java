package com.rental.rental_management_backend.rental.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.rental.entity.RentalApplication;
import com.rental.rental_management_backend.rental.enums.RentalApplicationStatus;

public interface RentalApplicationRepository
        extends JpaRepository<RentalApplication, Long> {

    List<RentalApplication> findByTenant_TenantId(Long tenantId);

    List<RentalApplication> findByUnit_UnitId(Long unitId);

    List<RentalApplication> findByStatus(
            RentalApplicationStatus status
    );

    List<RentalApplication> findByUnit_UnitIdAndStatus(
            Long unitId,
            RentalApplicationStatus status
    );

    boolean existsByTenant_TenantIdAndUnit_UnitIdAndStatus(
            Long tenantId,
            Long unitId,
            RentalApplicationStatus status
    );
}