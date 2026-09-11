package com.rental.rental_management_backend.property.serviceimpl;



import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.property.dto.AmenityRequest;
import com.rental.rental_management_backend.property.dto.AmenityResponse;
import com.rental.rental_management_backend.property.entity.Amenity;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAmenity;
import com.rental.rental_management_backend.property.repository.AmenityRepository;
import com.rental.rental_management_backend.property.repository.PropertyAmenityRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.AmenityService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    private final PropertyAmenityRepository propertyAmenityRepository;

    private final PropertyRepository propertyRepository;

    private final UserRepository userRepository;

    public AmenityServiceImpl(
            AmenityRepository amenityRepository,
            PropertyAmenityRepository propertyAmenityRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.amenityRepository = amenityRepository;
        this.propertyAmenityRepository =
                propertyAmenityRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE AMENITY
    // =========================================================

    @Override
    public AmenityResponse createAmenity(
            AmenityRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Amenity request cannot be null");
        }

        String amenityName =
                request.getAmenityName().trim();

        if (amenityName.isEmpty()) {
            throw new RuntimeException(
                    "Amenity name is required");
        }

        if (amenityRepository
                .existsByAmenityNameIgnoreCase(amenityName)) {

            throw new RuntimeException(
                    "Amenity already exists");
        }

        Amenity amenity = new Amenity();

        amenity.setAmenityName(amenityName);
        amenity.setDescription(
                request.getDescription());

        Amenity savedAmenity =
                amenityRepository.save(amenity);

        return mapToResponse(savedAmenity);
    }

    // =========================================================
    // GET ALL AMENITIES
    // =========================================================

    @Override
    public List<AmenityResponse> getAllAmenities() {

        return amenityRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET AMENITY BY ID
    // =========================================================

    @Override
    public AmenityResponse getAmenityById(
            Long amenityId) {

        Amenity amenity =
                amenityRepository
                        .findById(amenityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity not found"));

        return mapToResponse(amenity);
    }

    // =========================================================
    // UPDATE AMENITY
    // =========================================================

    @Override
    public AmenityResponse updateAmenity(
            Long amenityId,
            AmenityRequest request) {

        Amenity amenity =
                amenityRepository
                        .findById(amenityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity not found"));

        if (request == null) {
            throw new RuntimeException(
                    "Amenity request cannot be null");
        }

        String newName =
                request.getAmenityName().trim();

        if (newName.isEmpty()) {
            throw new RuntimeException(
                    "Amenity name is required");
        }

        amenityRepository
                .findByAmenityNameIgnoreCase(newName)
                .ifPresent(existing -> {

                    if (!existing.getAmenityId()
                            .equals(amenityId)) {

                        throw new RuntimeException(
                                "Another amenity with this name already exists");
                    }
                });

        amenity.setAmenityName(newName);

        amenity.setDescription(
                request.getDescription());

        Amenity updatedAmenity =
                amenityRepository.save(amenity);

        return mapToResponse(updatedAmenity);
    }

    // =========================================================
    // DELETE AMENITY
    // =========================================================

    @Override
    public void deleteAmenity(
            Long amenityId) {

        Amenity amenity =
                amenityRepository
                        .findById(amenityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity not found"));

        List<PropertyAmenity> propertyAmenities =
                propertyAmenityRepository
                        .findAll()
                        .stream()
                        .filter(pa ->
                                pa.getAmenity()
                                  .getAmenityId()
                                  .equals(amenityId))
                        .collect(Collectors.toList());

        if (!propertyAmenities.isEmpty()) {

            propertyAmenityRepository
                    .deleteAll(propertyAmenities);
        }

        amenityRepository.delete(amenity);
    }

    // =========================================================
    // ADD AMENITY TO PROPERTY
    // =========================================================

    @Override
    public AmenityResponse addAmenityToProperty(
            Long propertyId,
            Long amenityId) {

        User owner =
                getAuthenticatedUser();

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(
                                propertyId,
                                owner)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found or you are not the owner"));

        Amenity amenity =
                amenityRepository
                        .findById(amenityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity not found"));

        boolean alreadyExists =
                propertyAmenityRepository
                        .existsByPropertyAndAmenity_AmenityId(
                                property,
                                amenityId);

        if (alreadyExists) {

            throw new RuntimeException(
                    "Amenity is already assigned to this property");
        }

        PropertyAmenity propertyAmenity =
                new PropertyAmenity();

        propertyAmenity.setProperty(property);
        propertyAmenity.setAmenity(amenity);

        propertyAmenityRepository
                .save(propertyAmenity);

        return mapToResponse(amenity);
    }

    // =========================================================
    // REMOVE AMENITY FROM PROPERTY
    // =========================================================

    @Override
    public void removeAmenityFromProperty(
            Long propertyId,
            Long amenityId) {

        User owner =
                getAuthenticatedUser();

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(
                                propertyId,
                                owner)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found or you are not the owner"));

        PropertyAmenity propertyAmenity =
                propertyAmenityRepository
                        .findByPropertyAndAmenity_AmenityId(
                                property,
                                amenityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Amenity is not assigned to this property"));

        propertyAmenityRepository
                .delete(propertyAmenity);
    }

    // =========================================================
    // GET PROPERTY AMENITIES
    // =========================================================

    @Override
    public List<AmenityResponse> getPropertyAmenities(
            Long propertyId) {

        User owner =
                getAuthenticatedUser();

        Property property =
                propertyRepository
                        .findByPropertyIdAndOwner(
                                propertyId,
                                owner)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found or you are not the owner"));

        return propertyAmenityRepository
                .findByProperty(property)
                .stream()
                .map(PropertyAmenity::getAmenity)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

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

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));
    }

    // =========================================================
    // MAP ENTITY TO RESPONSE
    // =========================================================

    private AmenityResponse mapToResponse(
            Amenity amenity) {

        AmenityResponse response =
                new AmenityResponse();

        response.setAmenityId(
                amenity.getAmenityId());

        response.setAmenityName(
                amenity.getAmenityName());

        response.setDescription(
                amenity.getDescription());

        return response;
    }
    @Override
    public List<AmenityResponse> getPublicPropertyAmenities(
            Long propertyId) {

        Property property =
                propertyRepository
                        .findById(propertyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property not found with ID: "
                                                + propertyId));

        return propertyAmenityRepository
                .findByProperty(property)
                .stream()
                .map(PropertyAmenity::getAmenity)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}