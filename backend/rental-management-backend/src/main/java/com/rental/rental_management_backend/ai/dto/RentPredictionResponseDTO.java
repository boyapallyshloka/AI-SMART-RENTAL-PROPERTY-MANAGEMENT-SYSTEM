package com.rental.rental_management_backend.ai.dto;

import java.math.BigDecimal;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentPredictionResponseDTO {

    private Long propertyId;

    private Long unitId;

    private String propertyName;

    private BigDecimal currentMonthlyRent;

    private BigDecimal predictedRent;

    private Map<String, Object> modelResponse;

	public Long getPropertyId() {
		return propertyId;
	}

	public void setPropertyId(Long propertyId) {
		this.propertyId = propertyId;
	}

	public Long getUnitId() {
		return unitId;
	}

	public void setUnitId(Long unitId) {
		this.unitId = unitId;
	}

	public String getPropertyName() {
		return propertyName;
	}

	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}

	public BigDecimal getCurrentMonthlyRent() {
		return currentMonthlyRent;
	}

	public void setCurrentMonthlyRent(BigDecimal currentMonthlyRent) {
		this.currentMonthlyRent = currentMonthlyRent;
	}

	public BigDecimal getPredictedRent() {
		return predictedRent;
	}

	public void setPredictedRent(BigDecimal predictedRent) {
		this.predictedRent = predictedRent;
	}

	public Map<String, Object> getModelResponse() {
		return modelResponse;
	}

	public void setModelResponse(Map<String, Object> modelResponse) {
		this.modelResponse = modelResponse;
	}
    
}
