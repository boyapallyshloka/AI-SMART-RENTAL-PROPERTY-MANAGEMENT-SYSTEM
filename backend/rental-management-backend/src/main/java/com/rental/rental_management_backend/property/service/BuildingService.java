package com.rental.rental_management_backend.property.service;

import java.util.List;

import com.rental.rental_management_backend.property.dto.BuildingRequest;
import com.rental.rental_management_backend.property.dto.BuildingResponse;

public interface BuildingService {

    BuildingResponse createBuilding(
            BuildingRequest request
    );

    List<BuildingResponse> getBuildingsByProperty(
            Long propertyId
    );

    BuildingResponse getBuildingById(
            Long buildingId
    );

    BuildingResponse updateBuilding(
            Long buildingId,
            BuildingRequest request
    );

    void deleteBuilding(
            Long buildingId
    );
}