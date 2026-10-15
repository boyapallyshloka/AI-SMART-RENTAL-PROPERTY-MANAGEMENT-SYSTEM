package com.rental.rental_management_backend.property.entity;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(
    name = "amenities",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "amenity_name")
    }
)
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amenity_id")
    private Long amenityId;

    @NotBlank(message = "Amenity name is required")
    @Column(
        name = "amenity_name",
        nullable = false,
        unique = true,
        length = 100
    )
    private String amenityName;

    @Column(
        name = "description",
        columnDefinition = "TEXT"
    )
    private String description;

    public Amenity() {
    }

    public Long getAmenityId() {
        return amenityId;
    }

    public void setAmenityId(Long amenityId) {
        this.amenityId = amenityId;
    }

    public String getAmenityName() {
        return amenityName;
    }

    public void setAmenityName(String amenityName) {
        this.amenityName = amenityName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}