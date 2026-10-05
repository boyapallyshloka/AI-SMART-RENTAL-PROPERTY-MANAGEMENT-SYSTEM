package com.rental.rental_management_backend.tenant.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.rental.rental_management_backend.property.dto.AmenityResponse;
import com.rental.rental_management_backend.property.enums.FurnishingStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;

public class TenantPreferenceResponseDTO {

    private Long preferenceId;

    // =========================================================
    // PREFERRED LOCATION
    // =========================================================

    private String preferredAddress;

    private String preferredArea;

    private String preferredDistrict;

    private String preferredCity;

    private String preferredState;

    private String preferredCountry;

    private String preferredPincode;

    // =========================================================
    // BUDGET & PROPERTY PREFERENCES
    // =========================================================

    private Integer maxBudget;

    private Integer minBedrooms;

    private PropertyType preferredPropertyType;

    private FurnishingStatus furnishingPreference;

    private Boolean parkingRequired;

    // =========================================================
    // AMENITIES
    // =========================================================

    private List<AmenityResponse> preferredAmenities =
            new ArrayList<>();

    // =========================================================
    // LOCATION COORDINATES
    // =========================================================

    private Double preferredLatitude;

    private Double preferredLongitude;

    private Double maxDistanceKm;

    // =========================================================
    // AUDIT
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TenantPreferenceResponseDTO() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getPreferenceId() {
        return preferenceId;
    }

    public void setPreferenceId(Long preferenceId) {
        this.preferenceId = preferenceId;
    }

    public String getPreferredAddress() {
        return preferredAddress;
    }

    public void setPreferredAddress(String preferredAddress) {
        this.preferredAddress = preferredAddress;
    }

    public String getPreferredArea() {
        return preferredArea;
    }

    public void setPreferredArea(String preferredArea) {
        this.preferredArea = preferredArea;
    }

    public String getPreferredDistrict() {
        return preferredDistrict;
    }

    public void setPreferredDistrict(String preferredDistrict) {
        this.preferredDistrict = preferredDistrict;
    }

    public String getPreferredCity() {
        return preferredCity;
    }

    public void setPreferredCity(String preferredCity) {
        this.preferredCity = preferredCity;
    }

    public String getPreferredState() {
        return preferredState;
    }

    public void setPreferredState(String preferredState) {
        this.preferredState = preferredState;
    }

    public String getPreferredCountry() {
        return preferredCountry;
    }

    public void setPreferredCountry(String preferredCountry) {
        this.preferredCountry = preferredCountry;
    }

    public String getPreferredPincode() {
        return preferredPincode;
    }

    public void setPreferredPincode(String preferredPincode) {
        this.preferredPincode = preferredPincode;
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

    public List<AmenityResponse> getPreferredAmenities() {
        return preferredAmenities;
    }

    public void setPreferredAmenities(
            List<AmenityResponse> preferredAmenities) {

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
