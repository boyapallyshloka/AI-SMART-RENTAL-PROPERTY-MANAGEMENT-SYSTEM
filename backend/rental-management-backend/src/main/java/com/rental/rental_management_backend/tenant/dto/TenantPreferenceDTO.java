package com.rental.rental_management_backend.tenant.dto;

import java.util.List;

import com.rental.rental_management_backend.property.enums.FurnishingStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TenantPreferenceDTO {

    // =========================================================
    // PREFERRED LOCATION
    // =========================================================

    @Size(
        max = 500,
        message = "Preferred address cannot exceed 500 characters"
    )
    private String preferredAddress;

    @Size(
        max = 100,
        message = "Preferred area cannot exceed 100 characters"
    )
    private String preferredArea;

    @Size(
        max = 100,
        message = "Preferred district cannot exceed 100 characters"
    )
    private String preferredDistrict;

    @Size(
        max = 100,
        message = "Preferred city cannot exceed 100 characters"
    )
    private String preferredCity;

    @Size(
        max = 100,
        message = "Preferred state cannot exceed 100 characters"
    )
    private String preferredState;

    @Size(
        max = 100,
        message = "Preferred country cannot exceed 100 characters"
    )
    private String preferredCountry;

    @Pattern(
        regexp = "^\\d{6}$",
        message = "Preferred pincode must be exactly 6 digits"
    )
    private String preferredPincode;

    // =========================================================
    // BUDGET & PROPERTY PREFERENCES
    // =========================================================

    @Min(0)
    private Integer maxBudget;

    @Min(0)
    private Integer minBedrooms;

    private PropertyType preferredPropertyType;

    private FurnishingStatus furnishingPreference;

    private Boolean parkingRequired;

    // =========================================================
    // AMENITIES
    // =========================================================

    private List<Long> preferredAmenityIds;

    // =========================================================
    // LOCATION COORDINATES
    // =========================================================

    // Optional
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double preferredLatitude;

    // Optional
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double preferredLongitude;

    // Optional
    @DecimalMin("0.0")
    private Double maxDistanceKm;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TenantPreferenceDTO() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

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
