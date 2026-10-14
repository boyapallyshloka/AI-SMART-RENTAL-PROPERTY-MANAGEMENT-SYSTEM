package com.rental.rental_management_backend.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Property;

public interface BuildingRepository
        extends JpaRepository<Building, Long> {

    @EntityGraph(attributePaths = "property")
    List<Building> findByProperty(Property property);

    @EntityGraph(attributePaths = {
            "property",
            "property.owner",
            "property.propertyManager.user"
    })
    Optional<Building> findById(Long buildingId);

    Optional<Building> findByBuildingIdAndProperty(
            Long buildingId,
            Property property
    );

    boolean existsByPropertyAndBuildingName(
            Property property,
            String buildingName
    );
}