package com.rental.rental_management_backend.property.serviceimpl;



import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.dto.UnitRequest;
import com.rental.rental_management_backend.property.dto.UnitResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.repository.FloorRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;
import com.rental.rental_management_backend.property.service.UnitService;

@Service
@Transactional
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final FloorRepository floorRepository;
    private final UserRepository userRepository;

    public UnitServiceImpl(
            UnitRepository unitRepository,
            FloorRepository floorRepository,
            UserRepository userRepository) {

        this.unitRepository = unitRepository;
        this.floorRepository = floorRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UnitResponse createUnit(UnitRequest request) {

        User owner = getAuthenticatedOwner();

        Floor floor = getFloorOwnedByOwner(
                request.getFloorId(),
                owner);

        if (unitRepository.existsByFloorAndUnitNumber(
                floor,
                request.getUnitNumber())) {

            throw new RuntimeException(
                    "Unit number "
                    + request.getUnitNumber()
                    + " already exists on this floor");
        }

        Unit unit = new Unit();

        unit.setUnitNumber(request.getUnitNumber());
        unit.setUnitType(request.getUnitType());
        unit.setArea(request.getArea());
        unit.setBedrooms(request.getBedrooms());
        unit.setBathrooms(request.getBathrooms());
        unit.setMonthlyRent(request.getMonthlyRent());
        unit.setSecurityDeposit(request.getSecurityDeposit());

        if (request.getStatus() != null) {
            unit.setStatus(request.getStatus());
        } else {
            unit.setStatus(UnitStatus.VACANT);
        }

        unit.setDescription(request.getDescription());
        unit.setFloor(floor);

        Unit savedUnit = unitRepository.save(unit);

        return mapToResponse(savedUnit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getUnitsByFloor(Long floorId) {

        User owner = getAuthenticatedOwner();

        Floor floor = getFloorOwnedByOwner(
                floorId,
                owner);

        return unitRepository.findByFloor(floor)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getUnitById(Long unitId) {

        User owner = getAuthenticatedOwner();

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                + unitId));

        validateUnitOwnership(unit, owner);

        return mapToResponse(unit);
    }

    @Override
    public UnitResponse updateUnit(
            Long unitId,
            UnitRequest request) {

        User owner = getAuthenticatedOwner();

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                + unitId));

        validateUnitOwnership(unit, owner);

        Floor newFloor = getFloorOwnedByOwner(
                request.getFloorId(),
                owner);

        boolean floorChanged =
                !unit.getFloor()
                        .getFloorId()
                        .equals(newFloor.getFloorId());

        boolean unitNumberChanged =
                !unit.getUnitNumber()
                        .equals(request.getUnitNumber());

        if (floorChanged || unitNumberChanged) {

            if (unitRepository
                    .existsByFloorAndUnitNumber(
                            newFloor,
                            request.getUnitNumber())) {

                throw new RuntimeException(
                        "Unit number "
                        + request.getUnitNumber()
                        + " already exists on this floor");
            }
        }

        unit.setUnitNumber(request.getUnitNumber());
        unit.setUnitType(request.getUnitType());
        unit.setArea(request.getArea());
        unit.setBedrooms(request.getBedrooms());
        unit.setBathrooms(request.getBathrooms());
        unit.setMonthlyRent(request.getMonthlyRent());
        unit.setSecurityDeposit(request.getSecurityDeposit());

        if (request.getStatus() != null) {
            unit.setStatus(request.getStatus());
        }

        unit.setDescription(request.getDescription());
        unit.setFloor(newFloor);

        Unit updatedUnit = unitRepository.save(unit);

        return mapToResponse(updatedUnit);
    }

    @Override
    public void deleteUnit(Long unitId) {

        User owner = getAuthenticatedOwner();

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                + unitId));

        validateUnitOwnership(unit, owner);

        unitRepository.delete(unit);
    }

    // ============================================================
    // AUTHENTICATED PROPERTY OWNER
    // ============================================================

    private User getAuthenticatedOwner() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        if (user.getRole() != RoleType.PROPERTY_OWNER) {

            throw new RuntimeException(
                    "Only property owners can manage units");
        }

        return user;
    }

    // ============================================================
    // GET FLOOR AND VERIFY OWNER
    // ============================================================

    private Floor getFloorOwnedByOwner(
            Long floorId,
            User owner) {

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Floor not found with ID: "
                                + floorId));

        validateFloorOwnership(floor, owner);

        return floor;
    }

    // ============================================================
    // FLOOR → BUILDING → PROPERTY → OWNER
    // ============================================================

    private void validateFloorOwnership(
            Floor floor,
            User owner) {

        if (floor.getBuilding() == null) {

            throw new RuntimeException(
                    "Floor is not associated with a building");
        }

        Building building = floor.getBuilding();

        if (building.getProperty() == null) {

            throw new RuntimeException(
                    "Building is not associated with a property");
        }

        Property property = building.getProperty();

        if (property.getOwner() == null) {

            throw new RuntimeException(
                    "Property does not have an owner");
        }

        if (!property.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new ResourceNotFoundException(
                    "Floor not found with ID: " + floor.getFloorId());
        }
    }

    // ============================================================
    // UNIT OWNERSHIP
    // ============================================================

    private void validateUnitOwnership(
            Unit unit,
            User owner) {

        if (unit.getFloor() == null) {

            throw new RuntimeException(
                    "Unit is not associated with a floor");
        }

        validateFloorOwnership(
                unit.getFloor(),
                owner);
    }

    // ============================================================
    // ENTITY → RESPONSE
    // ============================================================

    private UnitResponse mapToResponse(Unit unit) {

        Floor floor = unit.getFloor();
        Building building = floor != null ? floor.getBuilding() : null;
        Property property = building != null ? building.getProperty() : null;

        UnitResponse response = new UnitResponse();

        response.setUnitId(unit.getUnitId());
        response.setUnitNumber(unit.getUnitNumber());
        response.setUnitType(unit.getUnitType());

        response.setArea(unit.getArea());
        response.setBedrooms(unit.getBedrooms());
        response.setBathrooms(unit.getBathrooms());

        response.setMonthlyRent(unit.getMonthlyRent());
        response.setSecurityDeposit(unit.getSecurityDeposit());

        response.setStatus(unit.getStatus());
        response.setDescription(unit.getDescription());

        response.setFloorId(floor != null ? floor.getFloorId() : null);
        response.setFloorName(floor != null ? floor.getFloorName() : null);
        response.setFloorNumber(floor != null ? floor.getFloorNumber() : null);

        response.setBuildingId(building != null ? building.getBuildingId() : null);
        response.setBuildingName(building != null ? building.getBuildingName() : null);

        response.setPropertyId(property != null ? property.getPropertyId() : null);
        response.setPropertyName(property != null ? property.getPropertyName() : null);

        response.setCreatedAt(unit.getCreatedAt());
        response.setUpdatedAt(unit.getUpdatedAt());

        return response;
    }
    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getPublicUnitsByFloor(Long floorId) {

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Floor not found with ID: "
                                + floorId));

        return unitRepository.findByFloor(floor)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}