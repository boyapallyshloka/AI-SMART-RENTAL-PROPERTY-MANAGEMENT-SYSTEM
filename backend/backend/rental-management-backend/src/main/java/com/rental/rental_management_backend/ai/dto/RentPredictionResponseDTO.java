package com.rental.rental_management_backend.ai.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentPredictionResponseDTO {

    private BigDecimal predictedRent;

    public BigDecimal getPredictedRent() {
        return predictedRent;
    }

    public void setPredictedRent(BigDecimal predictedRent) {
        this.predictedRent = predictedRent;
    }
}