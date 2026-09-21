package com.rental.rental_management_backend.property.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.property.dto.PropertyManagerResponse;
import com.rental.rental_management_backend.property.service.PropertyManagerService;

@RestController
@RequestMapping("/api/owner/managers")
@PreAuthorize("hasRole('PROPERTY_OWNER')")
public class OwnerManagerController {

    private final PropertyManagerService propertyManagerService;

    public OwnerManagerController(PropertyManagerService propertyManagerService) {
        this.propertyManagerService = propertyManagerService;
    }

    /*
     * GET ELIGIBLE PROPERTY MANAGERS
     *
     * Retrieves all active Property Manager profiles
     * eligible for assignment by a property owner.
     */
    @GetMapping("/eligible")
    public ResponseEntity<List<PropertyManagerResponse>> getEligiblePropertyManagers() {
        return ResponseEntity.ok(
                propertyManagerService.getEligibleManagers()
        );
    }
}
