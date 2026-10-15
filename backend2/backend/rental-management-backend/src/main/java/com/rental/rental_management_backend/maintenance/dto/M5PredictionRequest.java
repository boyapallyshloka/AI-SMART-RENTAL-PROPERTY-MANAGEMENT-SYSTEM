package com.rental.rental_management_backend.maintenance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class M5PredictionRequest {

    @JsonProperty("property_age_years")
    private Double propertyAgeYears;

    @JsonProperty("size_sqft")
    private Double sizeSqft;

    @JsonProperty("bedrooms_bhk")
    private Integer bedroomsBhk;

    @JsonProperty("amenity_count")
    private Integer amenityCount;

    @JsonProperty("historical_maintenance_count")
    private Integer historicalMaintenanceCount;

    @JsonProperty("maintenance_count_last_90d")
    private Integer maintenanceCountLast90d;

    @JsonProperty("historical_maintenance_cost")
    private Double historicalMaintenanceCost;

    @JsonProperty("historical_avg_cost")
    private Double historicalAvgCost;

    @JsonProperty("days_since_last_maintenance")
    private Integer daysSinceLastMaintenance;

    @JsonProperty("dominant_issue_category")
    private String dominantIssueCategory;

    @JsonProperty("inspection_count")
    private Integer inspectionCount;

    @JsonProperty("needs_attention_count")
    private Integer needsAttentionCount;

    @JsonProperty("equipment_count")
    private Integer equipmentCount;

    @JsonProperty("avg_equipment_age_years")
    private Double avgEquipmentAgeYears;

    @JsonProperty("critical_equipment_count")
    private Integer criticalEquipmentCount;

    @JsonProperty("snapshot_month")
    private String snapshotMonth;

    public M5PredictionRequest() {
    }

    public M5PredictionRequest(
            Double propertyAgeYears,
            Double sizeSqft,
            Integer bedroomsBhk,
            Integer amenityCount,
            Integer historicalMaintenanceCount,
            Integer maintenanceCountLast90d,
            Double historicalMaintenanceCost,
            Double historicalAvgCost,
            Integer daysSinceLastMaintenance,
            String dominantIssueCategory,
            Integer inspectionCount,
            Integer needsAttentionCount,
            Integer equipmentCount,
            Double avgEquipmentAgeYears,
            Integer criticalEquipmentCount,
            String snapshotMonth) {
        this.propertyAgeYears = propertyAgeYears;
        this.sizeSqft = sizeSqft;
        this.bedroomsBhk = bedroomsBhk;
        this.amenityCount = amenityCount;
        this.historicalMaintenanceCount = historicalMaintenanceCount;
        this.maintenanceCountLast90d = maintenanceCountLast90d;
        this.historicalMaintenanceCost = historicalMaintenanceCost;
        this.historicalAvgCost = historicalAvgCost;
        this.daysSinceLastMaintenance = daysSinceLastMaintenance;
        this.dominantIssueCategory = dominantIssueCategory;
        this.inspectionCount = inspectionCount;
        this.needsAttentionCount = needsAttentionCount;
        this.equipmentCount = equipmentCount;
        this.avgEquipmentAgeYears = avgEquipmentAgeYears;
        this.criticalEquipmentCount = criticalEquipmentCount;
        this.snapshotMonth = snapshotMonth;
    }

    public Double getPropertyAgeYears() { return propertyAgeYears; }
    public void setPropertyAgeYears(Double propertyAgeYears) { this.propertyAgeYears = propertyAgeYears; }

    public Double getSizeSqft() { return sizeSqft; }
    public void setSizeSqft(Double sizeSqft) { this.sizeSqft = sizeSqft; }

    public Integer getBedroomsBhk() { return bedroomsBhk; }
    public void setBedroomsBhk(Integer bedroomsBhk) { this.bedroomsBhk = bedroomsBhk; }

    public Integer getAmenityCount() { return amenityCount; }
    public void setAmenityCount(Integer amenityCount) { this.amenityCount = amenityCount; }

    public Integer getHistoricalMaintenanceCount() { return historicalMaintenanceCount; }
    public void setHistoricalMaintenanceCount(Integer historicalMaintenanceCount) { this.historicalMaintenanceCount = historicalMaintenanceCount; }

    public Integer getMaintenanceCountLast90d() { return maintenanceCountLast90d; }
    public void setMaintenanceCountLast90d(Integer maintenanceCountLast90d) { this.maintenanceCountLast90d = maintenanceCountLast90d; }

    public Double getHistoricalMaintenanceCost() { return historicalMaintenanceCost; }
    public void setHistoricalMaintenanceCost(Double historicalMaintenanceCost) { this.historicalMaintenanceCost = historicalMaintenanceCost; }

    public Double getHistoricalAvgCost() { return historicalAvgCost; }
    public void setHistoricalAvgCost(Double historicalAvgCost) { this.historicalAvgCost = historicalAvgCost; }

    public Integer getDaysSinceLastMaintenance() { return daysSinceLastMaintenance; }
    public void setDaysSinceLastMaintenance(Integer daysSinceLastMaintenance) { this.daysSinceLastMaintenance = daysSinceLastMaintenance; }

    public String getDominantIssueCategory() { return dominantIssueCategory; }
    public void setDominantIssueCategory(String dominantIssueCategory) { this.dominantIssueCategory = dominantIssueCategory; }

    public Integer getInspectionCount() { return inspectionCount; }
    public void setInspectionCount(Integer inspectionCount) { this.inspectionCount = inspectionCount; }

    public Integer getNeedsAttentionCount() { return needsAttentionCount; }
    public void setNeedsAttentionCount(Integer needsAttentionCount) { this.needsAttentionCount = needsAttentionCount; }

    public Integer getEquipmentCount() { return equipmentCount; }
    public void setEquipmentCount(Integer equipmentCount) { this.equipmentCount = equipmentCount; }

    public Double getAvgEquipmentAgeYears() { return avgEquipmentAgeYears; }
    public void setAvgEquipmentAgeYears(Double avgEquipmentAgeYears) { this.avgEquipmentAgeYears = avgEquipmentAgeYears; }

    public Integer getCriticalEquipmentCount() { return criticalEquipmentCount; }
    public void setCriticalEquipmentCount(Integer criticalEquipmentCount) { this.criticalEquipmentCount = criticalEquipmentCount; }

    public String getSnapshotMonth() { return snapshotMonth; }
    public void setSnapshotMonth(String snapshotMonth) { this.snapshotMonth = snapshotMonth; }
}