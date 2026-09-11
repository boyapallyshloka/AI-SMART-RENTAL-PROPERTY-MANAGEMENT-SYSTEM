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


    // Manual constructor
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


    @Override
    public PropertyDetailsResponse getPropertyDetails(Long propertyId) {

        /*
         * 1. PROPERTY
         */
        PropertyResponse property =
                propertyService.getMyPropertyById(propertyId);


        /*
         * 2. ADDRESS
         * A property is allowed to exist without an address.
         * If the address does not exist and the service throws
         * ResourceNotFoundException, treat address as null.
         */
        PropertyAddressResponse address = null;
        try {
            address = propertyAddressService.getAddressByPropertyId(propertyId);
        } catch (ResourceNotFoundException ex) {
            address = null;
        }


        /*
         * 3. BUILDINGS
         */
        List<BuildingResponse> buildingResponses =
                buildingService.getBuildingsByProperty(propertyId);

        List<BuildingDetailsResponse> buildings =
                new ArrayList<>();

        if (buildingResponses != null) {
            for (BuildingResponse building : buildingResponses) {
                if (building == null) {
                    continue;
                }

                BuildingDetailsResponse buildingDetails =
                        new BuildingDetailsResponse();

                buildingDetails.setBuilding(building);


                List<FloorResponse> floorResponses =
                        floorService.getFloorsByBuilding(
                                building.getBuildingId()
                        );

                List<FloorDetailsResponse> floors =
                        new ArrayList<>();

                if (floorResponses != null) {
                    for (FloorResponse floor : floorResponses) {
                        if (floor == null) {
                            continue;
                        }

                        FloorDetailsResponse floorDetails =
                                new FloorDetailsResponse();

                        floorDetails.setFloor(floor);


                        List<UnitResponse> units =
                                unitService.getUnitsByFloor(
                                        floor.getFloorId()
                                );

                        floorDetails.setUnits(units != null ? units : new ArrayList<>());

                        floors.add(floorDetails);
                    }
                }

                buildingDetails.setFloors(floors);

                buildings.add(buildingDetails);
            }
        }


        /*
         * 6. AMENITIES
         */
        List<AmenityResponse> amenities =
                amenityService.getPropertyAmenities(propertyId);
        if (amenities == null) {
            amenities = new ArrayList<>();
        }


        /*
         * 7. IMAGES
         */
        List<PropertyImageResponse> images =
                propertyImageService.getImagesByProperty(propertyId);
        if (images == null) {
            images = new ArrayList<>();
        }


        /*
         * 8. BUILD FINAL RESPONSE
         */
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