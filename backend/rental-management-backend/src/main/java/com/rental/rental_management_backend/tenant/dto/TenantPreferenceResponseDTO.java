package com.rental.rental_management_backend.tenant.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.rental.rental_management_backend.property.enums.FurnishingStatus;

public class TenantPreferenceResponseDTO {

    private Long preferenceId;

    private String preferredCity;

    private Integer maxBudget;

    private Integer minBedrooms;

    private FurnishingStatus furnishingPreference;

    private Boolean parkingRequired;

    private List<AmenityResponseDTO> preferredAmenities = new ArrayList<>();

    private Double preferredLatitude;

    private Double preferredLongitude;

    private Double maxDistanceKm;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public TenantPreferenceResponseDTO() {
    }

    public Long getPreferenceId() {
        return preferenceId;
    }

    public void setPreferenceId(Long preferenceId) {
        this.preferenceId = preferenceId;
    }

    public String getPreferredCity() {
        return preferredCity;
    }

    public void setPreferredCity(String preferredCity) {
        this.preferredCity = preferredCity;
    }

    public Integer getMaxBudget() {
        return maxBudget;
    }

    public void setMaxBudget(Integer maxBudget) {
        this.maxBudget = maxBudget;
    }

    public Integer getMinBedrooms() {
        return minBedrooms;
    }

    public void setMinBedrooms(Integer minBedrooms) {
        this.minBedrooms = minBedrooms;
    }

    public FurnishingStatus getFurnishingPreference() {
        return furnishingPreference;
    }

    public void setFurnishingPreference(
            FurnishingStatus furnishingPreference) {

        this.furnishingPreference = furnishingPreference;
    }

    public Boolean getParkingRequired() {
        return parkingRequired;
    }

    public void setParkingRequired(Boolean parkingRequired) {
        this.parkingRequired = parkingRequired;
    }

    public List<AmenityResponseDTO> getPreferredAmenities() {
        return preferredAmenities;
    }

    public void setPreferredAmenities(
            List<AmenityResponseDTO> preferredAmenities) {

        this.preferredAmenities = preferredAmenities;
    }

    public Double getPreferredLatitude() {
        return preferredLatitude;
    }

    public void setPreferredLatitude(Double preferredLatitude) {
        this.preferredLatitude = preferredLatitude;
    }

    public Double getPreferredLongitude() {
        return preferredLongitude;
    }

    public void setPreferredLongitude(Double preferredLongitude) {
        this.preferredLongitude = preferredLongitude;
    }

    public Double getMaxDistanceKm() {
        return maxDistanceKm;
    }

    public void setMaxDistanceKm(Double maxDistanceKm) {
        this.maxDistanceKm = maxDistanceKm;
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