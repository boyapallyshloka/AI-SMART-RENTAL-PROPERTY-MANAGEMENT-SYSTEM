package com.rental.rental_management_backend.maintenance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.rental.rental_management_backend.maintenance.dto.M5PredictionRequest;
import com.rental.rental_management_backend.maintenance.dto.M5PredictionResponse;

@Service
public class MaintenanceAiServiceClient {

    private final RestClient restClient;

    public MaintenanceAiServiceClient(@Value("${ai.service.maintenance-prediction-url:http://127.0.0.1:8000}") String aiUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(aiUrl)
                .build();
    }

    public M5PredictionResponse callPrediction(M5PredictionRequest payload) {
        return restClient.post()
                .uri("/m5/predict-maintenance")
                .body(payload)
                .retrieve()
                .body(M5PredictionResponse.class);
    }

    // Convenient alias method
    public M5PredictionResponse predictMaintenance(M5PredictionRequest payload) {
        return callPrediction(payload);
    }
}