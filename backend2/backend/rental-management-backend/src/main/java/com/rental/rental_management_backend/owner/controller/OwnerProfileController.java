package com.rental.rental_management_backend.owner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.owner.dto.OwnerProfileResponse;
import com.rental.rental_management_backend.owner.dto.OwnerProfileUpdateRequest;
import com.rental.rental_management_backend.owner.service.OwnerProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner-profile")
@Validated
public class OwnerProfileController {

    private final OwnerProfileService ownerProfileService;

    public OwnerProfileController(
            OwnerProfileService ownerProfileService) {

        this.ownerProfileService = ownerProfileService;
    }

    // =========================================================
    // GET MY OWNER PROFILE
    // PROPERTY OWNER
    // =========================================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<OwnerProfileResponse> getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                ownerProfileService.getMyProfile(email)
        );
    }

    // =========================================================
    // UPDATE MY OWNER PROFILE
    // PROPERTY OWNER
    // =========================================================

    @PutMapping("/me")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<OwnerProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody OwnerProfileUpdateRequest request) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                ownerProfileService.updateMyProfile(
                        email,
                        request
                )
        );
    }
}