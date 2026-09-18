package com.rental.rental_management_backend.property.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Amenity;



public interface AmenityRepository
        extends JpaRepository<Amenity, Long> {

    Optional<Amenity> findByAmenityNameIgnoreCase(
            String amenityName);

    boolean existsByAmenityNameIgnoreCase(
            String amenityName);
}