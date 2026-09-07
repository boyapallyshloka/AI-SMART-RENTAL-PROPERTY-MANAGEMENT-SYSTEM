package com.rental.rental_management_backend.property.serviceimpl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.property.dto.PropertyAddressRequest;
import com.rental.rental_management_backend.property.dto.PropertyAddressResponse;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAddress;
import com.rental.rental_management_backend.property.repository.PropertyAddressRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.PropertyAddressService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PropertyAddressServiceImpl
        implements PropertyAddressService {

    private final PropertyAddressRepository addressRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public PropertyAddressServiceImpl(
            PropertyAddressRepository addressRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PropertyAddressResponse createAddress(
            Long propertyId,
            PropertyAddressRequest request) {

        Property property = getOwnedProperty(propertyId);

        if (addressRepository.existsByProperty(property)) {
            throw new RuntimeException(
                    "Address already exists for this property"
            );
        }

        PropertyAddress address = new PropertyAddress();

        mapRequestToEntity(request, address);

        address.setProperty(property);

        PropertyAddress savedAddress =
                addressRepository.save(address);

        return convertToResponse(savedAddress);
    }

    @Override
    public PropertyAddressResponse getAddressByPropertyId(
            Long propertyId) {

        Property property = getOwnedProperty(propertyId);

        PropertyAddress address =
                addressRepository.findByProperty(property)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found for this property"
                                )
                        );

        return convertToResponse(address);
    }

    @Override
    public PropertyAddressResponse updateAddress(
            Long propertyId,
            PropertyAddressRequest request) {

        Property property = getOwnedProperty(propertyId);

        PropertyAddress address =
                addressRepository.findByProperty(property)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found for this property"
                                )
                        );

        mapRequestToEntity(request, address);

        PropertyAddress updatedAddress =
                addressRepository.save(address);

        return convertToResponse(updatedAddress);
    }

    @Override
    public void deleteAddress(Long propertyId) {

        Property property = getOwnedProperty(propertyId);

        PropertyAddress address =
                addressRepository.findByProperty(property)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found for this property"
                                )
                        );

        addressRepository.delete(address);
    }

    private Property getOwnedProperty(Long propertyId) {

        User loggedInUser = getLoggedInUser();

        validateOwner(loggedInUser);

        return propertyRepository
                .findByPropertyIdAndOwner(
                        propertyId,
                        loggedInUser
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found or you do not have permission"
                        )
                );
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

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }

    private void validateOwner(User user) {

        if (user.getRole() != RoleType.PROPERTY_OWNER) {

            throw new RuntimeException(
                    "Only PROPERTY_OWNER can manage property addresses"
            );
        }
    }

    private void mapRequestToEntity(
            PropertyAddressRequest request,
            PropertyAddress address) {

        address.setAddressLine1(
                request.getAddressLine1()
        );

        address.setAddressLine2(
                request.getAddressLine2()
        );

        address.setArea(request.getArea());

        address.setCity(request.getCity());

        address.setState(request.getState());

        address.setCountry(request.getCountry());

        address.setPincode(request.getPincode());

        address.setLatitude(
                request.getLatitude()
        );

        address.setLongitude(
                request.getLongitude()
        );
    }

    private PropertyAddressResponse convertToResponse(
            PropertyAddress address) {

        PropertyAddressResponse response =
                new PropertyAddressResponse();

        response.setAddressId(
                address.getAddressId()
        );

        response.setPropertyId(
                address.getProperty()
                        .getPropertyId()
        );

        response.setAddressLine1(
                address.getAddressLine1()
        );

        response.setAddressLine2(
                address.getAddressLine2()
        );

        response.setArea(address.getArea());

        response.setCity(address.getCity());

        response.setState(address.getState());

        response.setCountry(address.getCountry());

        response.setPincode(address.getPincode());

        response.setLatitude(
                address.getLatitude()
        );

        response.setLongitude(
                address.getLongitude()
        );

        response.setCreatedAt(
                address.getCreatedAt()
        );

        response.setUpdatedAt(
                address.getUpdatedAt()
        );

        return response;
    }
}