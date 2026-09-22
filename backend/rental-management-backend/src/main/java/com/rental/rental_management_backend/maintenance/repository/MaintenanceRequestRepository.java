package com.rental.rental_management_backend.maintenance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.maintenance.entity.MaintenanceRequest;
import com.rental.rental_management_backend.maintenance.enums.MaintenancePriority;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceStatus;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);

    List<MaintenanceRequest> findByPriority(MaintenancePriority priority);

    List<MaintenanceRequest> findByTenant_TenantId(Long tenantId);

    // Spring Data property-path methods
    List<MaintenanceRequest> findByProperty_PropertyId(Long propertyId);

    List<MaintenanceRequest> findByUnit_UnitId(Long unitId);

    // Explicit JPQL queries to ensure reliable lookups regardless of entity field naming
    @Query("SELECT m FROM MaintenanceRequest m WHERE m.property.propertyId = :propertyId")
    List<MaintenanceRequest> findByPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT m FROM MaintenanceRequest m WHERE m.unit.unitId = :unitId")
    List<MaintenanceRequest> findByUnitId(@Param("unitId") Long unitId);
}