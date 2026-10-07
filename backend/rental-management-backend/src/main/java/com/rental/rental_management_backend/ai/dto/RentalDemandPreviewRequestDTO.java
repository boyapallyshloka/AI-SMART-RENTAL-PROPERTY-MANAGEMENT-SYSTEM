
package com.rental.rental_management_backend.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RentalDemandPreviewRequestDTO {

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Area is required")
    private String area;

    @NotNull(message = "Year is required")
    @Min(value = 2020, message = "Year must be valid")
    @Max(value = 2100, message = "Year must be valid")
    private Integer year;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    public RentalDemandPreviewRequestDTO() {
    }

    public RentalDemandPreviewRequestDTO(
            String city,
            String area,
            Integer year,
            Integer month) {

        this.city = city;
        this.area = area;
        this.year = year;
        this.month = month;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }
}
