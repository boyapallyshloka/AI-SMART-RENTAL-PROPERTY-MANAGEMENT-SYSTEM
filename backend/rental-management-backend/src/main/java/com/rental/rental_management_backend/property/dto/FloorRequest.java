package com.rental.rental_management_backend.property.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class FloorRequest {

    @NotBlank(message = "Floor name is required")
    private String floorName;

    @NotNull(message = "Floor number is required")
    @PositiveOrZero(message = "Floor number cannot be negative")
    private Integer floorNumber;

    @NotNull(message = "Building ID is required")
    private Long buildingId;

    public FloorRequest() {
    }

    public FloorRequest(
            String floorName,
            Integer floorNumber,
            Long buildingId) {

        this.floorName = floorName;
        this.floorNumber = floorNumber;
        this.buildingId = buildingId;
    }

    public String getFloorName() {
        return floorName;
    }

    public void setFloorName(String floorName) {
        this.floorName = floorName;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }
}