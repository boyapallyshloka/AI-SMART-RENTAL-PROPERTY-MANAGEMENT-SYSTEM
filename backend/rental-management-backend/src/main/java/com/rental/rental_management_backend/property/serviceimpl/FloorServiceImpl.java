package com.rental.rental_management_backend.property.serviceimpl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.dto.FloorRequest;
import com.rental.rental_management_backend.property.dto.FloorResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.repository.BuildingRepository;
import com.rental.rental_management_backend.property.repository.FloorRepository;
import com.rental.rental_management_backend.property.service.FloorService;

@Service
@Transactional
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final UserRepository userRepository;

    public FloorServiceImpl(
            FloorRepository floorRepository,
            BuildingRepository buildingRepository,
            UserRepository userRepository) {

        this.floorRepository = floorRepository;
        this.buildingRepository = buildingRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // CREATE FLOOR
    // ============================================================

    @Override
    public FloorResponse createFloor(
            FloorRequest request) {

        User authenticatedUser =
                getAuthenticatedUser();

        Building building =
                getAccessibleBuilding(
                        request.getBuildingId(),
                        authenticatedUser);

        if (floorRepository
                .existsByBuildingAndFloorNumber(
                        building,
                        request.getFloorNumber())) {

            throw new RuntimeException(
                    "Floor number "
                            + request.getFloorNumber()
                            + " already exists in this building");
        }

        Floor floor = new Floor();

        floor.setFloorName(
                request.getFloorName());

        floor.setFloorNumber(
                request.getFloorNumber());

        floor.setBuilding(building);

        Floor savedFloor =
                floorRepository.save(floor);

        return mapToResponse(savedFloor);
    }

    // ============================================================
    // GET FLOORS BY BUILDING
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<FloorResponse> getFloorsByBuilding(
            Long buildingId) {

        User authenticatedUser =
                getAuthenticatedUser();

        Building building =
                getAccessibleBuilding(
                        buildingId,
                        authenticatedUser);

        return floorRepository
                .findByBuilding(building)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET FLOOR BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public FloorResponse getFloorById(
            Long floorId) {

        User authenticatedUser =
                getAuthenticatedUser();

        Floor floor =
                floorRepository
                        .findById(floorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Floor not found with ID: "
                                                + floorId));

        validateFloorAccess(
                floor,
                authenticatedUser);

        return mapToResponse(floor);
    }

    // ============================================================
    // UPDATE FLOOR
    // ============================================================

    @Override
    public FloorResponse updateFloor(
            Long floorId,
            FloorRequest request) {

        User authenticatedUser =
                getAuthenticatedUser();

        Floor floor =
                floorRepository
                        .findById(floorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Floor not found with ID: "
                                                + floorId));

        validateFloorAccess(
                floor,
                authenticatedUser);

        Building newBuilding =
                getAccessibleBuilding(
                        request.getBuildingId(),
                        authenticatedUser);

        boolean buildingChanged =
                !floor.getBuilding()
                        .getBuildingId()
                        .equals(newBuilding.getBuildingId());

        boolean floorNumberChanged =
                !floor.getFloorNumber()
                        .equals(request.getFloorNumber());

        if (buildingChanged || floorNumberChanged) {

            if (floorRepository
                    .existsByBuildingAndFloorNumber(
                            newBuilding,
                            request.getFloorNumber())) {

                throw new RuntimeException(
                        "Floor number "
                                + request.getFloorNumber()
                                + " already exists in this building");
            }
        }

        floor.setFloorName(
                request.getFloorName());

        floor.setFloorNumber(
                request.getFloorNumber());

        floor.setBuilding(
                newBuilding);

        Floor updatedFloor =
                floorRepository.save(floor);

        return mapToResponse(updatedFloor);
    }

    // ============================================================
    // DELETE FLOOR
    // ============================================================

    @Override
    public void deleteFloor(
            Long floorId) {

        User authenticatedUser =
                getAuthenticatedUser();

        Floor floor =
                floorRepository
                        .findById(floorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Floor not found with ID: "
                                                + floorId));

        validateFloorAccess(
                floor,
                authenticatedUser);

        floorRepository.delete(floor);
    }

    // ============================================================
    // AUTHENTICATED USER
    // ============================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Authenticated user not found"));

        if (user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new RuntimeException(
                    "Only PROPERTY_OWNER or PROPERTY_MANAGER can manage floors");
        }

        return user;
    }

    // ============================================================
    // BUILDING ACCESS
    // ============================================================

    private Building getAccessibleBuilding(
            Long buildingId,
            User authenticatedUser) {

        Building building =
                buildingRepository
                        .findById(buildingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Building not found with ID: "
                                                + buildingId));

        Property property =
                building.getProperty();

        if (property == null) {

            throw new RuntimeException(
                    "Building is not associated with a property");
        }

        // --------------------------------------------------------
        // PROPERTY OWNER ACCESS
        // --------------------------------------------------------

        if (authenticatedUser.getRole()
                == RoleType.PROPERTY_OWNER) {

            if (property.getOwner() == null
                    || property.getOwner().getId() == null
                    || !property.getOwner()
                            .getId()
                            .equals(authenticatedUser.getId())) {

                throw new ResourceNotFoundException(
                        "Building not found with ID: "
                                + buildingId);
            }

            return building;
        }

        // --------------------------------------------------------
        // PROPERTY MANAGER ACCESS
        // --------------------------------------------------------

        if (authenticatedUser.getRole()
                == RoleType.PROPERTY_MANAGER) {

            if (property.getPropertyManager() == null
                    || property.getPropertyManager().getUser() == null
                    || property.getPropertyManager()
                            .getUser()
                            .getId() == null
                    || !property.getPropertyManager()
                            .getUser()
                            .getId()
                            .equals(authenticatedUser.getId())) {

                throw new ResourceNotFoundException(
                        "Building not found with ID: "
                                + buildingId);
            }

            return building;
        }

        throw new ResourceNotFoundException(
                "Building not found with ID: "
                        + buildingId);
    }

    // ============================================================
    // FLOOR ACCESS
    // ============================================================

    private void validateFloorAccess(
            Floor floor,
            User authenticatedUser) {

        Building building =
                floor.getBuilding();

        if (building == null) {

            throw new RuntimeException(
                    "Floor is not associated with a building");
        }

        // Reuse the same building/property authorization.
        getAccessibleBuilding(
                building.getBuildingId(),
                authenticatedUser);
    }

    // ============================================================
    // ENTITY → RESPONSE
    // ============================================================

    private FloorResponse mapToResponse(
            Floor floor) {

        Building building =
                floor.getBuilding();

        Property property =
                building != null
                        ? building.getProperty()
                        : null;

        return new FloorResponse(
                floor.getFloorId(),
                floor.getFloorName(),
                floor.getFloorNumber(),
                building != null
                        ? building.getBuildingId()
                        : null,
                building != null
                        ? building.getBuildingName()
                        : null,
                property != null
                        ? property.getPropertyId()
                        : null,
                property != null
                        ? property.getPropertyName()
                        : null,
                floor.getCreatedAt(),
                floor.getUpdatedAt()
        );
    }

    // ============================================================
    // PUBLIC FLOORS FOR TENANTS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<FloorResponse> getPublicFloorsByBuilding(
            Long buildingId) {

        Building building =
                buildingRepository
                        .findById(buildingId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Building not found with ID: "
                                                + buildingId));

        return floorRepository
                .findByBuilding(building)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}