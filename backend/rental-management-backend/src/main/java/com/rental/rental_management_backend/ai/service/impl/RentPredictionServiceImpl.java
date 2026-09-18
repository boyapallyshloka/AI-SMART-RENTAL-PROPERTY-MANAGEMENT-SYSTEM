
package com.rental.rental_management_backend.ai.service.impl;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.rental.rental_management_backend.ai.client.FastApiRentPredictionClient;
import com.rental.rental_management_backend.ai.dto.RentPredictionRequestDTO;
import com.rental.rental_management_backend.ai.dto.RentPredictionResponseDTO;
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
@Transactional(readOnly = true)
public class RentPredictionServiceImpl implements RentPredictionService {

    private final UnitRepository unitRepository;
    private final PropertyAddressRepository propertyAddressRepository;
    private final PropertyAmenityRepository propertyAmenityRepository;
    private final FastApiRentPredictionClient fastApiRentPredictionClient;

    public RentPredictionServiceImpl(
            UnitRepository unitRepository,
            PropertyAddressRepository propertyAddressRepository,
            PropertyAmenityRepository propertyAmenityRepository,
            FastApiRentPredictionClient fastApiRentPredictionClient) {

        this.unitRepository = unitRepository;
        this.propertyAddressRepository = propertyAddressRepository;
        this.propertyAmenityRepository = propertyAmenityRepository;
        this.fastApiRentPredictionClient = fastApiRentPredictionClient;
    }

    @Override
    public RentPredictionResponseDTO predictRent(Long unitId) {

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Unit not found with id: " + unitId));

        if (unit.getFloor() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit is not associated with a floor");
        }

        Floor floor = unit.getFloor();

        if (floor.getBuilding() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Floor is not associated with a building");
        }

        Building building = floor.getBuilding();

        if (building.getProperty() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Building is not associated with a property");
        }

        Property property = building.getProperty();

        PropertyAddress address = propertyAddressRepository
                .findByProperty(property)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Property address is required for rent prediction"));

        validateRequiredData(
                unit,
                floor,
                building,
                property,
                address);

        List<PropertyAmenity> propertyAmenities =
                propertyAmenityRepository.findByProperty(property);

        RentPredictionRequestDTO request =
                buildPredictionRequest(
                        unit,
                        floor,
                        building,
                        property,
                        address,
                        propertyAmenities);

        Map<String, Object> modelResponse =
                fastApiRentPredictionClient.predictRent(request);

        BigDecimal predictedRent =
                extractPredictedRent(modelResponse);

        RentPredictionResponseDTO response =
                new RentPredictionResponseDTO();

        response.setPropertyId(property.getPropertyId());
        response.setUnitId(unit.getUnitId());
        response.setPropertyName(property.getPropertyName());
        response.setCurrentMonthlyRent(unit.getMonthlyRent());
        response.setPredictedRent(predictedRent);
        response.setModelResponse(modelResponse);

        return response;
    }

    private RentPredictionRequestDTO buildPredictionRequest(
            Unit unit,
            Floor floor,
            Building building,
            Property property,
            PropertyAddress address,
            List<PropertyAmenity> propertyAmenities) {

        Integer propertyAgeYears =
                calculatePropertyAge(property.getYearBuilt());

        int amenityCount =
                propertyAmenities == null
                        ? 0
                        : propertyAmenities.size();

        RentPredictionRequestDTO request  = 
                new RentPredictionRequestDTO();

        // 1. city
        request.setCity(address.getCity());

        // 2. area_locality
        request.setArea_locality(address.getArea());

        // 3. area_type
        request.setArea_type(
                address.getAreaType() != null
                        ? address.getAreaType().name()
                        : null);

        // 4. size_sqft
        request.setSize_sqft(unit.getArea());

        // 5. bedrooms_bhk
        request.setBedrooms_bhk(unit.getBedrooms());

        // 6. bathrooms
        request.setBathrooms(unit.getBathrooms());

        // 7. floor
        request.setFloor(floor.getFloorNumber());

        // 8. total_floors
        request.setTotal_floors(building.getTotalFloors());

        // 9. furnishing_status
        request.setFurnishing_status(
                property.getFurnishingStatus() != null
                        ? property.getFurnishingStatus().name()
                        : null);

        // 10. parking_available
        request.setParking_available(
                property.getParkingAvailable());

        // 11. property_age_years
        request.setProperty_age_years(propertyAgeYears);

        // 12. amenity_count
        request.setAmenity_count(amenityCount);

        // 13. amenity_parking
        request.setAmenity_parking(
                hasAmenity(propertyAmenities, "parking"));

        // 14. amenity_lift
        request.setAmenity_lift(
                hasAmenity(propertyAmenities, "lift"));

        // 15. amenity_gym
        request.setAmenity_gym(
                hasAmenity(propertyAmenities, "gym"));

        // 16. amenity_security
        request.setAmenity_security(
                hasAmenity(propertyAmenities, "security"));

        // 17. amenity_power_backup
        request.setAmenity_power_backup(
                hasAmenity(propertyAmenities, "power backup")
                        || hasAmenity(propertyAmenities, "powerbackup")
                        || hasAmenity(propertyAmenities, "generator"));

        // 18. amenity_air_conditioning
        request.setAmenity_air_conditioning(
                hasAmenity(propertyAmenities, "air conditioning")
                        || hasAmenity(propertyAmenities, "air-conditioning")
                        || hasAmenity(propertyAmenities, "ac"));

        // 19. amenity_wifi
        request.setAmenity_wifi(
                hasAmenity(propertyAmenities, "wifi")
                        || hasAmenity(propertyAmenities, "wi-fi")
                        || hasAmenity(propertyAmenities, "internet"));

        // 20. amenity_garden
        request.setAmenity_garden(
                hasAmenity(propertyAmenities, "garden")
                        || hasAmenity(propertyAmenities, "park"));

        // 21. latitude
        request.setLatitude(
                address.getLatitude() != null
                        ? address.getLatitude().doubleValue()
                        : null);

        // 22. longitude
        request.setLongitude(
                address.getLongitude() != null
                        ? address.getLongitude().doubleValue()
                        : null);

        // 23. property_type
        request.setProperty_type(
                property.getPropertyType() != null
                        ? property.getPropertyType().name()
                        : null);

        return request;
    }

    private Integer calculatePropertyAge(Integer yearBuilt) {

        if (yearBuilt == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property yearBuilt is required for rent prediction");
        }

        int currentYear = Year.now().getValue();

        int age = currentYear - yearBuilt;

        if (age < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property yearBuilt cannot be greater than the current year");
        }

        return age;
    }

    private boolean hasAmenity(
            List<PropertyAmenity> propertyAmenities,
            String keyword) {

        if (propertyAmenities == null
                || propertyAmenities.isEmpty()) {
            return false;
        }

        String normalizedKeyword = normalize(keyword);

        for (PropertyAmenity propertyAmenity : propertyAmenities) {

            if (propertyAmenity == null
                    || propertyAmenity.getAmenity() == null) {
                continue;
            }

            Amenity amenity = propertyAmenity.getAmenity();

            if (amenity.getAmenityName() == null) {
                continue;
            }

            String amenityName =
                    normalize(amenity.getAmenityName());

            if (amenityName.contains(normalizedKeyword)) {
                return true;
            }
        }

        return false;
    }

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .toLowerCase(Locale.ROOT)
                .replace("-", " ")
                .replace("_", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private void validateRequiredData(
            Unit unit,
            Floor floor,
            Building building,
            Property property,
            PropertyAddress address) {

        if (address.getCity() == null
                || address.getCity().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property city is required for rent prediction");
        }

        if (address.getArea() == null
                || address.getArea().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property area/locality is required for rent prediction");
        }

        if (address.getAreaType() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property area type is required for rent prediction");
        }

        if (unit.getArea() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit area is required for rent prediction");
        }

        if (unit.getBedrooms() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit bedrooms are required for rent prediction");
        }

        if (unit.getBathrooms() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit bathrooms are required for rent prediction");
        }

        if (floor.getFloorNumber() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Floor number is required for rent prediction");
        }

        if (building.getTotalFloors() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Building totalFloors is required for rent prediction");
        }

        if (property.getFurnishingStatus() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property furnishingStatus is required for rent prediction");
        }

        if (property.getParkingAvailable() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property parkingAvailable is required for rent prediction");
        }

        if (address.getLatitude() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property latitude is required for rent prediction");
        }

        if (address.getLongitude() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property longitude is required for rent prediction");
        }

        if (property.getPropertyType() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Property type is required for rent prediction");
        }
    }

    private BigDecimal extractPredictedRent(
            Map<String, Object> modelResponse) {

        if (modelResponse == null) {
            return null;
        }

        Object value =
                modelResponse.get("predicted_rent");

        if (value == null) {
            value = modelResponse.get("predictedRent");
        }

        if (value == null) {
            value = modelResponse.get("prediction");
        }

        if (value == null) {
            value = modelResponse.get("rent");
        }

        if (value == null) {
            return null;
        }

        try {

            if (value instanceof Number number) {

                return BigDecimal.valueOf(
                        number.doubleValue());
            }

            return new BigDecimal(
                    value.toString());

        } catch (NumberFormatException e) {

            return null;
        }
    }
}
