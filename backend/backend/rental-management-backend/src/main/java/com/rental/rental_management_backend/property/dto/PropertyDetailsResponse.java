package com.rental.rental_management_backend.property.dto;

import java.util.List;

public class PropertyDetailsResponse {

    private PropertyResponse property;

    private PropertyAddressResponse address;

    private List<BuildingDetailsResponse> buildings;

    private List<AmenityResponse> amenities;

    private List<PropertyImageResponse> images;


    public PropertyDetailsResponse() {
    }


    public PropertyResponse getProperty() {
        return property;
    }

    public void setProperty(PropertyResponse property) {
        this.property = property;
    }


    public PropertyAddressResponse getAddress() {
        return address;
    }

    public void setAddress(PropertyAddressResponse address) {
        this.address = address;
    }


    public List<BuildingDetailsResponse> getBuildings() {
        return buildings;
    }

    public void setBuildings(List<BuildingDetailsResponse> buildings) {
        this.buildings = buildings;
    }


    public List<AmenityResponse> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<AmenityResponse> amenities) {
        this.amenities = amenities;
    }


    public List<PropertyImageResponse> getImages() {
        return images;
    }

    public void setImages(List<PropertyImageResponse> images) {
        this.images = images;
    }
}