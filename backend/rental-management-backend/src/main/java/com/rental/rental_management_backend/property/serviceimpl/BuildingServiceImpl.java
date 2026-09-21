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

        User authenticatedUser = getAuthenticatedUser();

        Property property =
                getAccessibleProperty(
                        request.getPropertyId(),
                        authenticatedUser);

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

        User authenticatedUser = getAuthenticatedUser();

        Property property =
                getAccessibleProperty(
                        propertyId,
                        authenticatedUser);

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

        User authenticatedUser = getAuthenticatedUser();

        Building building =
                getAccessibleBuilding(
                        buildingId,
                        authenticatedUser);

        return mapToResponse(building);
    }

    // ============================================================
    // UPDATE BUILDING
    // ============================================================

    @Override
    public BuildingResponse updateBuilding(
            Long buildingId,
            BuildingRequest request) {

        User authenticatedUser = getAuthenticatedUser();

        Building building =
                getAccessibleBuilding(
                        buildingId,
                        authenticatedUser);

        Property property =
                building.getProperty();

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

        User authenticatedUser = getAuthenticatedUser();

        Building building =
                getAccessibleBuilding(
                        buildingId,
                        authenticatedUser);

        buildingRepository.delete(building);
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

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        if (user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new RuntimeException(
                    "Only PROPERTY_OWNER or PROPERTY_MANAGER can manage buildings");
        }

        return user;
    }

    // ============================================================
    // PROPERTY ACCESS
    // ============================================================

    private Property getAccessibleProperty(
            Long propertyId,
            User authenticatedUser) {

        Property property =
                propertyRepository
                        .findById(propertyId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"));

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
                        "Property not found or you do not have permission");
            }

            return property;
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
                        "Property not found or you do not have permission");
            }

            return property;
        }

        throw new ResourceNotFoundException(
                "Property not found or you do not have permission");
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

        // Reuse the same property-level authorization
        // for both PROPERTY_OWNER and PROPERTY_MANAGER.
        getAccessibleProperty(
                property.getPropertyId(),
                authenticatedUser);

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

    // ============================================================
    // PUBLIC BUILDINGS FOR TENANTS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getPublicBuildingsByProperty(
            Long propertyId) {

        Property property =
                propertyRepository
                        .findById(propertyId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found with ID: "
                                                + propertyId));

        return buildingRepository
                .findByProperty(property)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}