package com.rental.rental_management_backend.property.dto;

import java.util.List;

public class FloorDetailsResponse {

    private FloorResponse floor;

    private List<UnitResponse> units;


    public FloorDetailsResponse() {
    }


    public FloorResponse getFloor() {
        return floor;
    }

    public void setFloor(FloorResponse floor) {
        this.floor = floor;
    }


    public List<UnitResponse> getUnits() {
        return units;
    }

    public void setUnits(List<UnitResponse> units) {
        this.units = units;
    }
}