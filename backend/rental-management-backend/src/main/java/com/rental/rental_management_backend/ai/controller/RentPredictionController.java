package com.rental.rental_management_backend.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.ai.dto.RentPredictionResponse;
import com.rental.rental_management_backend.ai.service.RentPredictionService;

@RestController
@RequestMapping("/api/ai")
public class RentPredictionController {

    private final RentPredictionService rentPredictionService;

    public RentPredictionController(
            RentPredictionService rentPredictionService) {

        this.rentPredictionService = rentPredictionService;
    }

    @PostMapping("/rent-prediction/{unitId}")
    public ResponseEntity<RentPredictionResponse> predictRent(
            @PathVariable Long unitId) {

        return ResponseEntity.ok(
                rentPredictionService.predictRent(unitId)
        );
    }
}