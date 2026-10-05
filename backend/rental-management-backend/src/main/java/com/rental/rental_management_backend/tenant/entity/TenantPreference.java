package com.rental.rental_management_backend.tenant.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.rental.rental_management_backend.property.entity.Amenity;
import com.rental.rental_management_backend.property.enums.FurnishingStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "tenant_preferences",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "tenant_id")
    }
)
public class TenantPreference {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preference_id")
    private Long preferenceId;

    // =========================================================
    // TENANT RELATIONSHIP
    // =========================================================

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    // =========================================================
    // PREFERRED LOCATION
    // =========================================================

    @Column(
        name = "preferred_address",
        columnDefinition = "TEXT"
    )
    private String preferredAddress;

    @Column(name = "preferred_area", length = 100)
    private String preferredArea;

    @Column(name = "preferred_district", length = 100)
    private String preferredDistrict;

    @Column(name = "preferred_city", length = 100)
    private String preferredCity;

    @Column(name = "preferred_state", length = 100)
    private String preferredState;

    @Column(name = "preferred_country", length = 100)
    private String preferredCountry;

    @Column(name = "preferred_pincode", length = 20)
    private String preferredPincode;

    // =========================================================
    // BUDGET & PROPERTY PREFERENCES
    // =========================================================

    @Column(name = "max_budget")
    private Integer maxBudget;

    @Column(name = "min_bedrooms")
    private Integer minBedrooms;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_property_type", length = 30)
    private PropertyType preferredPropertyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "furnishing_preference", length = 30)
    private FurnishingStatus furnishingPreference;

    @Column(name = "parking_required")
    private Boolean parkingRequired;

    // =========================================================
    // PREFERRED AMENITIES
    // =========================================================

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tenant_preference_amenities",
        joinColumns = @JoinColumn(name = "preference_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id"),
        uniqueConstraints = {
            @UniqueConstraint(
                columnNames = {"preference_id", "amenity_id"}
            )
        }
    )
    private Set<Amenity> preferredAmenities = new HashSet<>();

    // =========================================================
    // LOCATION COORDINATES
    // =========================================================

    // Optional - populated when tenant uses Current Location
    @Column(name = "preferred_latitude")
    private Double preferredLatitude;

    // Optional - populated when tenant uses Current Location
    @Column(name = "preferred_longitude")
    private Double preferredLongitude;

    // Optional - used for nearby property recommendations
    @Column(name = "max_distance_km")
    private Double maxDistanceKm;

    // =========================================================
    // AUDIT
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
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

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
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

    public Set<Amenity> getPreferredAmenities() {
        return preferredAmenities;
    }

    public void setPreferredAmenities(Set<Amenity> preferredAmenities) {
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