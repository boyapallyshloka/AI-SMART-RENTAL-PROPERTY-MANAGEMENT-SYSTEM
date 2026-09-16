package com.rental.rental_management_backend.property.serviceimpl.controller;



import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.rental.dto.RentalApplicationCreateRequest;
import com.rental.rental_management_backend.rental.dto.RentalApplicationResponse;
import com.rental.rental_management_backend.rental.dto.RentalApplicationReviewRequest;
import com.rental.rental_management_backend.rental.service.RentalApplicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rental-applications")
@Validated
public class RentalApplicationController {

    private final RentalApplicationService rentalApplicationService;

    public RentalApplicationController(
            RentalApplicationService rentalApplicationService) {

        this.rentalApplicationService =
                rentalApplicationService;
    }

    // =========================================================
    // TENANT - CREATE APPLICATION
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<RentalApplicationResponse>
    createApplication(
            Authentication authentication,
            @Valid @RequestBody
            RentalApplicationCreateRequest request) {

        String email = authentication.getName();

        RentalApplicationResponse response =
                rentalApplicationService.createApplication(
                        email,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // TENANT - GET MY APPLICATIONS
    // =========================================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<RentalApplicationResponse>>
    getMyApplications(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalApplicationService
                        .getMyApplications(email)
        );
    }

    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    @GetMapping("/{applicationId}")
    public ResponseEntity<RentalApplicationResponse>
    getApplicationById(
            @PathVariable Long applicationId) {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getApplicationById(applicationId)
        );
    }

    // =========================================================
    // OWNER / MANAGER - GET APPLICATIONS FOR UNIT
    // =========================================================

    @GetMapping("/unit/{unitId}")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
    public ResponseEntity<List<RentalApplicationResponse>>
    getApplicationsForUnit(
            @PathVariable Long unitId) {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getApplicationsForUnit(unitId)
        );
    }

    // =========================================================
    // SUPER ADMIN - GET ALL APPLICATIONS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<RentalApplicationResponse>>
    getAllApplications() {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getAllApplications()
        );
    }

    // =========================================================
    // OWNER / MANAGER - APPROVE OR REJECT
    // =========================================================

    @PatchMapping("/{applicationId}/review")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
    public ResponseEntity<RentalApplicationResponse>
    reviewApplication(
            @PathVariable Long applicationId,
            Authentication authentication,
            @Valid @RequestBody
            RentalApplicationReviewRequest request) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalApplicationService.reviewApplication(
                        applicationId,
                        email,
                        request
                )
        );
    }

    // =========================================================
    // TENANT - WITHDRAW APPLICATION
    // =========================================================

    @PatchMapping("/{applicationId}/withdraw")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        String email = authentication.getName();

        rentalApplicationService.withdrawApplication(
                applicationId,
                email
        );

        return ResponseEntity.noContent().build();
    }
}