
package com.rental.rental_management_backend.property.service;

import java.util.List;

import com.rental.rental_management_backend.property.dto.PropertyManagerResponse;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;

public interface PropertyManagerService {

    PropertyManagerResponse getMyProfile();

    PropertyManagerResponse getPropertyManagerById(Long propertyManagerId);

    List<PropertyResponse> getMyAssignedProperties();

    PropertyResponse getMyAssignedPropertyById(Long propertyId);
    PropertyDetailsResponse getMyAssignedPropertyDetails(Long propertyId);
    
    
}
