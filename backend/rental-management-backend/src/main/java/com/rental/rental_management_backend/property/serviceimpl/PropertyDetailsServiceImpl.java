package com.rental.rental_management_backend.property.serviceimpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
<<<<<<< HEAD
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAddress;
import com.rental.rental_management_backend.property.entity.PropertyAmenity;
import com.rental.rental_management_backend.property.entity.PropertyImage;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.entity.Amenity;
import com.rental.rental_management_backend.property.enums.PropertyStatus;
import com.rental.rental_management_backend.property.repository.BuildingRepository;
import com.rental.rental_management_backend.property.repository.FloorRepository;
import com.rental.rental_management_backend.property.repository.PropertyAddressRepository;
import com.rental.rental_management_backend.property.repository.PropertyAmenityRepository;
import com.rental.rental_management_backend.property.repository.PropertyImageRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;
=======
>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
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

<<<<<<< HEAD
    private final PropertyRepository propertyRepository;
    private final PropertyAddressRepository propertyAddressRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final UnitRepository unitRepository;
    private final PropertyAmenityRepository propertyAmenityRepository;
    private final PropertyImageRepository propertyImageRepository;

=======
>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
    public PropertyDetailsServiceImpl(
            PropertyService propertyService,
            PropertyAddressService propertyAddressService,
            BuildingService buildingService,
            FloorService floorService,
            UnitService unitService,
            AmenityService amenityService,
            PropertyImageService propertyImageService,
            PropertyRepository propertyRepository,
            PropertyAddressRepository propertyAddressRepository,
            BuildingRepository buildingRepository,
            FloorRepository floorRepository,
            UnitRepository unitRepository,
            PropertyAmenityRepository propertyAmenityRepository,
            PropertyImageRepository propertyImageRepository) {

        this.propertyService = propertyService;
        this.propertyAddressService = propertyAddressService;
        this.buildingService = buildingService;
        this.floorService = floorService;
        this.unitService = unitService;
        this.amenityService = amenityService;
        this.propertyImageService = propertyImageService;
        this.propertyRepository = propertyRepository;
        this.propertyAddressRepository = propertyAddressRepository;
        this.buildingRepository = buildingRepository;
        this.floorRepository = floorRepository;
        this.unitRepository = unitRepository;
        this.propertyAmenityRepository = propertyAmenityRepository;
        this.propertyImageRepository = propertyImageRepository;
    }

<<<<<<< HEAD
=======
    // ============================================================
    // OWNER PROPERTY DETAILS
    // ============================================================

>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
    @Override
    @Transactional(readOnly = true)
    public PropertyDetailsResponse getPropertyDetails(Long propertyId) {

<<<<<<< HEAD
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        boolean isTenant = authentication != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_TENANT"));

        if (isTenant) {
            return getPropertyDetailsForTenant(propertyId);
        }

        return getPropertyDetailsForOwner(propertyId);
    }

    /**
     * OWNER FLOW: Reuses existing owner-scoped sub-services
     */
    private PropertyDetailsResponse getPropertyDetailsForOwner(Long propertyId) {

        /*
         * 1. PROPERTY
         */
        PropertyResponse property =
                propertyService.getMyPropertyById(propertyId);

        /*
         * 2. ADDRESS
         */
=======
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

>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
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

<<<<<<< HEAD
        /*
         * 3. BUILDINGS
         */
        List<BuildingResponse> buildingResponses =
                buildingService.getBuildingsByProperty(propertyId);
=======
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
>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb

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

<<<<<<< HEAD
                List<FloorResponse> floorResponses =
                        floorService.getFloorsByBuilding(
                                building.getBuildingId()
                        );
=======
                List<UnitResponse> units;

                if (publicView) {
>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb

                    // Tenant / public flow
                    units =
                            unitService
                                    .getPublicUnitsByFloor(
                                            floor.getFloorId());

                } else {

<<<<<<< HEAD
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
=======
                    // Owner flow
                    units =
                            unitService
                                    .getUnitsByFloor(
                                            floor.getFloorId());
>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
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

<<<<<<< HEAD
        /*
         * 6. AMENITIES
         */
        List<AmenityResponse> amenities =
                amenityService.getPropertyAmenities(propertyId);
=======
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

>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
        if (amenities == null) {
            amenities = new ArrayList<>();
        }

<<<<<<< HEAD
        /*
         * 7. IMAGES
         */
        List<PropertyImageResponse> images =
                propertyImageService.getImagesByProperty(propertyId);
=======
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

>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
        if (images == null) {
            images = new ArrayList<>();
        }

<<<<<<< HEAD
        /*
         * 8. BUILD FINAL RESPONSE
         */
=======
        // ========================================================
        // 7. BUILD FINAL RESPONSE
        // ========================================================

>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
        PropertyDetailsResponse response =
                new PropertyDetailsResponse();

        response.setProperty(property);
        response.setAddress(address);
        response.setBuildings(buildings);
        response.setAmenities(amenities);
        response.setImages(images);

<<<<<<< HEAD
        return response;
    }

    /**
     * TENANT FLOW: Exposes full property details ONLY when PropertyStatus.AVAILABLE
     */
    private PropertyDetailsResponse getPropertyDetailsForTenant(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Property not found with ID: " + propertyId));

        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new ResourceNotFoundException(
                    "Property not found or not available for browsing with ID: " + propertyId);
        }

        PropertyResponse propertyResponse = convertPropertyToResponse(property);

        PropertyAddressResponse address = propertyAddressRepository.findByProperty(property)
                .map(this::convertAddressToResponse)
                .orElse(null);

        List<BuildingDetailsResponse> buildings = new ArrayList<>();
        List<Building> buildingEntities = buildingRepository.findByProperty(property);
        if (buildingEntities != null) {
            for (Building building : buildingEntities) {
                if (building == null) continue;
                BuildingDetailsResponse buildingDetails = new BuildingDetailsResponse();
                buildingDetails.setBuilding(convertBuildingToResponse(building));

                List<FloorDetailsResponse> floors = new ArrayList<>();
                List<Floor> floorEntities = floorRepository.findByBuilding(building);
                if (floorEntities != null) {
                    for (Floor floor : floorEntities) {
                        if (floor == null) continue;
                        FloorDetailsResponse floorDetails = new FloorDetailsResponse();
                        floorDetails.setFloor(convertFloorToResponse(floor));

                        List<Unit> unitEntities = unitRepository.findByFloor(floor);
                        List<UnitResponse> unitResponses = unitEntities != null
                                ? unitEntities.stream().map(this::convertUnitToResponse).toList()
                                : new ArrayList<>();
                        floorDetails.setUnits(unitResponses);
                        floors.add(floorDetails);
                    }
                }
                buildingDetails.setFloors(floors);
                buildings.add(buildingDetails);
            }
        }

        List<AmenityResponse> amenities = propertyAmenityRepository.findByProperty(property)
                .stream()
                .map(PropertyAmenity::getAmenity)
                .filter(a -> a != null)
                .map(this::convertAmenityToResponse)
                .toList();

        List<PropertyImageResponse> images = propertyImageRepository.findByProperty(property)
                .stream()
                .map(this::convertImageToResponse)
                .toList();

        PropertyDetailsResponse response = new PropertyDetailsResponse();
        response.setProperty(propertyResponse);
        response.setAddress(address);
        response.setBuildings(buildings);
        response.setAmenities(amenities);
        response.setImages(images);

        return response;
    }

    private PropertyResponse convertPropertyToResponse(Property property) {
        PropertyResponse response = new PropertyResponse();
        response.setPropertyId(property.getPropertyId());
        response.setPropertyName(property.getPropertyName());
        response.setPropertyType(property.getPropertyType());
        response.setDescription(property.getDescription());
        response.setTotalArea(property.getTotalArea());
        response.setFurnishingStatus(property.getFurnishingStatus());
        response.setParkingAvailable(property.getParkingAvailable());
        response.setYearBuilt(property.getYearBuilt());
        response.setStatus(property.getStatus());
        if (property.getOwner() != null) {
            response.setOwnerId(property.getOwner().getId());
            response.setOwnerName(property.getOwner().getFirstName() + " " + property.getOwner().getLastName());
        }
        response.setCreatedAt(property.getCreatedAt());
        response.setUpdatedAt(property.getUpdatedAt());
        return response;
    }

    private PropertyAddressResponse convertAddressToResponse(PropertyAddress address) {
        PropertyAddressResponse response = new PropertyAddressResponse();
        response.setAddressId(address.getAddressId());
        response.setPropertyId(address.getProperty() != null ? address.getProperty().getPropertyId() : null);
        response.setAddressLine1(address.getAddressLine1());
        response.setAddressLine2(address.getAddressLine2());
        response.setArea(address.getArea());
        response.setAreaType(address.getAreaType());
        response.setCity(address.getCity());
        response.setState(address.getState());
        response.setCountry(address.getCountry());
        response.setPincode(address.getPincode());
        response.setLatitude(address.getLatitude());
        response.setLongitude(address.getLongitude());
        response.setCreatedAt(address.getCreatedAt());
        response.setUpdatedAt(address.getUpdatedAt());
        return response;
    }

    private BuildingResponse convertBuildingToResponse(Building building) {
        Property property = building.getProperty();
        return new BuildingResponse(
                building.getBuildingId(),
                building.getBuildingName(),
                building.getDescription(),
                building.getTotalFloors(),
                property != null ? property.getPropertyId() : null,
                property != null ? property.getPropertyName() : null,
                building.getCreatedAt(),
                building.getUpdatedAt()
        );
    }

    private FloorResponse convertFloorToResponse(Floor floor) {
        Building building = floor.getBuilding();
        Property property = building != null ? building.getProperty() : null;
        return new FloorResponse(
                floor.getFloorId(),
                floor.getFloorName(),
                floor.getFloorNumber(),
                building != null ? building.getBuildingId() : null,
                building != null ? building.getBuildingName() : null,
                property != null ? property.getPropertyId() : null,
                property != null ? property.getPropertyName() : null,
                floor.getCreatedAt(),
                floor.getUpdatedAt()
        );
    }

    private UnitResponse convertUnitToResponse(Unit unit) {
        Floor floor = unit.getFloor();
        Building building = floor != null ? floor.getBuilding() : null;
        Property property = building != null ? building.getProperty() : null;
        UnitResponse response = new UnitResponse();
        response.setUnitId(unit.getUnitId());
        response.setUnitNumber(unit.getUnitNumber());
        response.setUnitType(unit.getUnitType());
        response.setArea(unit.getArea());
        response.setBedrooms(unit.getBedrooms());
        response.setBathrooms(unit.getBathrooms());
        response.setMonthlyRent(unit.getMonthlyRent());
        response.setSecurityDeposit(unit.getSecurityDeposit());
        response.setStatus(unit.getStatus());
        response.setDescription(unit.getDescription());
        response.setFloorId(floor != null ? floor.getFloorId() : null);
        response.setFloorName(floor != null ? floor.getFloorName() : null);
        response.setFloorNumber(floor != null ? floor.getFloorNumber() : null);
        response.setBuildingId(building != null ? building.getBuildingId() : null);
        response.setBuildingName(building != null ? building.getBuildingName() : null);
        response.setPropertyId(property != null ? property.getPropertyId() : null);
        response.setPropertyName(property != null ? property.getPropertyName() : null);
        response.setCreatedAt(unit.getCreatedAt());
        response.setUpdatedAt(unit.getUpdatedAt());
        return response;
    }

    private AmenityResponse convertAmenityToResponse(Amenity amenity) {
        AmenityResponse response = new AmenityResponse();
        response.setAmenityId(amenity.getAmenityId());
        response.setAmenityName(amenity.getAmenityName());
        response.setDescription(amenity.getDescription());
        return response;
    }

    private PropertyImageResponse convertImageToResponse(PropertyImage image) {
        Property property = image.getProperty();
        PropertyImageResponse response = new PropertyImageResponse();
        response.setImageId(image.getImageId());
        response.setImageUrl(image.getImageUrl());
        response.setImageType(image.getImageType());
        response.setIsPrimary(image.getIsPrimary());
        response.setPropertyId(property != null ? property.getPropertyId() : null);
        response.setPropertyName(property != null ? property.getPropertyName() : null);
        response.setCreatedAt(image.getCreatedAt());
        response.setUpdatedAt(image.getUpdatedAt());
=======
>>>>>>> 18adac67e442380d340ed6c4dadc0aaa600c3ffb
        return response;
    }
}
