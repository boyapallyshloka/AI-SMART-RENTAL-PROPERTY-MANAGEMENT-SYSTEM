package com.rental.rental_management_backend.property.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class BuildingRequest {

    @NotBlank(message = "Building name is required")
    private String buildingName;

    @PositiveOrZero(message = "Total floors cannot be negative")
    private Integer totalFloors;

    @PositiveOrZero(message = "Total units cannot be negative")
    private Integer totalUnits;

    private String description;

    @NotNull(message = "Property id is required")
    private Long propertyId;

    public BuildingRequest() {
    }

    public String getBuildingName() {
        return buildingName;
    }

    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
    }

    public Integer getTotalFloors() {
        return totalFloors;
    }

    public void setTotalFloors(Integer totalFloors) {
        this.totalFloors = totalFloors;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
}