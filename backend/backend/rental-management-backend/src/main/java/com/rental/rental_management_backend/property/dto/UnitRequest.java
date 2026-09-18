package com.rental.rental_management_backend.property.dto;



import java.math.BigDecimal;

import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.enums.UnitType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class UnitRequest {

    @NotBlank(message = "Unit number is required")
    private String unitNumber;

    @NotNull(message = "Unit type is required")
    private UnitType unitType;

    @PositiveOrZero(message = "Area cannot be negative")
    private Double area;

    @PositiveOrZero(message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @PositiveOrZero(message = "Bathrooms cannot be negative")
    private Integer bathrooms;

    @NotNull(message = "Monthly rent is required")
    @DecimalMin(
        value = "0.0",
        message = "Monthly rent cannot be negative"
    )
    private BigDecimal monthlyRent;

    @NotNull(message = "Security deposit is required")
    @DecimalMin(
        value = "0.0",
        message = "Security deposit cannot be negative"
    )
    private BigDecimal securityDeposit;

    private UnitStatus status;

    private String description;

    @NotNull(message = "Floor ID is required")
    private Long floorId;

    public UnitRequest() {
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public UnitType getUnitType() {
        return unitType;
    }

    public void setUnitType(UnitType unitType) {
        this.unitType = unitType;
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

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(BigDecimal monthlyRent) {
        this.monthlyRent = monthlyRent;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public UnitStatus getStatus() {
        return status;
    }

    public void setStatus(UnitStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getFloorId() {
        return floorId;
    }

    public void setFloorId(Long floorId) {
        this.floorId = floorId;
    }
}