package com.rental.rental_management_backend.ai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class RentPredictionPreviewRequestDTO {

    @NotNull(message = "Floor ID is required")
    private Long floorId;

    @NotNull(message = "Area is required")
    @PositiveOrZero(message = "Area cannot be negative")
    private Double area;

    @NotNull(message = "Bedrooms are required")
    @PositiveOrZero(message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @NotNull(message = "Bathrooms are required")
    @PositiveOrZero(message = "Bathrooms cannot be negative")
    private Integer bathrooms;

    public RentPredictionPreviewRequestDTO() {
    }

    public RentPredictionPreviewRequestDTO(
            Long floorId,
            Double area,
            Integer bedrooms,
            Integer bathrooms) {

        this.floorId = floorId;
        this.area = area;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
    }

    public Long getFloorId() {
        return floorId;
    }

    public void setFloorId(Long floorId) {
        this.floorId = floorId;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }
}