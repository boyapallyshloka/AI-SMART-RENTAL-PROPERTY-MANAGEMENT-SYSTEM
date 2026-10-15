package com.rental.rental_management_backend.rental.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.rental.dto.RentalApplicationCreateRequest;
import com.rental.rental_management_backend.rental.dto.RentalApplicationResponse;
import com.rental.rental_management_backend.rental.dto.RentalApplicationReviewRequest;
import com.rental.rental_management_backend.rental.service.RentalApplicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rental-applications")
public class RentalApplicationController {

    private final RentalApplicationService rentalApplicationService;

    public RentalApplicationController(
            RentalApplicationService rentalApplicationService) {

        this.rentalApplicationService = rentalApplicationService;
    }

    // ============================================================
    // TENANT - CREATE APPLICATION
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<RentalApplicationResponse> createApplication(
            Authentication authentication,
            @Valid @RequestBody RentalApplicationCreateRequest request) {

        String email = authentication.getName();

        RentalApplicationResponse response =
                rentalApplicationService.createApplication(
                        email,
                        request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ============================================================
    // TENANT - VIEW MY APPLICATIONS
    // ============================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<RentalApplicationResponse>>
    getMyApplications(Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalApplicationService
                        .getMyApplications(email));
    }

    // ============================================================
    // VIEW APPLICATION BY ID
    //
    // TENANT
    // PROPERTY_OWNER
    // PROPERTY_MANAGER
    // SUPER_ADMIN
    // ============================================================

    @GetMapping("/{applicationId}")
    @PreAuthorize("""
            hasAnyRole(
                'TENANT',
                'PROPERTY_OWNER',
                'PROPERTY_MANAGER',
                'SUPER_ADMIN'
            )
            """)
    public ResponseEntity<RentalApplicationResponse>
    getApplicationById(
            @PathVariable Long applicationId) {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getApplicationById(applicationId));
    }

    // ============================================================
    // VIEW APPLICATIONS FOR A UNIT
    //
    // PROPERTY_OWNER
    // PROPERTY_MANAGER
    // SUPER_ADMIN
    // ============================================================

    @GetMapping("/unit/{unitId}")
    @PreAuthorize("""
            hasAnyRole(
                'PROPERTY_OWNER',
                'PROPERTY_MANAGER',
                'SUPER_ADMIN'
            )
            """)
    public ResponseEntity<List<RentalApplicationResponse>>
    getApplicationsForUnit(
            @PathVariable Long unitId) {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getApplicationsForUnit(unitId));
    }

    // ============================================================
    // SUPER ADMIN - VIEW ALL APPLICATIONS
    // ============================================================

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<RentalApplicationResponse>>
    getAllApplications() {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getAllApplications());
    }

    // ============================================================
    // PROPERTY OWNER / PROPERTY MANAGER - REVIEW APPLICATION
    //
    // APPROVED
    // REJECTED
    // ============================================================

    @PutMapping("/{applicationId}/review")
    @PreAuthorize("""
            hasAnyRole(
                'PROPERTY_OWNER',
                'PROPERTY_MANAGER'
            )
            """)
    public ResponseEntity<RentalApplicationResponse>
    reviewApplication(
            @PathVariable Long applicationId,
            Authentication authentication,
            @Valid @RequestBody
            RentalApplicationReviewRequest request) {

        String email = authentication.getName();

        RentalApplicationResponse response =
                rentalApplicationService.reviewApplication(
                        applicationId,
                        email,
                        request);

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // TENANT - WITHDRAW APPLICATION
    // ============================================================

    @PutMapping("/{applicationId}/withdraw")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        String email = authentication.getName();

        rentalApplicationService.withdrawApplication(
                applicationId,
                email);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // VIEW ALL APPLICATIONS FOR A PROPERTY
    //
    // PROPERTY_OWNER
    // PROPERTY_MANAGER
    // SUPER_ADMIN
    //
    // Example:
    // GET /api/rental-applications/property/9
    // ============================================================

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("""
            hasAnyRole(
                'PROPERTY_OWNER',
                'PROPERTY_MANAGER',
                'SUPER_ADMIN'
            )
            """)
    public ResponseEntity<List<RentalApplicationResponse>>
    getApplicationsForProperty(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                rentalApplicationService
                        .getApplicationsForProperty(propertyId));
    }
}
