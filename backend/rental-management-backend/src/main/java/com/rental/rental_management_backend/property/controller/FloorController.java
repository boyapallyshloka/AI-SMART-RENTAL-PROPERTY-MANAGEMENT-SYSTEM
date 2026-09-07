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

import com.rental.rental_management_backend.property.dto.FloorRequest;
import com.rental.rental_management_backend.property.dto.FloorResponse;
import com.rental.rental_management_backend.property.service.FloorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/floors")
@PreAuthorize("hasRole('PROPERTY_OWNER')")
public class FloorController {

    private final FloorService floorService;

    public FloorController(FloorService floorService) {
        this.floorService = floorService;
    }

    @PostMapping
    public ResponseEntity<FloorResponse> createFloor(
            @Valid @RequestBody FloorRequest request) {

        FloorResponse response =
                floorService.createFloor(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/building/{buildingId}")
    public ResponseEntity<List<FloorResponse>> getFloorsByBuilding(
            @PathVariable Long buildingId) {

        return ResponseEntity.ok(
                floorService.getFloorsByBuilding(buildingId)
        );
    }

    @GetMapping("/{floorId}")
    public ResponseEntity<FloorResponse> getFloorById(
            @PathVariable Long floorId) {

        return ResponseEntity.ok(
                floorService.getFloorById(floorId)
        );
    }

    @PutMapping("/{floorId}")
    public ResponseEntity<FloorResponse> updateFloor(
            @PathVariable Long floorId,
            @Valid @RequestBody FloorRequest request) {

        return ResponseEntity.ok(
                floorService.updateFloor(
                        floorId,
                        request)
        );
    }

    @DeleteMapping("/{floorId}")
    public ResponseEntity<Void> deleteFloor(
            @PathVariable Long floorId) {

        floorService.deleteFloor(floorId);

        return ResponseEntity.noContent().build();
    }
}