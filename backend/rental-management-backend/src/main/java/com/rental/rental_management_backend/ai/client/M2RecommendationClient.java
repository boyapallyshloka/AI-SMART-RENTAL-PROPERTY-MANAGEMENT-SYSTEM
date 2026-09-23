package com.rental.rental_management_backend.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.rental.rental_management_backend.ai.dto.M2RecommendationRequest;
import com.rental.rental_management_backend.ai.dto.M2RecommendationResponse;

@Component
public class M2RecommendationClient {

    @Value("${ai.ml.base-url}")
    private String aiMlBaseUrl;

    private final RestTemplate restTemplate;

    public M2RecommendationClient() {
        this.restTemplate = new RestTemplate();
    }

    public M2RecommendationResponse recommendProperties(
            M2RecommendationRequest request) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<M2RecommendationRequest> entity =
                new HttpEntity<>(request, headers);

        String m2Url = aiMlBaseUrl + "/m2/recommend-properties";

        try {

            ResponseEntity<M2RecommendationResponse> response =
                    restTemplate.exchange(
                            m2Url,
                            HttpMethod.POST,
                            entity,
                            M2RecommendationResponse.class
                    );

            return response.getBody();

        } catch (HttpStatusCodeException ex) {

            throw new RuntimeException(
                    "M2 recommendation service error: "
                            + ex.getResponseBodyAsString(),
                    ex
            );

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to connect to M2 recommendation service at "
                            + m2Url,
                    ex
            );
        }
    }
}
