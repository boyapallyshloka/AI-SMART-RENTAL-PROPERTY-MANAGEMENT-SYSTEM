package com.rental.rental_management_backend.property.entity;


import com.rental.rental_management_backend.property.entity.Property;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "property_amenities",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"property_id", "amenity_id"}
        )
    }
)
public class PropertyAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_amenity_id")
    private Long propertyAmenityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "property_id",
        nullable = false
    )
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "amenity_id",
        nullable = false
    )
    private Amenity amenity;

    public PropertyAmenity() {
    }

    public Long getPropertyAmenityId() {
        return propertyAmenityId;
    }

    public void setPropertyAmenityId(Long propertyAmenityId) {
        this.propertyAmenityId = propertyAmenityId;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public Amenity getAmenity() {
        return amenity;
    }

    public void setAmenity(Amenity amenity) {
        this.amenity = amenity;
    }
}