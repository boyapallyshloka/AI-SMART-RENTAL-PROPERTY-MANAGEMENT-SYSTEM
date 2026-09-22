package com.rental.rental_management_backend.maintenance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class M5PredictionResponse {

    @JsonProperty("next_month_maintenance_cost")
    private Double nextMonthMaintenanceCost;

    @JsonProperty("next_month_maintenance_count")
    private Double nextMonthMaintenanceCount;

    @JsonProperty("maintenance_risk")
    private MaintenanceRisk maintenanceRisk;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceRisk {

        private Integer prediction;

        private Double probability;

        @JsonProperty("risk_level")
        private String riskLevel;
    }
}