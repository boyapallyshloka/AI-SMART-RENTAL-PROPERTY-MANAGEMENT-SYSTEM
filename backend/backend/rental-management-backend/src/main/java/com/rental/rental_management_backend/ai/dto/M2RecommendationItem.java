package com.rental.rental_management_backend.ai.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;

public class M2RecommendationItem {


@JsonProperty("propertyId")
private String propertyId;

@JsonProperty("recommendationScore")
private Double recommendationScore;

@JsonProperty("propertyCity")
private String propertyCity;

@JsonProperty("matchDetails")
private MatchDetails matchDetails;

@JsonProperty("availableUnits")
private List<AvailableUnitResponse> availableUnits;

/*
 * CURRENT PROPERTY DETAILS
 *
 * This is optional backend enrichment fetched from the
 * Spring Boot database using the propertyId returned by M2.
 *
 * It must not change M2's score, ranking, eligibility,
 * or selected availableUnits.
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

public String getPropertyCity() {
    return propertyCity;
}

public void setPropertyCity(String propertyCity) {
    this.propertyCity = propertyCity;
}

public MatchDetails getMatchDetails() {
    return matchDetails;
}

public void setMatchDetails(MatchDetails matchDetails) {
    this.matchDetails = matchDetails;
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

/*
 * Nested match details returned by M2.
 */
public static class MatchDetails {

    @JsonProperty("cityMatch")
    private Boolean cityMatch;

    @JsonProperty("budgetMatch")
    private Boolean budgetMatch;

    @JsonProperty("bedroomMatch")
    private Boolean bedroomMatch;

    @JsonProperty("propertyTypeMatch")
    private Boolean propertyTypeMatch;

    @JsonProperty("furnishingMatch")
    private Boolean furnishingMatch;

    @JsonProperty("parkingMatch")
    private Boolean parkingMatch;

    @JsonProperty("amenities")
    private AmenityMatchDetails amenities;

    @JsonProperty("distance")
    private DistanceMatchDetails distance;

    public MatchDetails() {
    }

    public Boolean getCityMatch() {
        return cityMatch;
    }

    public void setCityMatch(Boolean cityMatch) {
        this.cityMatch = cityMatch;
    }

    public Boolean getBudgetMatch() {
        return budgetMatch;
    }

    public void setBudgetMatch(Boolean budgetMatch) {
        this.budgetMatch = budgetMatch;
    }

    public Boolean getBedroomMatch() {
        return bedroomMatch;
    }

    public void setBedroomMatch(Boolean bedroomMatch) {
        this.bedroomMatch = bedroomMatch;
    }

    public Boolean getPropertyTypeMatch() {
        return propertyTypeMatch;
    }

    public void setPropertyTypeMatch(Boolean propertyTypeMatch) {
        this.propertyTypeMatch = propertyTypeMatch;
    }

    public Boolean getFurnishingMatch() {
        return furnishingMatch;
    }

    public void setFurnishingMatch(Boolean furnishingMatch) {
        this.furnishingMatch = furnishingMatch;
    }

    public Boolean getParkingMatch() {
        return parkingMatch;
    }

    public void setParkingMatch(Boolean parkingMatch) {
        this.parkingMatch = parkingMatch;
    }

    public AmenityMatchDetails getAmenities() {
        return amenities;
    }

    public void setAmenities(AmenityMatchDetails amenities) {
        this.amenities = amenities;
    }

    public DistanceMatchDetails getDistance() {
        return distance;
    }

    public void setDistance(DistanceMatchDetails distance) {
        this.distance = distance;
    }
}

/*
 * M2 multi-amenity matching information.
 */
public static class AmenityMatchDetails {

    @JsonProperty("matchPercentage")
    private Double matchPercentage;

    @JsonProperty("matched")
    private List<String> matched;

    @JsonProperty("missing")
    private List<String> missing;

    public AmenityMatchDetails() {
    }

    public Double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(Double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatched() {
        return matched;
    }

    public void setMatched(List<String> matched) {
        this.matched = matched;
    }

    public List<String> getMissing() {
        return missing;
    }

    public void setMissing(List<String> missing) {
        this.missing = missing;
    }
}

/*
 * M2 distance matching information.
 */
public static class DistanceMatchDetails {

    @JsonProperty("distanceConsidered")
    private Boolean distanceConsidered;

    @JsonProperty("distanceMatch")
    private Double distanceMatch;

    @JsonProperty("approxDistanceKm")
    private Double approxDistanceKm;

    public DistanceMatchDetails() {
    }

    public Boolean getDistanceConsidered() {
        return distanceConsidered;
    }

    public void setDistanceConsidered(Boolean distanceConsidered) {
        this.distanceConsidered = distanceConsidered;
    }

    public Double getDistanceMatch() {
        return distanceMatch;
    }

    public void setDistanceMatch(Double distanceMatch) {
        this.distanceMatch = distanceMatch;
    }

    public Double getApproxDistanceKm() {
        return approxDistanceKm;
    }

    public void setApproxDistanceKm(Double approxDistanceKm) {
        this.approxDistanceKm = approxDistanceKm;
    }
}


}
