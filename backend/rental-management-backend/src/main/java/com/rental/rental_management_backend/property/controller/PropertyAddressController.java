package com.rental.rental_management_backend.property.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.property.dto.PropertyAddressRequest;
import com.rental.rental_management_backend.property.dto.PropertyAddressResponse;
import com.rental.rental_management_backend.property.service.PropertyAddressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner/properties")
@PreAuthorize("hasRole('PROPERTY_OWNER')")
public class PropertyAddressController {

    private final PropertyAddressService propertyAddressService;

    public PropertyAddressController(
            PropertyAddressService propertyAddressService) {

        this.propertyAddressService =
                propertyAddressService;
    }

    @PostMapping("/{propertyId}/address")
    public ResponseEntity<PropertyAddressResponse> createAddress(
            @PathVariable Long propertyId,
            @Valid @RequestBody PropertyAddressRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        propertyAddressService.createAddress(
                                propertyId,
                                request
                        )
                );
    }

    @GetMapping("/{propertyId}/address")
    public ResponseEntity<PropertyAddressResponse> getAddress(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyAddressService
                        .getAddressByPropertyId(propertyId)
        );
    }

    @PutMapping("/{propertyId}/address")
    public ResponseEntity<PropertyAddressResponse> updateAddress(
            @PathVariable Long propertyId,
            @Valid @RequestBody PropertyAddressRequest request) {

        return ResponseEntity.ok(
                propertyAddressService.updateAddress(
                        propertyId,
                        request
                )
        );
    }

    @DeleteMapping("/{propertyId}/address")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Long propertyId) {

        propertyAddressService.deleteAddress(propertyId);

        return ResponseEntity.ok(
                "Property address deleted successfully"
        );
    }
}