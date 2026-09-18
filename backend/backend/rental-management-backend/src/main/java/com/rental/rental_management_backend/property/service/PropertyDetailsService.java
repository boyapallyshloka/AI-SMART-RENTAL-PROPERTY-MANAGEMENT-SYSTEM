package com.rental.rental_management_backend.property.service;

import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;

public interface PropertyDetailsService {

    PropertyDetailsResponse getPropertyDetails(Long propertyId);
}