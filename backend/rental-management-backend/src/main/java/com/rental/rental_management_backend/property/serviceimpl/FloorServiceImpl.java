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
import com.rental.rental_management_backend.property.dto.FloorRequest;
import com.rental.rental_management_backend.property.dto.FloorResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;

import com.rental.rental_management_backend.property.repository.BuildingRepository;
import com.rental.rental_management_backend.property.repository.FloorRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.FloorService;


@Service
@Transactional
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public FloorServiceImpl(
            FloorRepository floorRepository,
            BuildingRepository buildingRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.floorRepository = floorRepository;
        this.buildingRepository = buildingRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @Override
    public FloorResponse createFloor(FloorRequest request) {

        User owner = getAuthenticatedOwner();

        Building building = getBuildingOwnedByOwner(
                request.getBuildingId(),
                owner);

        if (floorRepository.existsByBuildingAndFloorNumber(
                building,
                request.getFloorNumber())) {

            throw new RuntimeException(
                    "Floor number "
                    + request.getFloorNumber()
                    + " already exists in this building");
        }

        Floor floor = new Floor();

        floor.setFloorName(request.getFloorName());
        floor.setFloorNumber(request.getFloorNumber());
        floor.setBuilding(building);

        Floor savedFloor = floorRepository.save(floor);

        return mapToResponse(savedFloor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FloorResponse> getFloorsByBuilding(Long buildingId) {

        User owner = getAuthenticatedOwner();

        Building building = getBuildingOwnedByOwner(
                buildingId,
                owner);

        return floorRepository.findByBuilding(building)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FloorResponse getFloorById(Long floorId) {

        User owner = getAuthenticatedOwner();

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Floor not found with ID: " + floorId));

        validateFloorOwnership(floor, owner);

        return mapToResponse(floor);
    }

    @Override
    public FloorResponse updateFloor(
            Long floorId,
            FloorRequest request) {

        User owner = getAuthenticatedOwner();

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Floor not found with ID: " + floorId));

        validateFloorOwnership(floor, owner);

        Building newBuilding = getBuildingOwnedByOwner(
                request.getBuildingId(),
                owner);

        boolean buildingChanged =
                !floor.getBuilding()
                        .getBuildingId()
                        .equals(newBuilding.getBuildingId());

        boolean floorNumberChanged =
                !floor.getFloorNumber()
                        .equals(request.getFloorNumber());

        if (buildingChanged || floorNumberChanged) {

            if (floorRepository.existsByBuildingAndFloorNumber(
                    newBuilding,
                    request.getFloorNumber())) {

                throw new RuntimeException(
                        "Floor number "
                        + request.getFloorNumber()
                        + " already exists in this building");
            }
        }

        floor.setFloorName(request.getFloorName());
        floor.setFloorNumber(request.getFloorNumber());
        floor.setBuilding(newBuilding);

        Floor updatedFloor = floorRepository.save(floor);

        return mapToResponse(updatedFloor);
    }

    @Override
    public void deleteFloor(Long floorId) {

        User owner = getAuthenticatedOwner();

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Floor not found with ID: " + floorId));

        validateFloorOwnership(floor, owner);

        floorRepository.delete(floor);
    }

    // ============================================================
    // AUTHENTICATED OWNER
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
                    "Only property owners can manage floors");
        }

        return user;
    }

    // ============================================================
    // BUILDING OWNERSHIP
    // ============================================================

    private Building getBuildingOwnedByOwner(
            Long buildingId,
            User owner) {

        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Building not found with ID: "
                                + buildingId));

        Property property = building.getProperty();

        if (property == null) {

            throw new RuntimeException(
                    "Building is not associated with a property");
        }

        if (!property.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this building");
        }

        return building;
    }

    // ============================================================
    // FLOOR OWNERSHIP
    // ============================================================

    private void validateFloorOwnership(
            Floor floor,
            User owner) {

        if (floor.getBuilding() == null) {

            throw new RuntimeException(
                    "Floor is not associated with a building");
        }

        Property property =
                floor.getBuilding().getProperty();

        if (property == null) {

            throw new RuntimeException(
                    "Building is not associated with a property");
        }

        if (!property.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this floor");
        }
    }

    // ============================================================
    // ENTITY → RESPONSE
    // ============================================================

    private FloorResponse mapToResponse(Floor floor) {

        Building building = floor.getBuilding();
        Property property = building.getProperty();

        return new FloorResponse(
                floor.getFloorId(),
                floor.getFloorName(),
                floor.getFloorNumber(),
                building.getBuildingId(),
                building.getBuildingName(),
                property.getPropertyId(),
                property.getPropertyName(),
                floor.getCreatedAt(),
                floor.getUpdatedAt()
        );
    }
}
