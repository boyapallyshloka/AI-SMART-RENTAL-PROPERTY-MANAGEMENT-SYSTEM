package com.rental.rental_management_backend.owner.service;

import com.rental.rental_management_backend.owner.dto.OwnerProfileResponse;
import com.rental.rental_management_backend.owner.dto.OwnerProfileUpdateRequest;

public interface OwnerProfileService {

    OwnerProfileResponse getMyProfile(String email);

    OwnerProfileResponse updateMyProfile(
            String email,
            OwnerProfileUpdateRequest request
    );
}