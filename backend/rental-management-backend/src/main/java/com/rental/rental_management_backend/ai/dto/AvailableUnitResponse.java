package com.rental.rental_management_backend.ai.dto;

import java.math.BigDecimal;

public class AvailableUnitResponse {

    private Long unitId;

    private BigDecimal monthlyRent;

    private Integer bedrooms;

    public AvailableUnitResponse() {
    }

    public AvailableUnitResponse(
            Long unitId,
            BigDecimal monthlyRent,
            Integer bedrooms) {

        this.unitId = unitId;
        this.monthlyRent = monthlyRent;
        this.bedrooms = bedrooms;
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(BigDecimal monthlyRent) {
        this.monthlyRent = monthlyRent;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }
}