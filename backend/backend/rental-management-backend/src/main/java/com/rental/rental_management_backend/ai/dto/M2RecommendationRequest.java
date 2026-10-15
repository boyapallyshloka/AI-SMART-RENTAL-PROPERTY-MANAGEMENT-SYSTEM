package com.rental.rental_management_backend.ai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class M2RecommendationRequest {

    @NotBlank(message = "tenantId is required")
    private String tenantId;

    @NotNull(message = "topN is required")
    @Min(value = 1, message = "topN must be greater than 0")
    private Integer topN;

    private Double currentLatitude;

    private Double currentLongitude;

    private String currentAddress;

    public M2RecommendationRequest() {
    }

    public M2RecommendationRequest(
            String tenantId,
            Integer topN,
            Double currentLatitude,
            Double currentLongitude,
            String currentAddress) {

        this.tenantId = tenantId;
        this.topN = topN;
        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;
        this.currentAddress = currentAddress;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Integer getTopN() {
        return topN;
    }

    public void setTopN(Integer topN) {
        this.topN = topN;
    }

    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public String getCurrentAddress() {
        return currentAddress;
    }

    public void setCurrentAddress(String currentAddress) {
        this.currentAddress = currentAddress;
    }
}