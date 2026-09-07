package com.rental.rental_management_backend.property.controller;



import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.property.dto.AmenityRequest;
import com.rental.rental_management_backend.property.dto.AmenityResponse;
import com.rental.rental_management_backend.property.service.AmenityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/amenities")
@PreAuthorize("hasRole('PROPERTY_OWNER')")
public class AmenityController {

    private final AmenityService amenityService;

    public AmenityController(
            AmenityService amenityService) {

        this.amenityService = amenityService;
    }

    // =========================================================
    // CREATE AMENITY
    // =========================================================

    @PostMapping
    public ResponseEntity<AmenityResponse> createAmenity(
            @Valid @RequestBody AmenityRequest request) {

        AmenityResponse response =
                amenityService.createAmenity(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET ALL AMENITIES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AmenityResponse>>
            getAllAmenities() {

        return ResponseEntity.ok(
                amenityService.getAllAmenities());
    }

    // =========================================================
    // GET AMENITY BY ID
    // =========================================================

    @GetMapping("/{amenityId}")
    public ResponseEntity<AmenityResponse>
            getAmenityById(
                    @PathVariable Long amenityId) {

        return ResponseEntity.ok(
                amenityService
                        .getAmenityById(amenityId));
    }

    // =========================================================
    // UPDATE AMENITY
    // =========================================================

    @PutMapping("/{amenityId}")
    public ResponseEntity<AmenityResponse>
            updateAmenity(
                    @PathVariable Long amenityId,
                    @Valid @RequestBody
                    AmenityRequest request) {

        return ResponseEntity.ok(
                amenityService.updateAmenity(
                        amenityId,
                        request));
    }

    // =========================================================
    // DELETE AMENITY
    // =========================================================

    @DeleteMapping("/{amenityId}")
    public ResponseEntity<String> deleteAmenity(
            @PathVariable Long amenityId) {

        amenityService.deleteAmenity(amenityId);

        return ResponseEntity.ok(
                "Amenity deleted successfully");
    }

    // =========================================================
    // ADD AMENITY TO PROPERTY
    // =========================================================

    @PostMapping(
            "/property/{propertyId}/amenity/{amenityId}"
    )
    public ResponseEntity<AmenityResponse>
            addAmenityToProperty(
                    @PathVariable Long propertyId,
                    @PathVariable Long amenityId) {

        AmenityResponse response =
                amenityService.addAmenityToProperty(
                        propertyId,
                        amenityId);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET PROPERTY AMENITIES
    // =========================================================

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<AmenityResponse>>
            getPropertyAmenities(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                amenityService
                        .getPropertyAmenities(propertyId));
    }

    // =========================================================
    // REMOVE AMENITY FROM PROPERTY
    // =========================================================

    @DeleteMapping(
            "/property/{propertyId}/amenity/{amenityId}"
    )
    public ResponseEntity<String>
            removeAmenityFromProperty(
                    @PathVariable Long propertyId,
                    @PathVariable Long amenityId) {

        amenityService.removeAmenityFromProperty(
                propertyId,
                amenityId);

        return ResponseEntity.ok(
                "Amenity removed from property successfully");
    }
}