package com.rental.rental_management_backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentPredictionRequestDTO {

    private String city;

    private String area_locality;

    private String area_type;

    private Double size_sqft;

    private Integer bedrooms_bhk;

    private Integer bathrooms;

    private Integer floor;

    private Integer total_floors;

    private String furnishing_status;

    private Boolean parking_available;

    private Integer property_age_years;

    private Integer amenity_count;

    private Boolean amenity_parking;

    private Boolean amenity_lift;

    private Boolean amenity_gym;

    private Boolean amenity_security;

    private Boolean amenity_power_backup;

    private Boolean amenity_air_conditioning;

    private Boolean amenity_wifi;

    private Boolean amenity_garden;

    private Double latitude;

    private Double longitude;

    private String property_type;

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getArea_locality() {
		return area_locality;
	}

	public void setArea_locality(String area_locality) {
		this.area_locality = area_locality;
	}

	public String getArea_type() {
		return area_type;
	}

	public void setArea_type(String area_type) {
		this.area_type = area_type;
	}

	public Double getSize_sqft() {
		return size_sqft;
	}

	public void setSize_sqft(Double size_sqft) {
		this.size_sqft = size_sqft;
	}

	public Integer getBedrooms_bhk() {
		return bedrooms_bhk;
	}

	public void setBedrooms_bhk(Integer bedrooms_bhk) {
		this.bedrooms_bhk = bedrooms_bhk;
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

	public Integer getTotal_floors() {
		return total_floors;
	}

	public void setTotal_floors(Integer total_floors) {
		this.total_floors = total_floors;
	}

	public String getFurnishing_status() {
		return furnishing_status;
	}

	public void setFurnishing_status(String furnishing_status) {
		this.furnishing_status = furnishing_status;
	}

	public Boolean getParking_available() {
		return parking_available;
	}

	public void setParking_available(Boolean parking_available) {
		this.parking_available = parking_available;
	}

	public Integer getProperty_age_years() {
		return property_age_years;
	}

	public void setProperty_age_years(Integer property_age_years) {
		this.property_age_years = property_age_years;
	}

	public Integer getAmenity_count() {
		return amenity_count;
	}

	public void setAmenity_count(Integer amenity_count) {
		this.amenity_count = amenity_count;
	}

	public Boolean getAmenity_parking() {
		return amenity_parking;
	}

	public void setAmenity_parking(Boolean amenity_parking) {
		this.amenity_parking = amenity_parking;
	}

	public Boolean getAmenity_lift() {
		return amenity_lift;
	}

	public void setAmenity_lift(Boolean amenity_lift) {
		this.amenity_lift = amenity_lift;
	}

	public Boolean getAmenity_gym() {
		return amenity_gym;
	}

	public void setAmenity_gym(Boolean amenity_gym) {
		this.amenity_gym = amenity_gym;
	}

	public Boolean getAmenity_security() {
		return amenity_security;
	}

	public void setAmenity_security(Boolean amenity_security) {
		this.amenity_security = amenity_security;
	}

	public Boolean getAmenity_power_backup() {
		return amenity_power_backup;
	}

	public void setAmenity_power_backup(Boolean amenity_power_backup) {
		this.amenity_power_backup = amenity_power_backup;
	}

	public Boolean getAmenity_air_conditioning() {
		return amenity_air_conditioning;
	}

	public void setAmenity_air_conditioning(Boolean amenity_air_conditioning) {
		this.amenity_air_conditioning = amenity_air_conditioning;
	}

	public Boolean getAmenity_wifi() {
		return amenity_wifi;
	}

	public void setAmenity_wifi(Boolean amenity_wifi) {
		this.amenity_wifi = amenity_wifi;
	}

	public Boolean getAmenity_garden() {
		return amenity_garden;
	}

	public void setAmenity_garden(Boolean amenity_garden) {
		this.amenity_garden = amenity_garden;
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

	public String getProperty_type() {
		return property_type;
	}

	public void setProperty_type(String property_type) {
		this.property_type = property_type;
	}
    
}
