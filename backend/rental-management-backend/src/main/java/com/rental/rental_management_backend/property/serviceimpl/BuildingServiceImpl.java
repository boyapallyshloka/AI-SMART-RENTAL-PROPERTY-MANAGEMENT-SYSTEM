package com.rental.rental_management_backend.property.serviceimpl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.property.dto.BuildingRequest;
import com.rental.rental_management_backend.property.dto.BuildingResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.repository.BuildingRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.BuildingService;

import jakarta.transaction.Transactional;

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

    @Override
    public BuildingResponse createBuilding(
            BuildingRequest request) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property = propertyRepository
                .findByPropertyIdAndOwner(
                        request.getPropertyId(),
                        owner
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found or you do not have permission"
                        )
                );

        if (buildingRepository.existsByPropertyAndBuildingName(
                property,
                request.getBuildingName())) {

            throw new RuntimeException(
                    "Building with this name already exists"
            );
        }

        Building building = new Building();

        building.setBuildingName(
                request.getBuildingName()
        );

        building.setTotalFloors(
                request.getTotalFloors()
        );

        building.setTotalUnits(
                request.getTotalUnits()
        );

        building.setDescription(
                request.getDescription()
        );

        building.setProperty(property);

        Building savedBuilding =
                buildingRepository.save(building);

        return convertToResponse(savedBuilding);
    }

    @Override
    @Transactional
    public List<BuildingResponse> getBuildingsByProperty(
            Long propertyId) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property = propertyRepository
                .findByPropertyIdAndOwner(
                        propertyId,
                        owner
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found or you do not have permission"
                        )
                );

        return buildingRepository
                .findByProperty(property)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    @Transactional
    public BuildingResponse getBuildingById(
            Long buildingId) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Building building = getOwnerBuilding(
                buildingId,
                owner
        );

        return convertToResponse(building);
    }

    @Override
    public BuildingResponse updateBuilding(
            Long buildingId,
            BuildingRequest request) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Building building = getOwnerBuilding(
                buildingId,
                owner
        );

        building.setBuildingName(
                request.getBuildingName()
        );

        building.setTotalFloors(
                request.getTotalFloors()
        );

        building.setTotalUnits(
                request.getTotalUnits()
        );

        building.setDescription(
                request.getDescription()
        );

        Building updatedBuilding =
                buildingRepository.save(building);

        return convertToResponse(updatedBuilding);
    }

    @Override
    public void deleteBuilding(
            Long buildingId) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Building building = getOwnerBuilding(
                buildingId,
                owner
        );

        buildingRepository.delete(building);
    }

    private Building getOwnerBuilding(
            Long buildingId,
            User owner) {

        Building building = buildingRepository
                .findById(buildingId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Building not found with id: "
                                        + buildingId
                        )
                );

        Property property =
                building.getProperty();

        if (!property.getOwner().getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "You do not have permission to access this building"
            );
        }

        return building;
    }

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }

    private void validateOwner(User user) {

        if (user.getRole()
                != RoleType.PROPERTY_OWNER) {

            throw new RuntimeException(
                    "Only PROPERTY_OWNER can manage buildings"
            );
        }
    }

    private BuildingResponse convertToResponse(
            Building building) {

        BuildingResponse response =
                new BuildingResponse();

        response.setBuildingId(
                building.getBuildingId()
        );

        response.setBuildingName(
                building.getBuildingName()
        );

        response.setTotalFloors(
                building.getTotalFloors()
        );

        response.setTotalUnits(
                building.getTotalUnits()
        );

        response.setDescription(
                building.getDescription()
        );

        if (building.getProperty() != null) {

            response.setPropertyId(
                    building.getProperty()
                            .getPropertyId()
            );

            response.setPropertyName(
                    building.getProperty()
                            .getPropertyName()
            );
        }

        response.setCreatedAt(
                building.getCreatedAt()
        );

        response.setUpdatedAt(
                building.getUpdatedAt()
        );

        return response;
    }
}