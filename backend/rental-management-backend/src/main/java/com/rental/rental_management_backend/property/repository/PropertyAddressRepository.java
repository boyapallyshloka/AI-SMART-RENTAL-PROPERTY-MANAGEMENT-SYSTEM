package com.rental.rental_management_backend.property.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAddress;
import com.rental.rental_management_backend.property.enums.PropertyStatus;

public interface PropertyAddressRepository
        extends JpaRepository<PropertyAddress, Long> {

    Optional<PropertyAddress> findByProperty(Property property);

    @Query("""
        SELECT address
        FROM PropertyAddress address
        WHERE address.property.propertyId = :propertyId
          AND address.property.owner = :owner
        """)
    Optional<PropertyAddress> findByPropertyIdAndOwner(
            @Param("propertyId") Long propertyId,
            @Param("owner") User owner);

    @Query("""
        SELECT address
        FROM PropertyAddress address
        WHERE address.property.propertyId = :propertyId
          AND address.property.status = :status
        """)
    Optional<PropertyAddress> findByPropertyIdAndStatus(
            @Param("propertyId") Long propertyId,
            @Param("status") PropertyStatus status);

    boolean existsByProperty(Property property);
 // M3 Rental Demand Prediction
    long countByCityIgnoreCaseAndAreaIgnoreCase(
            String city,
            String area);
}