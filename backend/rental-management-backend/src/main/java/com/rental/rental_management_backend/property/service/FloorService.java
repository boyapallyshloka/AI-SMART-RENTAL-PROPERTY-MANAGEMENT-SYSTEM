package com.rental.rental_management_backend.property.service;

import java.util.List;

import com.rental.rental_management_backend.property.dto.FloorRequest;
import com.rental.rental_management_backend.property.dto.FloorResponse;

public interface FloorService {

    FloorResponse createFloor(FloorRequest request);

    List<FloorResponse> getFloorsByBuilding(Long buildingId);

    FloorResponse getFloorById(Long floorId);

    FloorResponse updateFloor(Long floorId, FloorRequest request);

    void deleteFloor(Long floorId);
    List<FloorResponse> getPublicFloorsByBuilding(Long buildingId);
}
