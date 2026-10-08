package com.rental.rental_management_backend.rental.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rental.rental_management_backend.rental.entity.RentalApplication;
import com.rental.rental_management_backend.rental.enums.RentalApplicationStatus;

public interface RentalApplicationRepository
        extends JpaRepository<RentalApplication, Long> {

    List<RentalApplication> findByTenant_TenantId(Long tenantId);

    List<RentalApplication> findByUnit_UnitId(Long unitId);

    List<RentalApplication> findByStatus(
            RentalApplicationStatus status);

    List<RentalApplication> findByUnit_UnitIdAndStatus(
            Long unitId,
            RentalApplicationStatus status);

    boolean existsByTenant_TenantIdAndUnit_UnitIdAndStatus(
            Long tenantId,
            Long unitId,
            RentalApplicationStatus status);

    /*
     * Get all rental applications belonging to a property.
     *
     * Property hierarchy:
     *
     * Property
     *   -> Building
     *      -> Floor
     *         -> Unit
     *            -> RentalApplication
     */
    List<RentalApplication>
    findByUnit_Floor_Building_Property_PropertyId(
            Long propertyId);
 // M3 Rental Demand Prediction

    @Query("""
        SELECT COUNT(ra)
        FROM RentalApplication ra
        JOIN ra.unit u
        JOIN u.floor f
        JOIN f.building b
        JOIN PropertyAddress pa
            ON pa.property = b.property
        WHERE LOWER(pa.city) = LOWER(:city)
          AND LOWER(pa.area) = LOWER(:area)
          AND ra.applicationDate >= :startDate
          AND ra.applicationDate < :endDate
        """)
    long countApplicationsForRentalDemand(
            @Param("city") String city,
            @Param("area") String area,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
}