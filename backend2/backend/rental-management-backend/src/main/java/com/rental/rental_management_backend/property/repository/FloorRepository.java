package com.rental.rental_management_backend.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;



public interface FloorRepository extends JpaRepository<Floor, Long> {

    @EntityGraph(attributePaths = {"building", "building.property"})
    List<Floor> findByBuilding(Building building);

    @EntityGraph(attributePaths = {
            "building",
            "building.property",
            "building.property.owner",
            "building.property.propertyManager.user"
    })
    Optional<Floor> findFloorWithAccessDetailsByFloorId(Long floorId);

    @EntityGraph(attributePaths = {"building", "building.property"})
    List<Floor> findByBuildingIn(List<Building> buildings);

    Optional<Floor> findByFloorIdAndBuilding(
            Long floorId,
            Building building);

    boolean existsByBuildingAndFloorNumber(
            Building building,
            Integer floorNumber);
}