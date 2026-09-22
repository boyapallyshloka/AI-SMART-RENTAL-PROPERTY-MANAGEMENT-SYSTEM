package com.rental.rental_management_backend.property;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.dto.BuildingRequest;
import com.rental.rental_management_backend.property.dto.BuildingResponse;
import com.rental.rental_management_backend.property.dto.FloorRequest;
import com.rental.rental_management_backend.property.dto.FloorResponse;
import com.rental.rental_management_backend.property.dto.UnitRequest;
import com.rental.rental_management_backend.property.dto.UnitResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.enums.UnitType;
import com.rental.rental_management_backend.property.repository.BuildingRepository;
import com.rental.rental_management_backend.property.repository.PropertyAddressRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.BuildingService;
import com.rental.rental_management_backend.property.service.FloorService;
import com.rental.rental_management_backend.property.service.UnitService;

@SpringBootTest
public class Phase4LiveVerificationTest {

    @Autowired
    private UnitService unitService;

    @Autowired
    private BuildingService buildingService;

    @Autowired
    private FloorService floorService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private PropertyAddressRepository propertyAddressRepository;

    @Autowired
    private UserRepository userRepository;

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        email,
                        "password",
                        List.of(new SimpleGrantedAuthority("ROLE_PROPERTY_OWNER"))
                )
        );
    }

    @Test
    @DisplayName("STEP 10 — LIVE NEON VERIFICATION: Property 1 -> Building A -> Ground Floor -> G-101")
    void testStep10_Property1LiveVerification() {
        System.out.println("=================================================");
        System.out.println("🚀 STEP 10: PROPERTY 1 LIVE VERIFICATION");
        System.out.println("=================================================");

        // Owner A is owner.test@gmail.com who owns Property 1
        authenticateAs("owner.test@gmail.com");

        // 1. Verify GET /api/units/floor/{floorId} (Floor 1 is Ground Floor in Building 1 of Property 1)
        List<UnitResponse> floorUnits = unitService.getUnitsByFloor(1L);
        assertNotNull(floorUnits, "Floor 1 units list must not be null");
        assertTrue(floorUnits.size() >= 1, "Floor 1 must contain at least 1 unit (G-101)");

        UnitResponse g101FromFloor = floorUnits.stream()
                .filter(u -> "G-101".equals(u.getUnitNumber()))
                .findFirst()
                .orElse(null);
        assertNotNull(g101FromFloor, "G-101 must exist on Floor 1");

        System.out.println("✅ Found G-101 from Floor 1 units: ID=" + g101FromFloor.getUnitId());
        assertEquals("G-101", g101FromFloor.getUnitNumber());
        assertEquals(UnitType.APARTMENT, g101FromFloor.getUnitType());
        assertEquals(1000.0, g101FromFloor.getArea());
        assertEquals(2, g101FromFloor.getBedrooms());
        assertEquals(2, g101FromFloor.getBathrooms());
        assertEquals(new BigDecimal("20000.00"), g101FromFloor.getMonthlyRent());
        assertEquals(new BigDecimal("40000.00"), g101FromFloor.getSecurityDeposit());
        assertEquals(UnitStatus.VACANT, g101FromFloor.getStatus());
        assertEquals("Spacious two-bedroom apartment on the ground floor.", g101FromFloor.getDescription());
        assertEquals(1L, g101FromFloor.getFloorId());

        // 2. Verify GET /api/units/{unitId}
        UnitResponse g101Direct = unitService.getUnitById(g101FromFloor.getUnitId());
        assertNotNull(g101Direct, "Unit direct get must succeed");
        assertEquals(g101FromFloor.getUnitId(), g101Direct.getUnitId());
        assertEquals("G-101", g101Direct.getUnitNumber());
        assertEquals(UnitType.APARTMENT, g101Direct.getUnitType());
        assertEquals(1000.0, g101Direct.getArea());
        assertEquals(2, g101Direct.getBedrooms());
        assertEquals(2, g101Direct.getBathrooms());
        assertEquals(new BigDecimal("20000.00"), g101Direct.getMonthlyRent());
        assertEquals(new BigDecimal("40000.00"), g101Direct.getSecurityDeposit());
        assertEquals(UnitStatus.VACANT, g101Direct.getStatus());
        assertEquals("Spacious two-bedroom apartment on the ground floor.", g101Direct.getDescription());
        assertEquals(1L, g101Direct.getFloorId());
        assertEquals("Ground Floor", g101Direct.getFloorName());
        assertEquals(0, g101Direct.getFloorNumber());
        assertEquals(1L, g101Direct.getBuildingId());
        assertEquals("Building A", g101Direct.getBuildingName());
        assertEquals(1L, g101Direct.getPropertyId());
        assertEquals("Green Valley Apartments", g101Direct.getPropertyName());

        System.out.println("✅ Step 10 Verified successfully: G-101 all fields match live Neon DB.");
    }

    @Test
    @DisplayName("STEP 11 — UNIT CRUD TEST: Property 4 Temporary Unit CRUD & Full Cleanup")
    void testStep11_Property4UnitCrudAndCleanup() {
        System.out.println("=================================================");
        System.out.println("🚀 STEP 11: PROPERTY 4 UNIT CRUD & CLEANUP");
        System.out.println("=================================================");

        // Property 4 belongs to boyapallyshloka@gmail.com
        authenticateAs("boyapallyshloka@gmail.com");

        Property prop4 = propertyRepository.findById(4L).orElseThrow();
        User owner7 = userRepository.findByEmail("boyapallyshloka@gmail.com").orElseThrow();
        assertEquals(owner7.getId(), prop4.getOwner().getId(), "Property 4 must belong to boyapallyshloka@gmail.com");

        List<Building> buildingsBefore = buildingRepository.findByProperty(prop4);
        assertEquals(0, buildingsBefore.size(), "Property 4 must have 0 buildings before test");

        boolean addressBefore = propertyAddressRepository.existsByProperty(prop4);
        assertTrue(!addressBefore, "Property 4 address must be null before test");

        // 1. Create temporary Building under Property 4
        BuildingRequest bReq = new BuildingRequest();
        bReq.setBuildingName("Test Building");
        bReq.setDescription("Temporary building for Phase 4 verification");
        bReq.setTotalFloors(1);
        bReq.setPropertyId(4L);

        BuildingResponse bRes = buildingService.createBuilding(bReq);
        assertNotNull(bRes);
        Long tempBuildingId = bRes.getBuildingId();
        System.out.println("Created temporary building ID: " + tempBuildingId);

        try {
            // 2. Create temporary Floor under Test Building
            FloorRequest fReq = new FloorRequest();
            fReq.setFloorName("Test Floor");
            fReq.setFloorNumber(1);
            fReq.setBuildingId(tempBuildingId);

            FloorResponse fRes = floorService.createFloor(fReq);
            assertNotNull(fRes);
            Long tempFloorId = fRes.getFloorId();
            System.out.println("Created temporary floor ID: " + tempFloorId);

            try {
                // 3. Create Unit with exact values requested
                UnitRequest uReq = new UnitRequest();
                uReq.setUnitNumber("TEST-PH-501");
                uReq.setUnitType(UnitType.APARTMENT);
                uReq.setArea(1500.0);
                uReq.setBedrooms(3);
                uReq.setBathrooms(3);
                uReq.setMonthlyRent(new BigDecimal("75000.00"));
                uReq.setSecurityDeposit(new BigDecimal("150000.00"));
                uReq.setStatus(UnitStatus.VACANT);
                uReq.setDescription("Phase 4 temporary verification unit");
                uReq.setFloorId(tempFloorId);

                UnitResponse createdUnit = unitService.createUnit(uReq);
                assertNotNull(createdUnit, "POST unit must succeed");
                Long tempUnitId = createdUnit.getUnitId();
                System.out.println("Created temporary unit ID: " + tempUnitId);

                // 4. GET the unit and verify every field
                UnitResponse fetchedUnit = unitService.getUnitById(tempUnitId);
                assertNotNull(fetchedUnit);
                assertEquals("TEST-PH-501", fetchedUnit.getUnitNumber());
                assertEquals(UnitType.APARTMENT, fetchedUnit.getUnitType());
                assertEquals(1500.0, fetchedUnit.getArea());
                assertEquals(3, fetchedUnit.getBedrooms());
                assertEquals(3, fetchedUnit.getBathrooms());
                assertEquals(new BigDecimal("75000.00"), fetchedUnit.getMonthlyRent());
                assertEquals(new BigDecimal("150000.00"), fetchedUnit.getSecurityDeposit());
                assertEquals(UnitStatus.VACANT, fetchedUnit.getStatus());
                assertEquals("Phase 4 temporary verification unit", fetchedUnit.getDescription());
                assertEquals(tempFloorId, fetchedUnit.getFloorId());
                assertEquals("Test Floor", fetchedUnit.getFloorName());
                assertEquals("Test Building", fetchedUnit.getBuildingName());
                assertEquals("sunset", fetchedUnit.getPropertyName());
                System.out.println("✅ GET unit verified all initial fields.");

                // 5. Update:
                // monthlyRent: 80000
                // securityDeposit: 160000
                // bedrooms: 4
                // bathrooms: 3
                // description: "Phase 4 updated verification unit"
                UnitRequest updateReq = new UnitRequest();
                updateReq.setUnitNumber("TEST-PH-501");
                updateReq.setUnitType(UnitType.APARTMENT);
                updateReq.setArea(1500.0);
                updateReq.setBedrooms(4);
                updateReq.setBathrooms(3);
                updateReq.setMonthlyRent(new BigDecimal("80000.00"));
                updateReq.setSecurityDeposit(new BigDecimal("160000.00"));
                updateReq.setStatus(UnitStatus.VACANT);
                updateReq.setDescription("Phase 4 updated verification unit");
                updateReq.setFloorId(tempFloorId);

                UnitResponse updatedUnit = unitService.updateUnit(tempUnitId, updateReq);
                assertNotNull(updatedUnit, "PUT unit must succeed");

                // 6. Verify through GET
                UnitResponse fetchedAfterUpdate = unitService.getUnitById(tempUnitId);
                assertEquals(new BigDecimal("80000.00"), fetchedAfterUpdate.getMonthlyRent());
                assertEquals(new BigDecimal("160000.00"), fetchedAfterUpdate.getSecurityDeposit());
                assertEquals(4, fetchedAfterUpdate.getBedrooms());
                assertEquals(3, fetchedAfterUpdate.getBathrooms());
                assertEquals("Phase 4 updated verification unit", fetchedAfterUpdate.getDescription());
                System.out.println("✅ GET verified all updated fields.");

                // 7. Delete Unit
                unitService.deleteUnit(tempUnitId);
                assertThrows(ResourceNotFoundException.class, () -> unitService.getUnitById(tempUnitId),
                        "Deleted unit must throw ResourceNotFoundException");
                System.out.println("✅ Unit deleted.");

            } finally {
                // Delete Floor
                floorService.deleteFloor(tempFloorId);
                assertThrows(ResourceNotFoundException.class, () -> floorService.getFloorById(tempFloorId),
                        "Deleted floor must throw ResourceNotFoundException");
                System.out.println("✅ Floor deleted.");
            }
        } finally {
            // Delete Building
            buildingService.deleteBuilding(tempBuildingId);
            assertThrows(ResourceNotFoundException.class, () -> buildingService.getBuildingById(tempBuildingId),
                    "Deleted building must throw ResourceNotFoundException");
            System.out.println("✅ Building deleted.");
        }

        // 8. Confirm Property 4 still has 0 buildings and address=null
        List<Building> buildingsAfter = buildingRepository.findByProperty(prop4);
        assertEquals(0, buildingsAfter.size(), "Property 4 must have 0 buildings after cleanup");

        boolean addressAfter = propertyAddressRepository.existsByProperty(prop4);
        assertTrue(!addressAfter, "Property 4 address must remain null after cleanup");

        System.out.println("✅ Step 11 Completed: Property 4 has 0 buildings and address=null. Cleaned up completely.");
    }

    @Test
    @DisplayName("STEP 12A — CROSS-OWNER SECURITY: Owner B cannot GET Owner A unit")
    void testStep12a_OwnerBCannotGetAnotherOwnersUnit() {
        authenticateAs("boyapallyshloka@gmail.com");
        ResourceNotFoundException getEx = assertThrows(ResourceNotFoundException.class, () -> {
            unitService.getUnitById(1L);
        }, "Owner B attempting to GET Owner A unit must throw ResourceNotFoundException (404)");
        System.out.println("✅ 12A: Owner B GET Owner A unit returned 404: " + getEx.getMessage());
    }

    @Test
    @DisplayName("STEP 12B — CROSS-OWNER SECURITY: Owner B cannot PUT Owner A unit")
    void testStep12b_OwnerBCannotUpdateAnotherOwnersUnit() {
        authenticateAs("boyapallyshloka@gmail.com");
        UnitRequest putReq = new UnitRequest();
        putReq.setUnitNumber("HACKED-101");
        putReq.setUnitType(UnitType.APARTMENT);
        putReq.setArea(1000.0);
        putReq.setBedrooms(2);
        putReq.setBathrooms(2);
        putReq.setMonthlyRent(new BigDecimal("1.00"));
        putReq.setSecurityDeposit(new BigDecimal("1.00"));
        putReq.setFloorId(1L);

        ResourceNotFoundException putEx = assertThrows(ResourceNotFoundException.class, () -> {
            unitService.updateUnit(1L, putReq);
        }, "Owner B attempting to PUT Owner A unit must throw ResourceNotFoundException (404)");
        System.out.println("✅ 12B: Owner B PUT Owner A unit returned 404: " + putEx.getMessage());
    }

    @Test
    @DisplayName("STEP 12C — CROSS-OWNER SECURITY: Owner B cannot DELETE Owner A unit")
    void testStep12c_OwnerBCannotDeleteAnotherOwnersUnit() {
        authenticateAs("boyapallyshloka@gmail.com");
        ResourceNotFoundException delEx = assertThrows(ResourceNotFoundException.class, () -> {
            unitService.deleteUnit(1L);
        }, "Owner B attempting to DELETE Owner A unit must throw ResourceNotFoundException (404)");
        System.out.println("✅ 12C: Owner B DELETE Owner A unit returned 404: " + delEx.getMessage());
    }

    @Test
    @DisplayName("STEP 12D — CROSS-OWNER SECURITY: Owner B cannot GET units through Owner A floor")
    void testStep12d_OwnerBCannotGetUnitsThroughAnotherOwnersFloor() {
        authenticateAs("boyapallyshloka@gmail.com");
        ResourceNotFoundException floorEx = assertThrows(ResourceNotFoundException.class, () -> {
            unitService.getUnitsByFloor(1L);
        }, "Owner B attempting to GET units through Owner A floor must throw ResourceNotFoundException (404)");
        System.out.println("✅ 12D: Owner B GET units by floor returned 404: " + floorEx.getMessage());
    }

    @Test
    @DisplayName("STEP 12E — CROSS-OWNER SECURITY: Verify Unit 1 remains intact and unaffected")
    void testStep12e_VerifyUnit1RemainsIntact() {
        authenticateAs("owner.test@gmail.com");
        UnitResponse intactUnit = unitService.getUnitById(1L);
        assertNotNull(intactUnit);
        assertEquals("G-101", intactUnit.getUnitNumber());
        assertEquals(new BigDecimal("20000.00"), intactUnit.getMonthlyRent());
        assertEquals(UnitType.APARTMENT, intactUnit.getUnitType());
        System.out.println("✅ 12E: Unit 1 remains intact: " + intactUnit.getUnitNumber() + ", rent=" + intactUnit.getMonthlyRent());
    }
}
