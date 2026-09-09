package com.rental.rental_management_backend.ai.serviceImpl;

import java.time.Year;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.ai.client.RentPredictionClient;
import com.rental.rental_management_backend.ai.dto.RentPredictionRequest;
import com.rental.rental_management_backend.ai.dto.RentPredictionResponse;
import com.rental.rental_management_backend.ai.service.RentPredictionService;
import com.rental.rental_management_backend.property.entity.Amenity;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyAddress;
import com.rental.rental_management_backend.property.entity.PropertyAmenity;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.repository.PropertyAddressRepository;
import com.rental.rental_management_backend.property.repository.PropertyAmenityRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;

@Service
public class RentPredictionServiceImpl implements RentPredictionService {

    private final UnitRepository unitRepository;
    private final PropertyAddressRepository propertyAddressRepository;
    private final PropertyAmenityRepository propertyAmenityRepository;
    private final RentPredictionClient rentPredictionClient;

    public RentPredictionServiceImpl(
            UnitRepository unitRepository,
            PropertyAddressRepository propertyAddressRepository,
            PropertyAmenityRepository propertyAmenityRepository,
            RentPredictionClient rentPredictionClient) {

        this.unitRepository = unitRepository;
        this.propertyAddressRepository = propertyAddressRepository;
        this.propertyAmenityRepository = propertyAmenityRepository;
        this.rentPredictionClient = rentPredictionClient;
    }

    @Override
    @Transactional(readOnly = true)
    public RentPredictionResponse predictRent(Long unitId) {

        // 1. Get Unit
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Unit not found with id: " + unitId));

        // 2. Get Floor
        Floor floor = unit.getFloor();

        if (floor == null) {
            throw new RuntimeException(
                    "Floor not found for unit id: " + unitId);
        }

        // 3. Get Building
        Building building = floor.getBuilding();

        if (building == null) {
            throw new RuntimeException(
                    "Building not found for unit id: " + unitId);
        }

        // 4. Get Property
        Property property = building.getProperty();

        if (property == null) {
            throw new RuntimeException(
                    "Property not found for unit id: " + unitId);
        }

        // 5. Get Property Address
        PropertyAddress address =
                propertyAddressRepository.findByProperty(property)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Property address not found for property id: "
                                                + property.getPropertyId()));

        // 6. Get Amenities
        List<PropertyAmenity> propertyAmenities =
                propertyAmenityRepository.findByProperty(property);

        // 7. Calculate property age
        Integer propertyAgeYears = null;

        if (property.getYearBuilt() != null) {

            int currentYear = Year.now().getValue();

            propertyAgeYears = Math.max(
                    currentYear - property.getYearBuilt(),
                    0
            );
        }

        // 8. Amenity flags
        boolean amenityParking = false;
        boolean amenityLift = false;
        boolean amenityGym = false;
        boolean amenitySecurity = false;
        boolean amenityPowerBackup = false;
        boolean amenityAirConditioning = false;
        boolean amenityWifi = false;
        boolean amenityGarden = false;

        for (PropertyAmenity propertyAmenity : propertyAmenities) {

            if (propertyAmenity == null) {
                continue;
            }

            Amenity amenity = propertyAmenity.getAmenity();

            if (amenity == null ||
                    amenity.getAmenityName() == null) {
                continue;
            }

            String amenityName = amenity.getAmenityName()
                    .trim()
                    .toLowerCase();

            switch (amenityName) {

                case "parking":
                    amenityParking = true;
                    break;

                case "lift":
                    amenityLift = true;
                    break;

                case "gym":
                    amenityGym = true;
                    break;

                case "security":
                    amenitySecurity = true;
                    break;

                case "power backup":
                    amenityPowerBackup = true;
                    break;

                case "air conditioning":
                    amenityAirConditioning = true;
                    break;

                case "wifi":
                case "wi-fi":
                case "wi fi":
                    amenityWifi = true;
                    break;

                case "garden":
                    amenityGarden = true;
                    break;

                default:
                    break;
            }
        }

        // 9. Create AI prediction request
        RentPredictionRequest request =
                new RentPredictionRequest();

        // Address
        request.setCity(address.getCity());
        request.setAreaLocality(address.getArea());

        if (address.getAreaType() != null) {
            request.setAreaType(
                    address.getAreaType().name());
        }

        // Unit
        request.setSizeSqft(unit.getArea());
        request.setBedroomsBhk(unit.getBedrooms());
        request.setBathrooms(unit.getBathrooms());

        // Floor / Building
        request.setFloor(floor.getFloorNumber());
        request.setTotalFloors(building.getTotalFloors());

        // Property
        if (property.getFurnishingStatus() != null) {
            request.setFurnishingStatus(
                    property.getFurnishingStatus().name());
        }

        request.setParkingAvailable(
                property.getParkingAvailable());

        request.setPropertyAgeYears(
                propertyAgeYears);

        if (property.getPropertyType() != null) {
            request.setPropertyType(
                    property.getPropertyType().name());
        }

        // Amenities
        request.setAmenityCount(
                propertyAmenities.size());

        request.setAmenityParking(
                amenityParking);

        request.setAmenityLift(
                amenityLift);

        request.setAmenityGym(
                amenityGym);

        request.setAmenitySecurity(
                amenitySecurity);

        request.setAmenityPowerBackup(
                amenityPowerBackup);

        request.setAmenityAirConditioning(
                amenityAirConditioning);

        request.setAmenityWifi(
                amenityWifi);

        request.setAmenityGarden(
                amenityGarden);

        // Location
        if (address.getLatitude() != null) {
            request.setLatitude(
                    address.getLatitude().doubleValue());
        }

        if (address.getLongitude() != null) {
            request.setLongitude(
                    address.getLongitude().doubleValue());
        }

        // 10. Call FastAPI AI service
        return rentPredictionClient.predictRent(request);
    }
}