package com.rental.rental_management_backend.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.manager.dto.PropertyManagerProfileResponse;
import com.rental.rental_management_backend.manager.dto.PropertyManagerProfileUpdateRequest;
import com.rental.rental_management_backend.manager.service.PropertyManagerProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/manager-profile")
@Validated
public class PropertyManagerProfileController {

    private final PropertyManagerProfileService profileService;

    public PropertyManagerProfileController(
            PropertyManagerProfileService profileService) {

        this.profileService = profileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyManagerProfileResponse> getMyProfile(
            Authentication authentication) {

        return ResponseEntity.ok(
                profileService.getMyProfile(authentication.getName())
        );
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyManagerProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody PropertyManagerProfileUpdateRequest request) {

        return ResponseEntity.ok(
                profileService.updateMyProfile(
                        authentication.getName(),
                        request
                )
        );
    }
}