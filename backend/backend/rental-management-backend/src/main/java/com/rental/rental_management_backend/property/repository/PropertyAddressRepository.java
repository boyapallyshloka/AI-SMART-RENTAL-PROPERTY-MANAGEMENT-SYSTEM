package com.rental.rental_management_backend.property.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAddress;

public interface PropertyAddressRepository
        extends JpaRepository<PropertyAddress, Long> {

    Optional<PropertyAddress> findByProperty(Property property);

    boolean existsByProperty(Property property);
}