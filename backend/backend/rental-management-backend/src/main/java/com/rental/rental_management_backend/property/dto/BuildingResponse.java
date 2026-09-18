package com.rental.rental_management_backend.property.dto;

import java.time.LocalDateTime;

public class BuildingResponse {

    private Long buildingId;

    private String buildingName;

    private String description;

    private Integer totalFloors;

    private Long propertyId;

    private String propertyName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public BuildingResponse() {
    }

    public BuildingResponse(
            Long buildingId,
            String buildingName,
            String description,
            Integer totalFloors,
            Long propertyId,
            String propertyName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.buildingId = buildingId;
        this.buildingName = buildingName;
        this.description = description;
        this.totalFloors = totalFloors;
        this.propertyId = propertyId;
        this.propertyName = propertyName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public String getBuildingName() {
        return buildingName;
    }

    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalFloors() {
        return totalFloors;
    }

    public void setTotalFloors(Integer totalFloors) {
        this.totalFloors = totalFloors;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}