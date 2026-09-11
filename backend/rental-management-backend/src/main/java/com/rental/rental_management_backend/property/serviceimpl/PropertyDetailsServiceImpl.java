package com.rental.rental_management_backend.property.serviceimpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.dto.AmenityResponse;
import com.rental.rental_management_backend.property.dto.BuildingDetailsResponse;
import com.rental.rental_management_backend.property.dto.BuildingResponse;
import com.rental.rental_management_backend.property.dto.FloorDetailsResponse;
import com.rental.rental_management_backend.property.dto.FloorResponse;
import com.rental.rental_management_backend.property.dto.PropertyAddressResponse;
import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;
import com.rental.rental_management_backend.property.dto.PropertyImageResponse;
import com.rental.rental_management_backend.property.dto.PropertyResponse;
import com.rental.rental_management_backend.property.dto.UnitResponse;
import com.rental.rental_management_backend.property.service.AmenityService;
import com.rental.rental_management_backend.property.service.BuildingService;
import com.rental.rental_management_backend.property.service.FloorService;
import com.rental.rental_management_backend.property.service.PropertyAddressService;
import com.rental.rental_management_backend.property.service.PropertyDetailsService;
import com.rental.rental_management_backend.property.service.PropertyImageService;
import com.rental.rental_management_backend.property.service.PropertyService;
import com.rental.rental_management_backend.property.service.UnitService;

@Service
public class PropertyDetailsServiceImpl implements PropertyDetailsService {

    private final PropertyService propertyService;
    private final PropertyAddressService propertyAddressService;
    private final BuildingService buildingService;
    private final FloorService floorService;
    private final UnitService unitService;
    private final AmenityService amenityService;
    private final PropertyImageService propertyImageService;

    public PropertyDetailsServiceImpl(
            PropertyService propertyService,
            PropertyAddressService propertyAddressService,
            BuildingService buildingService,
            FloorService floorService,
            UnitService unitService,
            AmenityService amenityService,
            PropertyImageService propertyImageService) {

        this.propertyService = propertyService;
        this.propertyAddressService = propertyAddressService;
        this.buildingService = buildingService;
        this.floorService = floorService;
        this.unitService = unitService;
        this.amenityService = amenityService;
        this.propertyImageService = propertyImageService;
    }

    // ============================================================
    // OWNER PROPERTY DETAILS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public PropertyDetailsResponse getPropertyDetails(Long propertyId) {

        PropertyResponse property =
                propertyService.getMyPropertyById(propertyId);

        return buildPropertyDetailsResponse(
                propertyId,
                property,
                false
        );
    }

    // ============================================================
    // PUBLIC / TENANT PROPERTY DETAILS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public PropertyDetailsResponse getPublicPropertyDetails(
            Long propertyId) {

        PropertyResponse property =
                propertyService.getPublicPropertyById(propertyId);

        return buildPropertyDetailsResponse(
                propertyId,
                property,
                true
        );
    }

    // ============================================================
    // BUILD COMPLETE PROPERTY DETAILS
    // ============================================================

    private PropertyDetailsResponse buildPropertyDetailsResponse(
            Long propertyId,
            PropertyResponse property,
            boolean publicView) {

        // ========================================================
        // 1. ADDRESS
        // ========================================================

        PropertyAddressResponse address = null;

        try {

            if (publicView) {

                // Tenant / public flow
                address =
                        propertyAddressService
                                .getPublicAddressByPropertyId(
                                        propertyId);

            } else {

                // Owner flow
                address =
                        propertyAddressService
                                .getAddressByPropertyId(
                                        propertyId);
            }

        } catch (ResourceNotFoundException ex) {

            // Address is optional.
            // If no address exists, continue with address = null.
            address = null;
        }

        // ========================================================
        // 2. BUILDINGS
        // ========================================================

        List<BuildingResponse> buildingResponses;

        if (publicView) {

            // Tenant / public flow
            buildingResponses =
                    buildingService
                            .getPublicBuildingsByProperty(
                                    propertyId);

        } else {

            // Owner flow
            buildingResponses =
                    buildingService
                            .getBuildingsByProperty(
                                    propertyId);
        }

        if (buildingResponses == null) {
            buildingResponses = new ArrayList<>();
        }

        List<BuildingDetailsResponse> buildings =
                new ArrayList<>();

        // ========================================================
        // 3. FLOORS
        // 4. UNITS
        // ========================================================

        for (BuildingResponse building : buildingResponses) {

            if (building == null) {
                continue;
            }

            BuildingDetailsResponse buildingDetails =
                    new BuildingDetailsResponse();

            buildingDetails.setBuilding(building);

            // ----------------------------------------------------
            // FLOORS
            // ----------------------------------------------------

            List<FloorResponse> floorResponses;

            if (publicView) {

                // Tenant / public flow
                floorResponses =
                        floorService
                                .getPublicFloorsByBuilding(
                                        building.getBuildingId());

            } else {

                // Owner flow
                floorResponses =
                        floorService
                                .getFloorsByBuilding(
                                        building.getBuildingId());
            }

            if (floorResponses == null) {
                floorResponses = new ArrayList<>();
            }

            List<FloorDetailsResponse> floors =
                    new ArrayList<>();

            // ----------------------------------------------------
            // UNITS
            // ----------------------------------------------------

            for (FloorResponse floor : floorResponses) {

                if (floor == null) {
                    continue;
                }

                FloorDetailsResponse floorDetails =
                        new FloorDetailsResponse();

                floorDetails.setFloor(floor);

                List<UnitResponse> units;

                if (publicView) {

                    // Tenant / public flow
                    units =
                            unitService
                                    .getPublicUnitsByFloor(
                                            floor.getFloorId());

                } else {

                    // Owner flow
                    units =
                            unitService
                                    .getUnitsByFloor(
                                            floor.getFloorId());
                }

                if (units == null) {
                    units = new ArrayList<>();
                }

                floorDetails.setUnits(units);

                floors.add(floorDetails);
            }

            buildingDetails.setFloors(floors);

            buildings.add(buildingDetails);
        }

        // ========================================================
        // 5. AMENITIES
        // ========================================================

        List<AmenityResponse> amenities;

        if (publicView) {

            // Tenant / public flow
            amenities =
                    amenityService
                            .getPublicPropertyAmenities(
                                    propertyId);

        } else {

            // Owner flow
            amenities =
                    amenityService
                            .getPropertyAmenities(
                                    propertyId);
        }

        if (amenities == null) {
            amenities = new ArrayList<>();
        }

        // ========================================================
        // 6. IMAGES
        // ========================================================

        List<PropertyImageResponse> images;

        if (publicView) {

            // Tenant / public flow
            images =
                    propertyImageService
                            .getPublicImagesByProperty(
                                    propertyId);

        } else {

            // Owner flow
            images =
                    propertyImageService
                            .getImagesByProperty(
                                    propertyId);
        }

        if (images == null) {
            images = new ArrayList<>();
        }

        // ========================================================
        // 7. BUILD FINAL RESPONSE
        // ========================================================

        PropertyDetailsResponse response =
                new PropertyDetailsResponse();

        response.setProperty(property);
        response.setAddress(address);
        response.setBuildings(buildings);
        response.setAmenities(amenities);
        response.setImages(images);

        return response;
    }
}
