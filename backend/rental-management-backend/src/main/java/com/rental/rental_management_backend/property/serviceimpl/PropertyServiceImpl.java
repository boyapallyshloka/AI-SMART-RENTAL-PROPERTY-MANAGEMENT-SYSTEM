
package com.rental.rental_management_backend.property.serviceimpl;

import java.util.List;
import com.rental.rental_management_backend.property.enums.FurnishingStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;
import com.rental.rental_management_backend.property.enums.PropertyStatus;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.dto.PropertyRequest;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.enums.PropertyStatus;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.PropertyService;
import com.rental.rental_management_backend.property.entity.PropertyManager;
import com.rental.rental_management_backend.property.repository.PropertyManagerRepository;

@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;

    private final UserRepository userRepository;
    private final PropertyManagerRepository propertyManagerRepository;

    public PropertyServiceImpl(
            PropertyRepository propertyRepository,
            UserRepository userRepository,
            PropertyManagerRepository propertyManagerRepository) {

        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.propertyManagerRepository = propertyManagerRepository;
    }

    @Override
    public PropertyResponse createProperty(PropertyRequest request) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property = new Property();

        property.setPropertyName(request.getPropertyName());

        property.setPropertyType(request.getPropertyType());

        property.setDescription(request.getDescription());

        property.setTotalArea(request.getTotalArea());

        property.setFurnishingStatus(request.getFurnishingStatus());

        property.setParkingAvailable(request.getParkingAvailable());

        property.setYearBuilt(request.getYearBuilt());

        /*
         * Owner is taken from the authenticated JWT user.
         * Client cannot choose ownerId.
         */

        property.setOwner(owner);

        /*
         * Every newly created property starts as DRAFT.
         */

        property.setStatus(PropertyStatus.DRAFT);

        Property savedProperty =
                propertyRepository.save(property);

        return convertToResponse(savedProperty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getMyProperties() {

        User user = getLoggedInUser();

        if (user.getRole() == RoleType.PROPERTY_OWNER) {
            return propertyRepository.findByOwner(user)
                    .stream()
                    .map(this::convertToResponse)
                    .toList();
        }

        if (user.getRole() == RoleType.TENANT) {
            return propertyRepository.findByStatus(PropertyStatus.AVAILABLE)
                    .stream()
                    .map(this::convertToResponse)
                    .toList();
        }

        validateOwner(user);

        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getMyPropertyById(Long id) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(id, owner)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"
                                ));

        return convertToResponse(property);
    }

    /*
     * GET ALL AVAILABLE PROPERTIES
     *
     * Used by tenants to browse properties
     * that are currently available for rental.
     */

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getAvailableProperties() {

        return propertyRepository
                .findByStatus(PropertyStatus.AVAILABLE)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    /*
     * GET ONE AVAILABLE PROPERTY
     *
     * Used by tenants to view a specific
     * available property.
     */

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getPublicPropertyById(Long propertyId) {

        Property property =
                propertyRepository
                        .findById(propertyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found with id: "
                                                + propertyId
                                ));

        if (property.getStatus() != PropertyStatus.AVAILABLE) {

            throw new RuntimeException(
                    "Property is not available for tenants"
            );
        }

        return convertToResponse(property);
    }

    @Override
    public PropertyResponse updateProperty(
            Long id,
            PropertyRequest request) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(id, owner)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"
                                ));

        property.setPropertyName(request.getPropertyName());

        property.setPropertyType(request.getPropertyType());

        property.setDescription(request.getDescription());

        property.setTotalArea(request.getTotalArea());

        property.setFurnishingStatus(request.getFurnishingStatus());

        property.setParkingAvailable(request.getParkingAvailable());

        property.setYearBuilt(request.getYearBuilt());

        /*
         * Owner and status are intentionally not changed
         * during normal property update.
         */

        Property updatedProperty =
                propertyRepository.save(property);

        return convertToResponse(updatedProperty);
    }

    @Override
    public void deleteProperty(Long id) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(id, owner)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"
                                ));

        propertyRepository.delete(property);
    }

    @Override
    public PropertyResponse updatePropertyStatus(
            Long id,
            PropertyStatus status) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        if (status == null) {

            throw new RuntimeException(
                    "Property status is required"
            );
        }

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(id, owner)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"
                                ));

        property.setStatus(status);

        Property updatedProperty =
                propertyRepository.save(property);

        return convertToResponse(updatedProperty);
    }

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));
    }

    private void validateOwner(User user) {

        if (user.getRole() != RoleType.PROPERTY_OWNER) {

            throw new RuntimeException(
                    "Only PROPERTY_OWNER can manage properties"
            );
        }
    }

    private PropertyResponse convertToResponse(
            Property property) {

        PropertyResponse response =
                new PropertyResponse();

        response.setPropertyId(
                property.getPropertyId()
        );

        response.setPropertyName(
                property.getPropertyName()
        );

        response.setPropertyType(
                property.getPropertyType()
        );

        response.setDescription(
                property.getDescription()
        );

        response.setTotalArea(
                property.getTotalArea()
        );

        response.setFurnishingStatus(
                property.getFurnishingStatus()
        );

        response.setParkingAvailable(
                property.getParkingAvailable()
        );

        response.setYearBuilt(
                property.getYearBuilt()
        );

        response.setStatus(
                property.getStatus()
        );

        if (property.getOwner() != null) {

            response.setOwnerId(
                    property.getOwner().getId()
            );

            response.setOwnerName(
                    property.getOwner().getFirstName()
                            + " "
                            + property.getOwner().getLastName()
            );
        }

        response.setCreatedAt(
                property.getCreatedAt()
        );

        response.setUpdatedAt(
                property.getUpdatedAt()
        );

        return response;
    }
    
    @Override
    public PropertyResponse assignPropertyManager(
            Long propertyId,
            Long propertyManagerId) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(propertyId, owner)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"));

        PropertyManager propertyManager =
                propertyManagerRepository
                        .findById(propertyManagerId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property manager not found with id: "
                                                + propertyManagerId));

        if (propertyManager.getUser() == null) {
            throw new RuntimeException(
                    "Property manager is not linked to a user");
        }

        if (propertyManager.getUser().getRole()
                != RoleType.PROPERTY_MANAGER) {

            throw new RuntimeException(
                    "Selected user is not a PROPERTY_MANAGER");
        }

        property.setPropertyManager(propertyManager);

        Property updatedProperty =
                propertyRepository.save(property);

        return convertToResponse(updatedProperty);
    }


    @Override
    public PropertyResponse removePropertyManager(
            Long propertyId) {

        User owner = getLoggedInUser();

        validateOwner(owner);

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(propertyId, owner)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found or you do not have permission"));

        property.setPropertyManager(null);

        Property updatedProperty =
                propertyRepository.save(property);

        return convertToResponse(updatedProperty);
    }
    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> searchAvailableProperties(
            String searchQuery,
            String city,
            PropertyType propertyType,
            FurnishingStatus furnishingStatus,
            Boolean parkingAvailable,
            Double minRent,
            Double maxRent,
            Integer bedrooms
    ) {

        // Normalize text filters
        searchQuery = normalize(searchQuery);
        city = normalize(city);

        // Validate rent range
        if (minRent != null && minRent < 0) {
            throw new IllegalArgumentException("Minimum rent cannot be negative");
        }

        if (maxRent != null && maxRent < 0) {
            throw new IllegalArgumentException("Maximum rent cannot be negative");
        }

        if (minRent != null && maxRent != null && minRent > maxRent) {
            throw new IllegalArgumentException(
                    "Minimum rent cannot be greater than maximum rent"
            );
        }

        // Validate bedrooms
        if (bedrooms != null && bedrooms < 0) {
            throw new IllegalArgumentException(
                    "Bedrooms cannot be negative"
            );
        }

        List<Property> properties = propertyRepository.searchAvailableProperties(
                PropertyStatus.AVAILABLE,
                searchQuery,
                city,
                propertyType,
                furnishingStatus,
                parkingAvailable,
                minRent,
                maxRent,
                bedrooms
        );

        return properties.stream()
                .map(this::convertToResponse)
                .toList();
    }
    private String normalize(String value) {

        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
    
}
