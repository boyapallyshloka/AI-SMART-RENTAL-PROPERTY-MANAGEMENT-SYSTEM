package com.rental.rental_management_backend.property.service;


import java.util.List;

import com.rental.rental_management_backend.property.dto.AmenityRequest;
import com.rental.rental_management_backend.property.dto.AmenityResponse;


public interface AmenityService {

    // Amenity master operations

    AmenityResponse createAmenity(
            AmenityRequest request);

    List<AmenityResponse> getAllAmenities();

    AmenityResponse getAmenityById(
            Long amenityId);

    AmenityResponse updateAmenity(
            Long amenityId,
            AmenityRequest request);

    void deleteAmenity(
            Long amenityId);

    // Property-Amenity operations

    AmenityResponse addAmenityToProperty(
            Long propertyId,
            Long amenityId);

    void removeAmenityFromProperty(
            Long propertyId,
            Long amenityId);

    List<AmenityResponse> getPropertyAmenities(
            Long propertyId);
    List<AmenityResponse> getPublicPropertyAmenities(Long propertyId);
}