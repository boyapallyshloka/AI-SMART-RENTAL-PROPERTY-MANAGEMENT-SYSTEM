package com.rental.rental_management_backend.property.serviceimpl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.property.dto.PropertyRequest;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.enums.PropertyStatus;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.PropertyService;

@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;

    private final UserRepository userRepository;

    public PropertyServiceImpl(
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
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

        property.setFurnishingStatus(
                request.getFurnishingStatus()
        );

        property.setParkingAvailable(
                request.getParkingAvailable()
        );

        property.setYearBuilt(
                request.getYearBuilt()
        );

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

        User owner = getLoggedInUser();

        validateOwner(owner);

        return propertyRepository.findByOwner(owner)
                .stream()
                .map(this::convertToResponse)
                .toList();
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
                                new RuntimeException(
                                        "Property not found or you do not have permission"
                                ));

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
                                new RuntimeException(
                                        "Property not found or you do not have permission"
                                ));

        property.setPropertyName(
                request.getPropertyName()
        );

        property.setPropertyType(
                request.getPropertyType()
        );

        property.setDescription(
                request.getDescription()
        );

        property.setTotalArea(
                request.getTotalArea()
        );

        property.setFurnishingStatus(
                request.getFurnishingStatus()
        );

        property.setParkingAvailable(
                request.getParkingAvailable()
        );

        property.setYearBuilt(
                request.getYearBuilt()
        );

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
                                new RuntimeException(
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
                                new RuntimeException(
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
}
