package com.rental.rental_management_backend.ai.dto;



import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class M2RecommendationResponse {

    @JsonProperty("success")
    private Boolean success;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("recommendations")
    private List<M2RecommendationItem> recommendations;

    @JsonProperty("count")
    private Integer count;

    @JsonProperty("modelVersion")
    private String modelVersion;

    public M2RecommendationResponse() {
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public List<M2RecommendationItem> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<M2RecommendationItem> recommendations) {
        this.recommendations = recommendations;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}
