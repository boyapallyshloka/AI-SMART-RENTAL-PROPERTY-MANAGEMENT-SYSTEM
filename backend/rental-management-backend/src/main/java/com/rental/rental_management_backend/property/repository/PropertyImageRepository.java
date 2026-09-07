package com.rental.rental_management_backend.property.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyImage;


public interface PropertyImageRepository
        extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByProperty(Property property);

    boolean existsByPropertyAndIsPrimaryTrue(Property property);
}