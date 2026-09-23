
package com.rental.rental_management_backend.ai.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;

public class M2RecommendationItem {

    @JsonProperty("propertyId")
    private String propertyId;

    @JsonProperty("recommendationScore")
    private Double recommendationScore;

    @JsonProperty("monthlyRent")
    private BigDecimal monthlyRent;

    @JsonProperty("propertyBedrooms")
    private Integer propertyBedrooms;

    @JsonProperty("propertyCity")
    private String propertyCity;

    @JsonProperty("cityMatch")
    private Integer cityMatch;

    @JsonProperty("budgetMatch")
    private Integer budgetMatch;

    @JsonProperty("bedroomMatch")
    private Integer bedroomMatch;

    @JsonProperty("propertyTypeMatch")
    private Integer propertyTypeMatch;

    @JsonProperty("furnishingMatch")
    private Integer furnishingMatch;

    @JsonProperty("parkingMatch")
    private Integer parkingMatch;

    @JsonProperty("amenityMatch")
    private Integer amenityMatch;

    @JsonProperty("distanceMatch")
    private Integer distanceMatch;

    @JsonProperty("approxDistanceKm")
    private Double approxDistanceKm;

    @JsonProperty("availableUnits")
    private List<AvailableUnitResponse> availableUnits;

    /*
     * CURRENT PROPERTY DETAILS
     *
     * This is fetched from the Spring Boot database
     * using the propertyId returned by M2.
     */
    @JsonProperty("propertyDetails")
    private PropertyDetailsResponse propertyDetails;

    public M2RecommendationItem() {
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public Double getRecommendationScore() {
        return recommendationScore;
    }

    public void setRecommendationScore(Double recommendationScore) {
        this.recommendationScore = recommendationScore;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(BigDecimal monthlyRent) {
        this.monthlyRent = monthlyRent;
    }

    public Integer getPropertyBedrooms() {
        return propertyBedrooms;
    }

    public void setPropertyBedrooms(Integer propertyBedrooms) {
        this.propertyBedrooms = propertyBedrooms;
    }

    public String getPropertyCity() {
        return propertyCity;
    }

    public void setPropertyCity(String propertyCity) {
        this.propertyCity = propertyCity;
    }

    public Integer getCityMatch() {
        return cityMatch;
    }

    public void setCityMatch(Integer cityMatch) {
        this.cityMatch = cityMatch;
    }

    public Integer getBudgetMatch() {
        return budgetMatch;
    }

    public void setBudgetMatch(Integer budgetMatch) {
        this.budgetMatch = budgetMatch;
    }

    public Integer getBedroomMatch() {
        return bedroomMatch;
    }

    public void setBedroomMatch(Integer bedroomMatch) {
        this.bedroomMatch = bedroomMatch;
    }

    public Integer getPropertyTypeMatch() {
        return propertyTypeMatch;
    }

    public void setPropertyTypeMatch(Integer propertyTypeMatch) {
        this.propertyTypeMatch = propertyTypeMatch;
    }

    public Integer getFurnishingMatch() {
        return furnishingMatch;
    }

    public void setFurnishingMatch(Integer furnishingMatch) {
        this.furnishingMatch = furnishingMatch;
    }

    public Integer getParkingMatch() {
        return parkingMatch;
    }

    public void setParkingMatch(Integer parkingMatch) {
        this.parkingMatch = parkingMatch;
    }

    public Integer getAmenityMatch() {
        return amenityMatch;
    }

    public void setAmenityMatch(Integer amenityMatch) {
        this.amenityMatch = amenityMatch;
    }

    public Integer getDistanceMatch() {
        return distanceMatch;
    }

    public void setDistanceMatch(Integer distanceMatch) {
        this.distanceMatch = distanceMatch;
    }

    public Double getApproxDistanceKm() {
        return approxDistanceKm;
    }

    public void setApproxDistanceKm(Double approxDistanceKm) {
        this.approxDistanceKm = approxDistanceKm;
    }

    public List<AvailableUnitResponse> getAvailableUnits() {
        return availableUnits;
    }

    public void setAvailableUnits(
            List<AvailableUnitResponse> availableUnits) {

        this.availableUnits = availableUnits;
    }

    public PropertyDetailsResponse getPropertyDetails() {
        return propertyDetails;
    }

    public void setPropertyDetails(
            PropertyDetailsResponse propertyDetails) {

        this.propertyDetails = propertyDetails;
    }
}
