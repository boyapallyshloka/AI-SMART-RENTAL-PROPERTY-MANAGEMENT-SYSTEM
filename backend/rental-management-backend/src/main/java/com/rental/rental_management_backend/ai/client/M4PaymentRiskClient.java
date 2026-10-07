package com.rental.rental_management_backend.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rental.rental_management_backend.ai.dto.M4PaymentRiskRequest;
import com.rental.rental_management_backend.ai.dto.M4PaymentRiskResponse;
import com.rental.rental_management_backend.ai.exception.M4PaymentRiskException;

@Component
public class M4PaymentRiskClient {

    private final RestClient restClient;

    private final String paymentRiskUrl;

    private final ObjectMapper objectMapper;

    public M4PaymentRiskClient(

            RestClient.Builder restClientBuilder,

            @Value("${ai.service.payment-risk-url}")

            String paymentRiskUrl,

            ObjectMapper objectMapper) {

        this.restClient =
                restClientBuilder.build();

        this.paymentRiskUrl =
                paymentRiskUrl;

        this.objectMapper =
                objectMapper;
    }

    public M4PaymentRiskResponse predictPaymentRisk(

            M4PaymentRiskRequest request) {

        try {

            return restClient

                    .post()

                    .uri(
                            paymentRiskUrl
                                    + "/m4/predict-payment-risk")

                    .contentType(
                            MediaType.APPLICATION_JSON)

                    .body(request)

                    .retrieve()

                    .body(M4PaymentRiskResponse.class);

        } catch (RestClientException ex) {

            /*
             * TEMPORARY DEBUGGING:
             *
             * Print the actual exception in the STS console.
             * The previous code was hiding the original cause
             * and returning only AI_SERVICE_UNAVAILABLE.
             */
            ex.printStackTrace();

            String responseBody = null;

            if (ex instanceof org.springframework.web.client.RestClientResponseException responseException) {

                responseBody =
                        responseException.getResponseBodyAsString();

                System.out.println(
                        "========== M4 AI ERROR ==========");

                System.out.println(
                        "M4 HTTP STATUS: "
                                + responseException.getStatusCode());

                System.out.println(
                        "M4 RESPONSE BODY: "
                                + responseBody);

                System.out.println(
                        "=================================");
            }

            if (responseBody != null
                    && !responseBody.isBlank()) {

                try {

                    JsonNode errorResponse =
                            objectMapper.readTree(
                                    responseBody);

                    String errorCode =
                            errorResponse
                                    .path("errorCode")
                                    .asText(null);

                    String message =
                            errorResponse
                                    .path("message")
                                    .asText(null);

                    if (errorCode != null
                            && !errorCode.isBlank()) {

                        throw new M4PaymentRiskException(
                                errorCode,
                                message != null
                                        ? message
                                        : "M4 payment-risk service returned an error");
                    }

                } catch (M4PaymentRiskException e) {

                    throw e;

                } catch (Exception ignored) {

                    /*
                     * AI service returned an error response
                     * that could not be parsed.
                     *
                     * Do not expose the raw response.
                     */
                }
            }

            /*
             * Covers:
             *
             * - AI service unavailable
             * - connection refused
             * - timeout
             * - unexpected HTTP/client communication error
             */
            throw new M4PaymentRiskException(
                    "AI_SERVICE_UNAVAILABLE",
                    "Payment-risk AI service is currently unavailable");
        }
    }
}
