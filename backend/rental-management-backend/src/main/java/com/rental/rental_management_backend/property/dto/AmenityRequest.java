package com.rental.rental_management_backend.property.dto;



import jakarta.validation.constraints.NotBlank;

public class AmenityRequest {

    @NotBlank(message = "Amenity name is required")
    private String amenityName;

    private String description;

    public AmenityRequest() {
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