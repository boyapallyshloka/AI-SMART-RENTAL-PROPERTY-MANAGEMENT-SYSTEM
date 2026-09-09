package com.rental.rental_management_backend.ai.service;

import com.rental.rental_management_backend.ai.dto.RentPredictionResponse;

public interface RentPredictionService {

    RentPredictionResponse predictRent(Long unitId);
}