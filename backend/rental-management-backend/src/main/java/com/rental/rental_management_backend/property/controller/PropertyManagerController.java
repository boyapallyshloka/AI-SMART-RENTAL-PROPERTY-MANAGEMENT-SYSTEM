
package com.rental.rental_management_backend.property.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;
import com.rental.rental_management_backend.property.dto.PropertyManagerResponse;
import com.rental.rental_management_backend.property.dto.PropertyRequest;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.service.PropertyManagerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/property-manager")
public class PropertyManagerController {

    private final PropertyManagerService propertyManagerService;

    public PropertyManagerController(
            PropertyManagerService propertyManagerService) {

        this.propertyManagerService = propertyManagerService;
    }

    // ==========================================
    // GET MY PROPERTY MANAGER PROFILE
    // ==========================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyManagerResponse> getMyProfile() {

        return ResponseEntity.ok(
                propertyManagerService.getMyProfile());
    }

    // ==========================================
    // GET PROPERTY MANAGER BY ID
    // ==========================================

    @GetMapping("/{propertyManagerId}")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyManagerResponse> getPropertyManagerById(
            @PathVariable Long propertyManagerId) {

        return ResponseEntity.ok(
                propertyManagerService
                        .getPropertyManagerById(propertyManagerId));
    }

    // ==========================================
    // GET MY ASSIGNED PROPERTIES
    // ==========================================

    @GetMapping("/properties")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<List<PropertyResponse>> getMyAssignedProperties() {

        return ResponseEntity.ok(
                propertyManagerService
                        .getMyAssignedProperties());
    }

    // ==========================================
    // GET ONE ASSIGNED PROPERTY
    // ==========================================

    @GetMapping("/properties/{propertyId}")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyResponse> getMyAssignedPropertyById(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyManagerService
                        .getMyAssignedPropertyById(propertyId));
    }
    @GetMapping("/properties/{propertyId}/details")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyDetailsResponse> getMyAssignedPropertyDetails(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyManagerService.getMyAssignedPropertyDetails(propertyId));
    }

    // ==========================================
    // UPDATE ASSIGNED PROPERTY
    // ==========================================

    @PutMapping("/properties/{propertyId}")
    @PreAuthorize("hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<PropertyResponse> updateAssignedProperty(
            @PathVariable Long propertyId,
            @Valid @RequestBody PropertyRequest request) {

        return ResponseEntity.ok(
                propertyManagerService.updateAssignedProperty(propertyId, request)
        );
    }
}
