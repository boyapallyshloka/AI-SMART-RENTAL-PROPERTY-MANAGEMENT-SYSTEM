package com.rental.rental_management_backend.property.dto;

import java.time.LocalDateTime;

public class FloorResponse {

    private Long floorId;
    private String floorName;
    private Integer floorNumber;

    private Long buildingId;
    private String buildingName;

    private Long propertyId;
    private String propertyName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FloorResponse() {
    }

    public FloorResponse(
            Long floorId,
            String floorName,
            Integer floorNumber,
            Long buildingId,
            String buildingName,
            Long propertyId,
            String propertyName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.floorId = floorId;
        this.floorName = floorName;
        this.floorNumber = floorNumber;
        this.buildingId = buildingId;
        this.buildingName = buildingName;
        this.propertyId = propertyId;
        this.propertyName = propertyName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getFloorId() {
        return floorId;
    }

    public void setFloorId(Long floorId) {
        this.floorId = floorId;
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

    public String getBuildingName() {
        return buildingName;
    }

    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
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