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

import com.rental.rental_management_backend.property.dto.UnitRequest;
import com.rental.rental_management_backend.property.dto.UnitResponse;
import com.rental.rental_management_backend.property.service.UnitService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/units")
@PreAuthorize("hasRole('PROPERTY_OWNER')")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @PostMapping
    public ResponseEntity<UnitResponse> createUnit(
            @Valid @RequestBody UnitRequest request) {

        UnitResponse response =
                unitService.createUnit(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/floor/{floorId}")
    public ResponseEntity<List<UnitResponse>> getUnitsByFloor(
            @PathVariable Long floorId) {

        return ResponseEntity.ok(
                unitService.getUnitsByFloor(floorId)
        );
    }

    @GetMapping("/{unitId}")
    public ResponseEntity<UnitResponse> getUnitById(
            @PathVariable Long unitId) {

        return ResponseEntity.ok(
                unitService.getUnitById(unitId)
        );
    }

    @PutMapping("/{unitId}")
    public ResponseEntity<UnitResponse> updateUnit(
            @PathVariable Long unitId,
            @Valid @RequestBody UnitRequest request) {

        return ResponseEntity.ok(
                unitService.updateUnit(
                        unitId,
                        request)
        );
    }

    @DeleteMapping("/{unitId}")
    public ResponseEntity<Void> deleteUnit(
            @PathVariable Long unitId) {

        unitService.deleteUnit(unitId);

        return ResponseEntity
                .noContent()
                .build();
    }
}