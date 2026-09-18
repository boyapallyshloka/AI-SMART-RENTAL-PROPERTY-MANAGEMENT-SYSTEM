package com.rental.rental_management_backend.ai.client;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.rental.rental_management_backend.ai.dto.RentPredictionRequestDTO;

@Component
public class FastApiRentPredictionClient {

    private final RestClient restClient;

    private final String predictionUrl;

    public FastApiRentPredictionClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.fastapi.rent-prediction-url}") String predictionUrl) {

        this.restClient = restClientBuilder.build();
        this.predictionUrl = predictionUrl;
    }

    public Map<String, Object> predictRent(
            RentPredictionRequestDTO request) {

        try {

            Map<String, Object> response = restClient
                    .post()
                    .uri(predictionUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {

                throw new RuntimeException(
                        "FastAPI rent prediction service returned an empty response");
            }

            return response;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to communicate with FastAPI rent prediction service: "
                            + e.getMessage(),
                    e);
        }
    }
}