package com.rental.rental_management_backend.property.repository;



import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAmenity;

public interface PropertyAmenityRepository
        extends JpaRepository<PropertyAmenity, Long> {

    @EntityGraph(attributePaths = "amenity")
    List<PropertyAmenity> findByProperty(
            Property property);

    Optional<PropertyAmenity> findByPropertyAndAmenity_AmenityId(
            Property property,
            Long amenityId);

    boolean existsByPropertyAndAmenity_AmenityId(
            Property property,
            Long amenityId);

    @Modifying
    @Query("""
        DELETE FROM PropertyAmenity propertyAmenity
        WHERE propertyAmenity.amenity.amenityId = :amenityId
        """)
    int deleteByAmenityId(@Param("amenityId") Long amenityId);
}