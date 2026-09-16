package com.rental.rental_management_backend.property;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.dto.UnitResponse;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.enums.UnitType;
import com.rental.rental_management_backend.property.repository.FloorRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;
import com.rental.rental_management_backend.property.serviceimpl.UnitServiceImpl;

@ExtendWith(MockitoExtension.class)
class UnitServiceTest {

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private FloorRepository floorRepository;

    @Mock
    private UserRepository userRepository;

    private UnitServiceImpl unitService;

    private User owner;

    @BeforeEach
    void setUp() {
        unitService = new UnitServiceImpl(unitRepository, floorRepository, userRepository);

        owner = new User();
        owner.setId(7L);
        owner.setEmail("owner@test.com");
        owner.setRole(RoleType.PROPERTY_OWNER);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "owner@test.com",
                        "password",
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_PROPERTY_OWNER"))
                )
        );
    }

    @Test
    @DisplayName("Unit mapping: real unit entity fields map correctly to UnitResponse")
    void testUnitMappingToResponse() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(java.util.Optional.of(owner));

        Property property = new Property();
        property.setPropertyId(10L);
        property.setPropertyName("Sunset Towers");
        property.setOwner(owner);

        Building building = new Building();
        building.setBuildingId(20L);
        building.setBuildingName("Block A");
        building.setProperty(property);

        Floor floor = new Floor();
        floor.setFloorId(30L);
        floor.setFloorName("Floor 3");
        floor.setFloorNumber(3);
        floor.setBuilding(building);

        Unit unit = new Unit();
        unit.setUnitId(40L);
        unit.setUnitNumber("301");
        unit.setUnitType(UnitType.APARTMENT);
        unit.setArea(1200.0);
        unit.setBedrooms(3);
        unit.setBathrooms(2);
        unit.setMonthlyRent(new BigDecimal("25000.00"));
        unit.setSecurityDeposit(new BigDecimal("50000.00"));
        unit.setStatus(UnitStatus.VACANT);
        unit.setDescription("Spacious 3BHK");
        unit.setFloor(floor);

        when(unitRepository.findById(40L)).thenReturn(java.util.Optional.of(unit));

        UnitResponse response = unitService.getUnitById(40L);

        assertNotNull(response);
        assertEquals(40L, response.getUnitId());
        assertEquals("301", response.getUnitNumber());
        assertEquals(UnitType.APARTMENT, response.getUnitType());
        assertEquals(1200.0, response.getArea());
        assertEquals(3, response.getBedrooms());
        assertEquals(2, response.getBathrooms());
        assertEquals(new BigDecimal("25000.00"), response.getMonthlyRent());
        assertEquals(new BigDecimal("50000.00"), response.getSecurityDeposit());
        assertEquals(UnitStatus.VACANT, response.getStatus());
        assertEquals(30L, response.getFloorId());
        assertEquals("Floor 3", response.getFloorName());
        assertEquals(3, response.getFloorNumber());
        assertEquals(20L, response.getBuildingId());
        assertEquals("Block A", response.getBuildingName());
        assertEquals(10L, response.getPropertyId());
        assertEquals("Sunset Towers", response.getPropertyName());
    }

    @Test
    @DisplayName("Unit mapping: null parent references do not throw NullPointerException")
    void testUnitMappingWithNullParents() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(java.util.Optional.of(owner));

        // Unit with floor that has no building
        Property property = new Property();
        property.setPropertyId(10L);
        property.setOwner(owner);

        Building building = new Building();
        building.setProperty(property);

        Floor floor = new Floor();
        floor.setFloorId(30L);
        floor.setBuilding(building);

        Unit unit = new Unit();
        unit.setUnitId(40L);
        unit.setUnitNumber("101");
        unit.setFloor(floor);

        when(unitRepository.findById(40L)).thenReturn(java.util.Optional.of(unit));

        UnitResponse response = unitService.getUnitById(40L);
        assertNotNull(response);
        assertEquals(40L, response.getUnitId());
        assertNull(response.getBuildingName());
    }

    @Test
    @DisplayName("Unit not found throws ResourceNotFoundException (clean 404, not 500)")
    void testUnitNotFoundThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("owner@test.com")).thenReturn(java.util.Optional.of(owner));
        when(unitRepository.findById(999L)).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> unitService.getUnitById(999L));
    }
}
