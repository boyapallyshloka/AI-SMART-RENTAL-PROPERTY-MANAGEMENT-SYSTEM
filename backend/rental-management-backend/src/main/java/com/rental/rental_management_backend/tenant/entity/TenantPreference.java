
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preference_id")
    private Long preferenceId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    @Column(name = "preferred_city", length = 100)
    private String preferredCity;

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

    @Column(name = "preferred_latitude")
    private Double preferredLatitude;

    @Column(name = "preferred_longitude")
    private Double preferredLongitude;

    @Column(name = "max_distance_km")
    private Double maxDistanceKm;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

