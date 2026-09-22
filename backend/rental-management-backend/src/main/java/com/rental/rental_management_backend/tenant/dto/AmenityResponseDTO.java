package com.rental.rental_management_backend.tenant.dto;

public class AmenityResponseDTO {

    private Long amenityId;
    private String amenityName;
    private String description;

    public AmenityResponseDTO() {
    }

    public AmenityResponseDTO(
            Long amenityId,
            String amenityName,
            String description) {

        this.amenityId = amenityId;
        this.amenityName = amenityName;
        this.description = description;
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