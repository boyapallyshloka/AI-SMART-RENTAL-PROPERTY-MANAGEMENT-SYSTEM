package com.rental.rental_management_backend.property.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.service.PropertyDetailsService;
import com.rental.rental_management_backend.property.service.PropertyService;

@RestController
@RequestMapping("/api/properties")
public class PropertyPublicController {

    private final PropertyService propertyService;

    private final PropertyDetailsService propertyDetailsService;

    public PropertyPublicController(
            PropertyService propertyService,
            PropertyDetailsService propertyDetailsService) {

        this.propertyService = propertyService;
        this.propertyDetailsService = propertyDetailsService;
    }

    /**
     * GET AVAILABLE PROPERTIES
     *
     * Used by tenants to browse properties
     * that are currently available for rental.
     */
    @GetMapping("/public")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<PropertyResponse>> getAvailableProperties() {

        return ResponseEntity.ok(
                propertyService.getAvailableProperties()
        );
    }

    /**
     * GET ONE AVAILABLE PROPERTY DETAILS
     *
     * Used by tenants to view complete details
     * of one available property.
     */
    @GetMapping("/public/{propertyId}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<PropertyDetailsResponse> getPublicPropertyDetails(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyDetailsService.getPublicPropertyDetails(propertyId)
        );
    }
}
