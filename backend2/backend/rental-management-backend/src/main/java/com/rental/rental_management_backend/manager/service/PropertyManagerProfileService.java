package com.rental.rental_management_backend.manager.service;

import com.rental.rental_management_backend.manager.dto.PropertyManagerProfileResponse;
import com.rental.rental_management_backend.manager.dto.PropertyManagerProfileUpdateRequest;

public interface PropertyManagerProfileService {

    PropertyManagerProfileResponse getMyProfile(String email);

    PropertyManagerProfileResponse updateMyProfile(
            String email,
            PropertyManagerProfileUpdateRequest request);
}