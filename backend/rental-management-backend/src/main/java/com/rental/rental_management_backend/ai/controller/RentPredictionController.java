package com.rental.rental_management_backend.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.ai.dto.RentPredictionResponseDTO;
import com.rental.rental_management_backend.ai.service.RentPredictionService;

@RestController
@RequestMapping("/api/ai/rent-prediction")
public class RentPredictionController {

    private final RentPredictionService rentPredictionService;

    public RentPredictionController(
            RentPredictionService rentPredictionService) {

        this.rentPredictionService = rentPredictionService;
    }

    @PostMapping("/unit/{unitId}")
    @PreAuthorize("hasRole('PROPERTY_OWNER')")
    public ResponseEntity<RentPredictionResponseDTO> predictRent(
            @PathVariable Long unitId) {

        RentPredictionResponseDTO response =
                rentPredictionService.predictRent(unitId);

        return ResponseEntity.ok(response);
    }
}