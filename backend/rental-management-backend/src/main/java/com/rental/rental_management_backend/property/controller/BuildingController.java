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

import com.rental.rental_management_backend.property.dto.BuildingRequest;
import com.rental.rental_management_backend.property.dto.BuildingResponse;
import com.rental.rental_management_backend.property.service.BuildingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(
            BuildingService buildingService) {

        this.buildingService = buildingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<BuildingResponse> createBuilding(
            @Valid @RequestBody BuildingRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        buildingService.createBuilding(request)
                );
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<List<BuildingResponse>>
            getBuildingsByProperty(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                buildingService
                        .getBuildingsByProperty(propertyId)
        );
    }

    @GetMapping("/{buildingId}")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<BuildingResponse>
            getBuildingById(
                    @PathVariable Long buildingId) {

        return ResponseEntity.ok(
                buildingService
                        .getBuildingById(buildingId)
        );
    }

    @PutMapping("/{buildingId}")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<BuildingResponse>
            updateBuilding(
                    @PathVariable Long buildingId,
                    @Valid @RequestBody BuildingRequest request) {

        return ResponseEntity.ok(
                buildingService.updateBuilding(
                        buildingId,
                        request
                )
        );
    }

    @DeleteMapping("/{buildingId}")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<String>
            deleteBuilding(
                    @PathVariable Long buildingId) {

        buildingService.deleteBuilding(buildingId);

        return ResponseEntity.ok(
                "Building deleted successfully"
        );
    }
} 