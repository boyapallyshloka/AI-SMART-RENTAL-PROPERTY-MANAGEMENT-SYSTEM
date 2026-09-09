package com.rental.rental_management_backend.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.rental.rental_management_backend.ai.dto.RentPredictionRequest;
import com.rental.rental_management_backend.ai.dto.RentPredictionResponse;

@Component
public class RentPredictionClient {

    private final RestClient restClient;

    public RentPredictionClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.ml.base-url}") String baseUrl) {

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .build();
    }

    public RentPredictionResponse predictRent(
            RentPredictionRequest request) {

        return restClient.post()
                .uri("/predict/rent")
                .body(request)
                .retrieve()
                .body(RentPredictionResponse.class);
    }
}