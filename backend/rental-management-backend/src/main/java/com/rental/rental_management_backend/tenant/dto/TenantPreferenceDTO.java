package com.rental.rental_management_backend.tenant.dto;


import java.util.List;

import com.rental.rental_management_backend.property.enums.FurnishingStatus;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

public class TenantPreferenceDTO {

    private String preferredCity;

    @Min(value = 0, message = "Maximum budget cannot be negative")
    private Integer maxBudget;

    @Min(value = 0, message = "Minimum bedrooms cannot be negative")
    private Integer minBedrooms;

    private FurnishingStatus furnishingPreference;

    private Boolean parkingRequired;

    private List<Long> preferredAmenityIds;

    @DecimalMin(value = "-90.0", message = "Invalid latitude")
    @DecimalMax(value = "90.0", message = "Invalid latitude")
    private Double preferredLatitude;

    @DecimalMin(value = "-180.0", message = "Invalid longitude")
    @DecimalMax(value = "180.0", message = "Invalid longitude")
    private Double preferredLongitude;

    @DecimalMin(value = "0.0", message = "Maximum distance cannot be negative")
    private Double maxDistanceKm;

    public TenantPreferenceDTO() {
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

    public void setFurnishingPreference(FurnishingStatus furnishingPreference) {
        this.furnishingPreference = furnishingPreference;
    }

    public Boolean getParkingRequired() {
        return parkingRequired;
    }

    public void setParkingRequired(Boolean parkingRequired) {
        this.parkingRequired = parkingRequired;
    }

    public List<Long> getPreferredAmenityIds() {
        return preferredAmenityIds;
    }

    public void setPreferredAmenityIds(List<Long> preferredAmenityIds) {
        this.preferredAmenityIds = preferredAmenityIds;
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
}