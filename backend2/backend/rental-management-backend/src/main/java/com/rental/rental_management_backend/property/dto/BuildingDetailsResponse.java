package com.rental.rental_management_backend.property.dto;

import java.util.List;

public class BuildingDetailsResponse {

    private BuildingResponse building;

    private List<FloorDetailsResponse> floors;


    public BuildingDetailsResponse() {
    }


    public BuildingResponse getBuilding() {
        return building;
    }

    public void setBuilding(BuildingResponse building) {
        this.building = building;
    }


    public List<FloorDetailsResponse> getFloors() {
        return floors;
    }

    public void setFloors(List<FloorDetailsResponse> floors) {
        this.floors = floors;
    }
}