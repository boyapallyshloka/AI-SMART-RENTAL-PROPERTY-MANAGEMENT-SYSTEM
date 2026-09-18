package com.rental.rental_management_backend.property.repository;



import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAmenity;

public interface PropertyAmenityRepository
        extends JpaRepository<PropertyAmenity, Long> {

    List<PropertyAmenity> findByProperty(
            Property property);

    Optional<PropertyAmenity> findByPropertyAndAmenity_AmenityId(
            Property property,
            Long amenityId);

    boolean existsByPropertyAndAmenity_AmenityId(
            Property property,
            Long amenityId);
}