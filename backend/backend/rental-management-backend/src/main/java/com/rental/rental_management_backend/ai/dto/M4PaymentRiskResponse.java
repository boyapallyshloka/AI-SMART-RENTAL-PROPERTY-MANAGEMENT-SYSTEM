package com.rental.rental_management_backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class M4PaymentRiskResponse {

    private Boolean success;

    private String module;

    @JsonProperty("risk_label")
    private Integer riskLabel;

    @JsonProperty("risk_probability")
    private Double riskProbability;

    @JsonProperty("risk_status")
    private String riskStatus;

    private String model;

    @JsonProperty("model_version")
    private String modelVersion;

    public M4PaymentRiskResponse() {
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public Integer getRiskLabel() {
        return riskLabel;
    }

    public void setRiskLabel(Integer riskLabel) {
        this.riskLabel = riskLabel;
    }

    public Double getRiskProbability() {
        return riskProbability;
    }

    public void setRiskProbability(Double riskProbability) {
        this.riskProbability = riskProbability;
    }

    public String getRiskStatus() {
        return riskStatus;
    }

    public void setRiskStatus(String riskStatus) {
        this.riskStatus = riskStatus;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}