package com.rental.rental_management_backend.property.service;

import java.util.List;

import com.rental.rental_management_backend.property.dto.PropertyRequest;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.enums.PropertyStatus;

public interface PropertyService {

    PropertyResponse createProperty(PropertyRequest request);

    List<PropertyResponse> getMyProperties();

    PropertyResponse getMyPropertyById(Long id);

    PropertyResponse updateProperty(
            Long id,
            PropertyRequest request
    );

    void deleteProperty(Long id);

    PropertyResponse updatePropertyStatus(
            Long id,
            PropertyStatus status
    );
}