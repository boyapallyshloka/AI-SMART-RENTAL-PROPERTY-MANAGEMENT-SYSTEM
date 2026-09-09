package com.rental.rental_management_backend.property.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class BuildingRequest {

    @NotBlank(message = "Building name is required")
    private String buildingName;

    private String description;

    @PositiveOrZero(message = "Total floors cannot be negative")
    private Integer totalFloors;

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    public BuildingRequest() {
    }

    public BuildingRequest(
            String buildingName,
            String description,
            Integer totalFloors,
            Long propertyId) {

        this.buildingName = buildingName;
        this.description = description;
        this.totalFloors = totalFloors;
        this.propertyId = propertyId;
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
}