package com.rental.rental_management_backend.ai.dto;

import java.math.BigDecimal;

public class RentPredictionResponse {

    private BigDecimal predictedRent;
    private Double confidenceScore;
    private String modelVersion;

    public RentPredictionResponse() {
    }

    public BigDecimal getPredictedRent() {
        return predictedRent;
    }

    public void setPredictedRent(BigDecimal predictedRent) {
        this.predictedRent = predictedRent;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}
