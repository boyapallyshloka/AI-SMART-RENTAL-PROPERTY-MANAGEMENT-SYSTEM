package com.rental.rental_management_backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RentPredictionRequest {

    private String city;

    @JsonProperty("area_locality")
    private String areaLocality;

    @JsonProperty("area_type")
    private String areaType;

    @JsonProperty("size_sqft")
    private Double sizeSqft;

    @JsonProperty("bedrooms_bhk")
    private Integer bedroomsBhk;

    private Integer bathrooms;

    private Integer floor;

    @JsonProperty("total_floors")
    private Integer totalFloors;

    @JsonProperty("furnishing_status")
    private String furnishingStatus;

    @JsonProperty("parking_available")
    private Boolean parkingAvailable;

    @JsonProperty("property_age_years")
    private Integer propertyAgeYears;

    @JsonProperty("amenity_count")
    private Integer amenityCount;

    @JsonProperty("amenity_parking")
    private Boolean amenityParking;

    @JsonProperty("amenity_lift")
    private Boolean amenityLift;

    @JsonProperty("amenity_gym")
    private Boolean amenityGym;

    @JsonProperty("amenity_security")
    private Boolean amenitySecurity;

    @JsonProperty("amenity_power_backup")
    private Boolean amenityPowerBackup;

    @JsonProperty("amenity_air_conditioning")
    private Boolean amenityAirConditioning;

    @JsonProperty("amenity_wifi")
    private Boolean amenityWifi;

    @JsonProperty("amenity_garden")
    private Boolean amenityGarden;

    private Double latitude;

    private Double longitude;

    @JsonProperty("property_type")
    private String propertyType;

    public RentPredictionRequest() {
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAreaLocality() {
        return areaLocality;
    }

    public void setAreaLocality(String areaLocality) {
        this.areaLocality = areaLocality;
    }

    public String getAreaType() {
        return areaType;
    }

    public void setAreaType(String areaType) {
        this.areaType = areaType;
    }

    public Double getSizeSqft() {
        return sizeSqft;
    }

    public void setSizeSqft(Double sizeSqft) {
        this.sizeSqft = sizeSqft;
    }

    public Integer getBedroomsBhk() {
        return bedroomsBhk;
    }

    public void setBedroomsBhk(Integer bedroomsBhk) {
        this.bedroomsBhk = bedroomsBhk;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public Integer getTotalFloors() {
        return totalFloors;
    }

    public void setTotalFloors(Integer totalFloors) {
        this.totalFloors = totalFloors;
    }

    public String getFurnishingStatus() {
        return furnishingStatus;
    }

    public void setFurnishingStatus(String furnishingStatus) {
        this.furnishingStatus = furnishingStatus;
    }

    public Boolean getParkingAvailable() {
        return parkingAvailable;
    }

    public void setParkingAvailable(Boolean parkingAvailable) {
        this.parkingAvailable = parkingAvailable;
    }

    public Integer getPropertyAgeYears() {
        return propertyAgeYears;
    }

    public void setPropertyAgeYears(Integer propertyAgeYears) {
        this.propertyAgeYears = propertyAgeYears;
    }

    public Integer getAmenityCount() {
        return amenityCount;
    }

    public void setAmenityCount(Integer amenityCount) {
        this.amenityCount = amenityCount;
    }

    public Boolean getAmenityParking() {
        return amenityParking;
    }

    public void setAmenityParking(Boolean amenityParking) {
        this.amenityParking = amenityParking;
    }

    public Boolean getAmenityLift() {
        return amenityLift;
    }

    public void setAmenityLift(Boolean amenityLift) {
        this.amenityLift = amenityLift;
    }

    public Boolean getAmenityGym() {
        return amenityGym;
    }

    public void setAmenityGym(Boolean amenityGym) {
        this.amenityGym = amenityGym;
    }

    public Boolean getAmenitySecurity() {
        return amenitySecurity;
    }

    public void setAmenitySecurity(Boolean amenitySecurity) {
        this.amenitySecurity = amenitySecurity;
    }

    public Boolean getAmenityPowerBackup() {
        return amenityPowerBackup;
    }

    public void setAmenityPowerBackup(Boolean amenityPowerBackup) {
        this.amenityPowerBackup = amenityPowerBackup;
    }

    public Boolean getAmenityAirConditioning() {
        return amenityAirConditioning;
    }

    public void setAmenityAirConditioning(Boolean amenityAirConditioning) {
        this.amenityAirConditioning = amenityAirConditioning;
    }

    public Boolean getAmenityWifi() {
        return amenityWifi;
    }

    public void setAmenityWifi(Boolean amenityWifi) {
        this.amenityWifi = amenityWifi;
    }

    public Boolean getAmenityGarden() {
        return amenityGarden;
    }

    public void setAmenityGarden(Boolean amenityGarden) {
        this.amenityGarden = amenityGarden;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }
}