package com.rental.rental_management_backend.property.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.enums.UnitStatus;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findByFloor(Floor floor);

    boolean existsByFloorAndUnitNumber(
            Floor floor,
            String unitNumber);

    boolean existsByFloorAndUnitNumberAndUnitIdNot(
            Floor floor,
            String unitNumber,
            Long unitId);

    List<Unit> findByFloorAndStatus(
            Floor floor,
            UnitStatus status);

    List<Unit> findByStatus(UnitStatus status);
}