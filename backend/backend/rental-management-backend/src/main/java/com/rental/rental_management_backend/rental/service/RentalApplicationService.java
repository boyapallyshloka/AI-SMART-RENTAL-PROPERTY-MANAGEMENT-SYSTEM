package com.rental.rental_management_backend.rental.service;

import java.util.List;

import com.rental.rental_management_backend.rental.dto.RentalApplicationCreateRequest;
import com.rental.rental_management_backend.rental.dto.RentalApplicationResponse;
import com.rental.rental_management_backend.rental.dto.RentalApplicationReviewRequest;

public interface RentalApplicationService {

    RentalApplicationResponse createApplication(
            String email,
            RentalApplicationCreateRequest request
    );

    RentalApplicationResponse getApplicationById(
            Long applicationId
    );

    List<RentalApplicationResponse> getMyApplications(
            String email
    );

    List<RentalApplicationResponse> getApplicationsForUnit(
            Long unitId
    );

    List<RentalApplicationResponse> getAllApplications();

    RentalApplicationResponse reviewApplication(
            Long applicationId,
            String email,
            RentalApplicationReviewRequest request
    );

    void withdrawApplication(
            Long applicationId,
            String email
    );
}