package com.rental.rental_management_backend.property.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;



public interface FloorRepository extends JpaRepository<Floor, Long> {

    List<Floor> findByBuilding(Building building);

    Optional<Floor> findByFloorIdAndBuilding(
            Long floorId,
            Building building);

    boolean existsByBuildingAndFloorNumber(
            Building building,
            Integer floorNumber);
}