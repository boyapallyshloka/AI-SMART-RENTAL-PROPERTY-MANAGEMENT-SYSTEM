package com.rental.rental_management_backend.property.service;


import java.util.List;

import com.rental.rental_management_backend.property.dto.UnitRequest;
import com.rental.rental_management_backend.property.dto.UnitResponse;



public interface UnitService {

    UnitResponse createUnit(UnitRequest request);

    List<UnitResponse> getUnitsByFloor(Long floorId);

    UnitResponse getUnitById(Long unitId);

    UnitResponse updateUnit(
            Long unitId,
            UnitRequest request);

    void deleteUnit(Long unitId);
}