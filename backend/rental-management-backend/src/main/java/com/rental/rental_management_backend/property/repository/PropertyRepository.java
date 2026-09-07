package com.rental.rental_management_backend.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.enums.PropertyStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwner(User owner);

    Optional<Property> findByPropertyIdAndOwner(
            Long propertyId,
            User owner
    );

    List<Property> findByStatus(PropertyStatus status);

    List<Property> findByPropertyType(PropertyType propertyType);

    List<Property> findByOwnerAndStatus(
            User owner,
            PropertyStatus status
    );
}