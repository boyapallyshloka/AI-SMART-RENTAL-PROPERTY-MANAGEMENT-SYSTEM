package com.rental.rental_management_backend.property;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

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
import com.rental.rental_management_backend.property.enums.PropertyStatus;
import com.rental.rental_management_backend.property.enums.PropertyType;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.enums.UnitType;
import com.rental.rental_management_backend.property.service.AmenityService;
import com.rental.rental_management_backend.property.service.BuildingService;
import com.rental.rental_management_backend.property.service.FloorService;
import com.rental.rental_management_backend.property.service.PropertyAddressService;
import com.rental.rental_management_backend.property.service.PropertyImageService;
import com.rental.rental_management_backend.property.service.PropertyService;
import com.rental.rental_management_backend.property.service.UnitService;
import com.rental.rental_management_backend.property.serviceimpl.PropertyDetailsServiceImpl;

@ExtendWith(MockitoExtension.class)
class PropertyDetailsServiceTest {

    @Mock
    private PropertyService propertyService;

    @Mock
    private PropertyAddressService propertyAddressService;

    @Mock
    private BuildingService buildingService;

    @Mock
    private FloorService floorService;

    @Mock
    private UnitService unitService;

    @Mock
    private AmenityService amenityService;

    @Mock
    private PropertyImageService propertyImageService;

    private PropertyDetailsServiceImpl propertyDetailsService;

    @BeforeEach
    void setUp() {
        propertyDetailsService = new PropertyDetailsServiceImpl(
                propertyService,
                propertyAddressService,
                buildingService,
                floorService,
                unitService,
                amenityService,
                propertyImageService
        );
    }

    // =========================================================================
    // A. FULL HIERARCHY TEST
    // =========================================================================
    @Test
    @DisplayName("A. Full hierarchy: property with address, buildings, floors, units, amenities, and images")
    void testFullHierarchyDetails() {
        Long propertyId = 1L;

        // Property
        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        property.setPropertyName("Green Valley Apartments");
        property.setPropertyType(PropertyType.APARTMENT);
        property.setStatus(PropertyStatus.AVAILABLE);
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        // Address
        PropertyAddressResponse address = new PropertyAddressResponse();
        address.setAddressId(1L);
        address.setPropertyId(propertyId);
        address.setAddressLine1("Plot 123");
        address.setCity("Hyderabad");
        when(propertyAddressService.getAddressByPropertyId(propertyId)).thenReturn(address);

        // Building
        BuildingResponse building = new BuildingResponse();
        building.setBuildingId(10L);
        building.setBuildingName("Building A");
        building.setTotalFloors(5);
        when(buildingService.getBuildingsByProperty(propertyId)).thenReturn(List.of(building));

        // Floor
        FloorResponse floor = new FloorResponse();
        floor.setFloorId(100L);
        floor.setFloorName("Ground Floor");
        floor.setFloorNumber(0);
        when(floorService.getFloorsByBuilding(10L)).thenReturn(List.of(floor));

        // Unit
        UnitResponse unit = new UnitResponse();
        unit.setUnitId(1000L);
        unit.setUnitNumber("G-101");
        unit.setUnitType(UnitType.APARTMENT);
        unit.setBedrooms(2);
        unit.setBathrooms(2);
        unit.setMonthlyRent(new BigDecimal("20000.00"));
        unit.setSecurityDeposit(new BigDecimal("40000.00"));
        unit.setStatus(UnitStatus.VACANT);
        when(unitService.getUnitsByFloor(100L)).thenReturn(List.of(unit));

        // Amenity
        AmenityResponse amenity = new AmenityResponse();
        amenity.setAmenityId(50L);
        amenity.setAmenityName("Covered Parking");
        when(amenityService.getPropertyAmenities(propertyId)).thenReturn(List.of(amenity));

        // Image
        PropertyImageResponse image = new PropertyImageResponse();
        image.setImageId(500L);
        image.setImageUrl("/uploads/property-images/1/test.jpg");
        when(propertyImageService.getImagesByProperty(propertyId)).thenReturn(List.of(image));

        // Execute
        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        // Verify
        assertNotNull(response);
        assertNotNull(response.getProperty());
        assertEquals("Green Valley Apartments", response.getProperty().getPropertyName());

        assertNotNull(response.getAddress());
        assertEquals("Plot 123", response.getAddress().getAddressLine1());
        assertEquals("Hyderabad", response.getAddress().getCity());

        assertEquals(1, response.getBuildings().size());
        BuildingDetailsResponse bDetails = response.getBuildings().get(0);
        assertEquals("Building A", bDetails.getBuilding().getBuildingName());

        assertEquals(1, bDetails.getFloors().size());
        FloorDetailsResponse fDetails = bDetails.getFloors().get(0);
        assertEquals("Ground Floor", fDetails.getFloor().getFloorName());

        assertEquals(1, fDetails.getUnits().size());
        UnitResponse uResp = fDetails.getUnits().get(0);
        assertEquals("G-101", uResp.getUnitNumber());
        assertEquals(2, uResp.getBedrooms());
        assertEquals(2, uResp.getBathrooms());
        assertEquals(new BigDecimal("20000.00"), uResp.getMonthlyRent());
        assertEquals(new BigDecimal("40000.00"), uResp.getSecurityDeposit());
        assertEquals(UnitStatus.VACANT, uResp.getStatus());

        assertEquals(1, response.getAmenities().size());
        assertEquals("Covered Parking", response.getAmenities().get(0).getAmenityName());

        assertEquals(1, response.getImages().size());
        assertEquals("/uploads/property-images/1/test.jpg", response.getImages().get(0).getImageUrl());
    }

    // =========================================================================
    // B. PROPERTY WITH NO OPTIONAL RELATED RECORDS (PROPERTY 4 SCENARIO)
    // =========================================================================
    @Test
    @DisplayName("B. Property 4 scenario: no address, no buildings, no amenities, no images -> HTTP 200, address=null, empty arrays")
    void testNoOptionalRelatedRecords_Property4Scenario() {
        Long propertyId = 4L;

        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        property.setPropertyName("sunset");
        property.setPropertyType(PropertyType.APARTMENT);
        property.setStatus(PropertyStatus.AVAILABLE);
        property.setOwnerId(7L);
        property.setOwnerName("shloka shloka");
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        // Address lookup throws ResourceNotFoundException (no row in property_addresses)
        when(propertyAddressService.getAddressByPropertyId(propertyId))
                .thenThrow(new ResourceNotFoundException("Address not found for this property"));

        // No buildings
        when(buildingService.getBuildingsByProperty(propertyId))
                .thenReturn(Collections.emptyList());

        // No amenities
        when(amenityService.getPropertyAmenities(propertyId))
                .thenReturn(Collections.emptyList());

        // No images
        when(propertyImageService.getImagesByProperty(propertyId))
                .thenReturn(Collections.emptyList());

        // Execute
        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        // Verify
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getProperty(), "Property section must be populated");
        assertEquals(4L, response.getProperty().getPropertyId());
        assertEquals("sunset", response.getProperty().getPropertyName());
        assertEquals(7L, response.getProperty().getOwnerId());

        assertNull(response.getAddress(), "Address must safely resolve to null when not found");
        assertNotNull(response.getBuildings(), "Buildings collection must be a non-null empty list");
        assertTrue(response.getBuildings().isEmpty(), "Buildings should be empty");

        assertNotNull(response.getAmenities(), "Amenities collection must be a non-null empty list");
        assertTrue(response.getAmenities().isEmpty(), "Amenities should be empty");

        assertNotNull(response.getImages(), "Images collection must be a non-null empty list");
        assertTrue(response.getImages().isEmpty(), "Images should be empty");
    }

    // =========================================================================
    // C. PARTIAL HIERARCHY TESTS
    // =========================================================================
    @Test
    @DisplayName("C1. Partial hierarchy: building with no floors, property with no amenities or images")
    void testPartialHierarchy_BuildingWithNoFloors() {
        Long propertyId = 2L;

        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        property.setPropertyName("Sunrise Apartments");
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        when(propertyAddressService.getAddressByPropertyId(propertyId))
                .thenThrow(new ResourceNotFoundException("Address not found for this property"));

        BuildingResponse building = new BuildingResponse();
        building.setBuildingId(20L);
        building.setBuildingName("Tower 1");
        when(buildingService.getBuildingsByProperty(propertyId)).thenReturn(List.of(building));

        // Building has no floors
        when(floorService.getFloorsByBuilding(20L)).thenReturn(Collections.emptyList());

        when(amenityService.getPropertyAmenities(propertyId)).thenReturn(Collections.emptyList());
        when(propertyImageService.getImagesByProperty(propertyId)).thenReturn(Collections.emptyList());

        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        assertNotNull(response);
        assertEquals(1, response.getBuildings().size());
        BuildingDetailsResponse bDetails = response.getBuildings().get(0);
        assertEquals("Tower 1", bDetails.getBuilding().getBuildingName());
        assertNotNull(bDetails.getFloors());
        assertTrue(bDetails.getFloors().isEmpty());
    }

    @Test
    @DisplayName("C2. Partial hierarchy: floor with no units")
    void testPartialHierarchy_FloorWithNoUnits() {
        Long propertyId = 2L;

        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        when(propertyAddressService.getAddressByPropertyId(propertyId))
                .thenThrow(new ResourceNotFoundException("Address not found for this property"));

        BuildingResponse building = new BuildingResponse();
        building.setBuildingId(20L);
        when(buildingService.getBuildingsByProperty(propertyId)).thenReturn(List.of(building));

        FloorResponse floor = new FloorResponse();
        floor.setFloorId(200L);
        floor.setFloorName("Floor 1");
        when(floorService.getFloorsByBuilding(20L)).thenReturn(List.of(floor));

        // Floor has no units
        when(unitService.getUnitsByFloor(200L)).thenReturn(Collections.emptyList());

        when(amenityService.getPropertyAmenities(propertyId)).thenReturn(Collections.emptyList());
        when(propertyImageService.getImagesByProperty(propertyId)).thenReturn(Collections.emptyList());

        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        assertNotNull(response);
        BuildingDetailsResponse bDetails = response.getBuildings().get(0);
        FloorDetailsResponse fDetails = bDetails.getFloors().get(0);
        assertNotNull(fDetails.getUnits());
        assertTrue(fDetails.getUnits().isEmpty());
    }

    @Test
    @DisplayName("C3. Null collections safely handled: services returning null default to empty lists")
    void testNullCollectionsSafelyHandled() {
        Long propertyId = 3L;

        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        when(propertyAddressService.getAddressByPropertyId(propertyId))
                .thenThrow(new ResourceNotFoundException("Address not found"));

        when(buildingService.getBuildingsByProperty(propertyId)).thenReturn(null);
        when(amenityService.getPropertyAmenities(propertyId)).thenReturn(null);
        when(propertyImageService.getImagesByProperty(propertyId)).thenReturn(null);

        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        assertNotNull(response);
        assertNotNull(response.getBuildings());
        assertTrue(response.getBuildings().isEmpty());
        assertNotNull(response.getAmenities());
        assertTrue(response.getAmenities().isEmpty());
        assertNotNull(response.getImages());
        assertTrue(response.getImages().isEmpty());
    }

    // =========================================================================
    // D. OWNER ACCESS TEST
    // =========================================================================
    @Test
    @DisplayName("D. Owner access: authenticated owner receives complete property details")
    void testOwnerAccess() {
        Long propertyId = 4L;
        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        property.setOwnerId(7L);
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        when(propertyAddressService.getAddressByPropertyId(propertyId))
                .thenThrow(new ResourceNotFoundException("Address not found"));
        when(buildingService.getBuildingsByProperty(propertyId)).thenReturn(Collections.emptyList());
        when(amenityService.getPropertyAmenities(propertyId)).thenReturn(Collections.emptyList());
        when(propertyImageService.getImagesByProperty(propertyId)).thenReturn(Collections.emptyList());

        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        assertNotNull(response);
        assertEquals(7L, response.getProperty().getOwnerId());
        verify(propertyService).getMyPropertyById(propertyId);
    }

    // =========================================================================
    // E. CROSS-OWNER / UNAUTHORIZED ACCESS TEST
    // =========================================================================
    @Test
    @DisplayName("E. Cross-owner access: throws ResourceNotFoundException (clean 404, not 500)")
    void testCrossOwnerAccess_ThrowsResourceNotFoundException() {
        Long propertyId = 4L;

        // When a different owner attempts to access property 4, getMyPropertyById throws ResourceNotFoundException
        when(propertyService.getMyPropertyById(propertyId))
                .thenThrow(new ResourceNotFoundException("Property not found or you do not have permission"));

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> propertyDetailsService.getPropertyDetails(propertyId)
        );

        assertEquals("Property not found or you do not have permission", ex.getMessage());
    }

    // =========================================================================
    // F. UNIT MAPPING VERIFICATION
    // =========================================================================
    @Test
    @DisplayName("F. Unit mapping: verifies bedrooms, bathrooms, rent, deposit, and status from Unit data")
    void testUnitMapping() {
        Long propertyId = 1L;

        PropertyResponse property = new PropertyResponse();
        property.setPropertyId(propertyId);
        when(propertyService.getMyPropertyById(propertyId)).thenReturn(property);

        when(propertyAddressService.getAddressByPropertyId(propertyId))
                .thenThrow(new ResourceNotFoundException("Address not found"));

        BuildingResponse building = new BuildingResponse();
        building.setBuildingId(1L);
        when(buildingService.getBuildingsByProperty(propertyId)).thenReturn(List.of(building));

        FloorResponse floor = new FloorResponse();
        floor.setFloorId(1L);
        when(floorService.getFloorsByBuilding(1L)).thenReturn(List.of(floor));

        UnitResponse unit = new UnitResponse();
        unit.setUnitId(99L);
        unit.setUnitNumber("301-B");
        unit.setUnitType(UnitType.APARTMENT);
        unit.setBedrooms(3);
        unit.setBathrooms(3);
        unit.setMonthlyRent(new BigDecimal("35000.00"));
        unit.setSecurityDeposit(new BigDecimal("70000.00"));
        unit.setStatus(UnitStatus.OCCUPIED);
        when(unitService.getUnitsByFloor(1L)).thenReturn(List.of(unit));

        when(amenityService.getPropertyAmenities(propertyId)).thenReturn(Collections.emptyList());
        when(propertyImageService.getImagesByProperty(propertyId)).thenReturn(Collections.emptyList());

        PropertyDetailsResponse response = propertyDetailsService.getPropertyDetails(propertyId);

        UnitResponse mappedUnit = response.getBuildings().get(0).getFloors().get(0).getUnits().get(0);
        assertEquals(3, mappedUnit.getBedrooms());
        assertEquals(3, mappedUnit.getBathrooms());
        assertEquals(new BigDecimal("35000.00"), mappedUnit.getMonthlyRent());
        assertEquals(new BigDecimal("70000.00"), mappedUnit.getSecurityDeposit());
        assertEquals(UnitStatus.OCCUPIED, mappedUnit.getStatus());
        assertEquals("301-B", mappedUnit.getUnitNumber());
    }
}
