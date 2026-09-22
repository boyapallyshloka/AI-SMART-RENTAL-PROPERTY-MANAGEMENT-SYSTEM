
package com.rental.rental_management_backend.tenant.dto;

import java.util.List;

import com.rental.rental_management_backend.property.enums.FurnishingStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

public class TenantPreferenceDTO {

    private String preferredCity;

    @Min(0)
    private Integer maxBudget;

    @Min(0)
    private Integer minBedrooms;

    private PropertyType preferredPropertyType;

    private FurnishingStatus furnishingPreference;

    private Boolean parkingRequired;

    private List<Long> preferredAmenityIds;

    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double preferredLatitude;

    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double preferredLongitude;

    @DecimalMin("0.0")
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

    public PropertyType getPreferredPropertyType() {
        return preferredPropertyType;
    }

    public void setPreferredPropertyType(PropertyType preferredPropertyType) {
        this.preferredPropertyType = preferredPropertyType;
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
