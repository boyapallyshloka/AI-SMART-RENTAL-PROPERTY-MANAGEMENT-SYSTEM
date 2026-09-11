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
import com.rental.rental_management_backend.property.dto.BuildingRequest;
import com.rental.rental_management_backend.property.dto.BuildingResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.repository.BuildingRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.BuildingService;

@Service
@Transactional
public class BuildingServiceImpl implements BuildingService {

    private final BuildingRepository buildingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public BuildingServiceImpl(
            BuildingRepository buildingRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.buildingRepository = buildingRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // CREATE BUILDING
    // ============================================================

    @Override
    public BuildingResponse createBuilding(
            BuildingRequest request) {

        User owner = getAuthenticatedOwner();

        Property property = propertyRepository
                .findByPropertyIdAndOwner(
                        request.getPropertyId(),
                        owner)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found or you do not have permission"));

        if (buildingRepository.existsByPropertyAndBuildingName(
                property,
                request.getBuildingName())) {

            throw new RuntimeException(
                    "Building with this name already exists in this property");
        }

        Building building = new Building();

        building.setBuildingName(
                request.getBuildingName());

        building.setDescription(
                request.getDescription());

        building.setTotalFloors(
                request.getTotalFloors());

        building.setProperty(property);

        Building savedBuilding =
                buildingRepository.save(building);

        return mapToResponse(savedBuilding);
    }

    // ============================================================
    // GET BUILDINGS BY PROPERTY
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getBuildingsByProperty(
            Long propertyId) {

        User owner = getAuthenticatedOwner();

        Property property = propertyRepository
                .findByPropertyIdAndOwner(
                        propertyId,
                        owner)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found or you do not have permission"));

        return buildingRepository
                .findByProperty(property)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET BUILDING BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public BuildingResponse getBuildingById(
            Long buildingId) {

        User owner = getAuthenticatedOwner();

        Building building =
                getBuildingOwnedByOwner(
                        buildingId,
                        owner);

        return mapToResponse(building);
    }

    // ============================================================
    // UPDATE BUILDING
    // ============================================================

    @Override
    public BuildingResponse updateBuilding(
            Long buildingId,
            BuildingRequest request) {

        User owner = getAuthenticatedOwner();

        Building building =
                getBuildingOwnedByOwner(
                        buildingId,
                        owner);

        Property property = building.getProperty();

        if (!building.getBuildingName()
                .equals(request.getBuildingName())
                && buildingRepository
                .existsByPropertyAndBuildingName(
                        property,
                        request.getBuildingName())) {

            throw new RuntimeException(
                    "Building with this name already exists in this property");
        }

        building.setBuildingName(
                request.getBuildingName());

        building.setDescription(
                request.getDescription());

        building.setTotalFloors(
                request.getTotalFloors());

        Building updatedBuilding =
                buildingRepository.save(building);

        return mapToResponse(updatedBuilding);
    }

    // ============================================================
    // DELETE BUILDING
    // ============================================================

    @Override
    public void deleteBuilding(
            Long buildingId) {

        User owner = getAuthenticatedOwner();

        Building building =
                getBuildingOwnedByOwner(
                        buildingId,
                        owner);

        buildingRepository.delete(building);
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

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        if (user.getRole() != RoleType.PROPERTY_OWNER) {

            throw new RuntimeException(
                    "Only PROPERTY_OWNER can manage buildings");
        }

        return user;
    }

    // ============================================================
    // BUILDING OWNERSHIP
    // ============================================================

    private Building getBuildingOwnedByOwner(
            Long buildingId,
            User owner) {

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

        if (property.getOwner() == null) {

            throw new RuntimeException(
                    "Property is not associated with an owner");
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
    // ENTITY → RESPONSE
    // ============================================================

    private BuildingResponse mapToResponse(
            Building building) {

        Property property =
                building.getProperty();

        return new BuildingResponse(
                building.getBuildingId(),
                building.getBuildingName(),
                building.getDescription(),
                building.getTotalFloors(),
                property != null
                        ? property.getPropertyId()
                        : null,
                property != null
                        ? property.getPropertyName()
                        : null,
                building.getCreatedAt(),
                building.getUpdatedAt()
        );
    }
}