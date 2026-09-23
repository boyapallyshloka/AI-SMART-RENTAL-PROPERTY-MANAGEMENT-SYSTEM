
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

    public M2RecommendationRequest() {
    }

    public M2RecommendationRequest(String tenantId, Integer topN) {
        this.tenantId = tenantId;
        this.topN = topN;
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
}
