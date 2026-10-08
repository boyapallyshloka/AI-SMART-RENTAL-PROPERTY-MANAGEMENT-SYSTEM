
package com.rental.rental_management_backend.maintenance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rental.rental_management_backend.s3.service.S3Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;

import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestResponse;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceStatusUpdateRequest;
import com.rental.rental_management_backend.maintenance.entity.MaintenanceRequest;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceCategory;
import com.rental.rental_management_backend.maintenance.enums.MaintenancePriority;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceStatus;
import com.rental.rental_management_backend.maintenance.repository.MaintenanceRequestRepository;
import com.rental.rental_management_backend.maintenance.service.M5AggregationService;
import com.rental.rental_management_backend.maintenance.service.MaintenanceAiServiceClient;
import com.rental.rental_management_backend.maintenance.service.MaintenanceImageService;
import com.rental.rental_management_backend.maintenance.service.MaintenanceRequestServiceImpl;

import com.rental.rental_management_backend.notification.service.NotificationService;

import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyManager;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;

import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;


@ExtendWith(MockitoExtension.class)
class MaintenanceRequestServiceScopingTest {

    @Mock
    private S3Service s3Service;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private MaintenanceImageService maintenanceImageService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MaintenanceAiServiceClient maintenanceAiServiceClient;

    @Mock
    private M5AggregationService m5AggregationService;

    // NEW: NotificationService mock
    @Mock
    private NotificationService notificationService;

    private MaintenanceRequestServiceImpl service;

    private User owner20;
    private User owner4;
    private User managerUser;
    private User superAdminUser;
    private User tenantUser;

    private Tenant tenantProfile;

    private Property property16;
    private Property property13;
    private Property property1;
    private Property property2;
    private Property property11;

    private MaintenanceRequest request25;
    private MaintenanceRequest request27;
    private MaintenanceRequest request9;
    private MaintenanceRequest request24;
    private MaintenanceRequest request21;


    @BeforeEach
    void setUp() {

        /*
         * IMPORTANT:
         * NotificationService has been added to
         * MaintenanceRequestServiceImpl constructor.
         *
         * Therefore it must also be passed here.
         */
        service = new MaintenanceRequestServiceImpl(
                maintenanceRequestRepository,
                tenantRepository,
                propertyRepository,
                unitRepository,
                maintenanceImageService,
                s3Service,
                userRepository,
                maintenanceAiServiceClient,
                m5AggregationService,
                notificationService
        );


        // =========================================================
        // USERS
        // =========================================================

        owner20 = new User();
        owner20.setId(20L);
        owner20.setEmail("owner20@test.com");
        owner20.setRole(RoleType.PROPERTY_OWNER);


        owner4 = new User();
        owner4.setId(4L);
        owner4.setEmail("owner4@test.com");
        owner4.setRole(RoleType.PROPERTY_OWNER);


        managerUser = new User();
        managerUser.setId(30L);
        managerUser.setEmail("manager@test.com");
        managerUser.setRole(RoleType.PROPERTY_MANAGER);


        PropertyManager pm = new PropertyManager();
        pm.setPropertyManagerId(100L);
        pm.setUser(managerUser);


        superAdminUser = new User();
        superAdminUser.setId(1L);
        superAdminUser.setEmail("admin@test.com");
        superAdminUser.setRole(RoleType.SUPER_ADMIN);


        tenantUser = new User();
        tenantUser.setId(50L);
        tenantUser.setEmail("tenant@test.com");
        tenantUser.setRole(RoleType.TENANT);


        // =========================================================
        // TENANT PROFILE
        // =========================================================

        tenantProfile = new Tenant();
        tenantProfile.setTenantId(77L);
        tenantProfile.setUser(tenantUser);


        // =========================================================
        // PROPERTIES
        // =========================================================

        // Property 16 -> Owner 20
        property16 = new Property();
        property16.setPropertyId(16L);
        property16.setPropertyName("sri sai residency");
        property16.setOwner(owner20);


        // Property 13 -> Owner 20
        property13 = new Property();
        property13.setPropertyId(13L);
        property13.setPropertyName("pooja apartments");
        property13.setOwner(owner20);


        // Property 1 -> Owner 4
        property1 = new Property();
        property1.setPropertyId(1L);
        property1.setPropertyName("Owner 4 Property 1");
        property1.setOwner(owner4);


        // Property 2 -> Owner 4
        property2 = new Property();
        property2.setPropertyId(2L);
        property2.setPropertyName("Owner 4 Property 2");
        property2.setOwner(owner4);


        // Property 11 -> Owner 4 + Manager
        property11 = new Property();
        property11.setPropertyId(11L);
        property11.setPropertyName("Managed Property 11");
        property11.setOwner(owner4);
        property11.setPropertyManager(pm);


        // =========================================================
        // UNITS
        // =========================================================

        Unit unit83 = new Unit();
        unit83.setUnitId(83L);
        unit83.setUnitNumber("101");


        Unit unit85 = new Unit();
        unit85.setUnitId(85L);
        unit85.setUnitNumber("201");


        Unit unit1 = new Unit();
        unit1.setUnitId(1L);
        unit1.setUnitNumber("1");


        Unit unit34 = new Unit();
        unit34.setUnitId(34L);
        unit34.setUnitNumber("34");


        // =========================================================
        // MAINTENANCE REQUEST 25
        // Property 16 -> Owner 20
        // =========================================================

        request25 = new MaintenanceRequest();
        request25.setRequestId(25L);
        request25.setProperty(property16);
        request25.setUnit(unit83);
        request25.setTenant(tenantProfile);
        request25.setCategory(MaintenanceCategory.PLUMBING);
        request25.setDescription("Water leakage");
        request25.setPriority(MaintenancePriority.HIGH);
        request25.setStatus(MaintenanceStatus.OPEN);


        // =========================================================
        // MAINTENANCE REQUEST 27
        // Property 13 -> Owner 20
        // =========================================================

        request27 = new MaintenanceRequest();
        request27.setRequestId(27L);
        request27.setProperty(property13);
        request27.setUnit(unit85);
        request27.setTenant(tenantProfile);
        request27.setCategory(MaintenanceCategory.ELECTRICAL);
        request27.setDescription("Switch issue");
        request27.setPriority(MaintenancePriority.MEDIUM);
        request27.setStatus(MaintenanceStatus.IN_PROGRESS);


        // =========================================================
        // MAINTENANCE REQUEST 9
        // Property 1 -> Owner 4
        // =========================================================

        request9 = new MaintenanceRequest();
        request9.setRequestId(9L);
        request9.setProperty(property1);
        request9.setUnit(unit1);
        request9.setTenant(tenantProfile);
        request9.setCategory(MaintenanceCategory.OTHER);
        request9.setDescription("Door issue");
        request9.setPriority(MaintenancePriority.LOW);
        request9.setStatus(MaintenanceStatus.OPEN);


        // =========================================================
        // MAINTENANCE REQUEST 24
        // Property 2 -> Owner 4
        // =========================================================

        request24 = new MaintenanceRequest();
        request24.setRequestId(24L);
        request24.setProperty(property2);
        request24.setUnit(unit1);
        request24.setTenant(tenantProfile);
        request24.setCategory(MaintenanceCategory.APPLIANCE);
        request24.setDescription("Heater issue");
        request24.setPriority(MaintenancePriority.MEDIUM);
        request24.setStatus(MaintenanceStatus.OPEN);


        // =========================================================
        // MAINTENANCE REQUEST 21
        // Property 11 -> Manager 30
        // =========================================================

        request21 = new MaintenanceRequest();
        request21.setRequestId(21L);
        request21.setProperty(property11);
        request21.setUnit(unit34);
        request21.setTenant(tenantProfile);
        request21.setCategory(MaintenanceCategory.AC);
        request21.setDescription("AC repair");
        request21.setPriority(MaintenancePriority.HIGH);
        request21.setStatus(MaintenanceStatus.OPEN);
    }


    // =============================================================
    // AUTHENTICATION HELPER
    // =============================================================

    private void authenticate(String email, String role) {

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        email,
                        "password",
                        List.of(
                                new SimpleGrantedAuthority("ROLE_" + role)
                        )
                )
        );
    }


    // =============================================================
    // OWNER 20
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_OWNER (Owner 20): getAllRequests() returns only Owner 20's property requests"
    )
    void testGetAllRequestsAsOwner20() {

        authenticate("owner20@test.com", "PROPERTY_OWNER");

        when(userRepository.findByEmail("owner20@test.com"))
                .thenReturn(Optional.of(owner20));

        when(maintenanceRequestRepository.findByPropertyOwnerId(20L))
                .thenReturn(List.of(request25, request27));

        List<MaintenanceRequestResponse> results =
                service.getAllRequests();

        assertNotNull(results);

        assertEquals(2, results.size());

        assertEquals(25L, results.get(0).getRequestId());
        assertEquals(16L, results.get(0).getPropertyId());

        assertEquals(27L, results.get(1).getRequestId());
        assertEquals(13L, results.get(1).getPropertyId());

        // Owner 20 must never receive other owner's/manager's properties
        assertTrue(
                results.stream()
                        .noneMatch(r -> r.getPropertyId() == 1L)
        );

        assertTrue(
                results.stream()
                        .noneMatch(r -> r.getPropertyId() == 2L)
        );

        assertTrue(
                results.stream()
                        .noneMatch(r -> r.getPropertyId() == 11L)
        );

        verify(maintenanceRequestRepository)
                .findByPropertyOwnerId(20L);
    }


    // =============================================================
    // OWNER 4
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_OWNER (Owner 4): getAllRequests() returns only Owner 4's property requests"
    )
    void testGetAllRequestsAsOwner4() {

        authenticate("owner4@test.com", "PROPERTY_OWNER");

        when(userRepository.findByEmail("owner4@test.com"))
                .thenReturn(Optional.of(owner4));

        when(maintenanceRequestRepository.findByPropertyOwnerId(4L))
                .thenReturn(List.of(request9, request24));

        List<MaintenanceRequestResponse> results =
                service.getAllRequests();

        assertNotNull(results);

        assertEquals(2, results.size());

        assertEquals(9L, results.get(0).getRequestId());

        assertEquals(24L, results.get(1).getRequestId());

        verify(maintenanceRequestRepository)
                .findByPropertyOwnerId(4L);
    }


    // =============================================================
    // PROPERTY MANAGER
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_MANAGER: getAllRequests() returns only assigned property requests"
    )
    void testGetAllRequestsAsManager() {

        authenticate("manager@test.com", "PROPERTY_MANAGER");

        when(userRepository.findByEmail("manager@test.com"))
                .thenReturn(Optional.of(managerUser));

        when(maintenanceRequestRepository.findByPropertyManagerUserId(30L))
                .thenReturn(List.of(request21));

        List<MaintenanceRequestResponse> results =
                service.getAllRequests();

        assertNotNull(results);

        assertEquals(1, results.size());

        assertEquals(21L, results.get(0).getRequestId());

        assertEquals(11L, results.get(0).getPropertyId());

        verify(maintenanceRequestRepository)
                .findByPropertyManagerUserId(30L);
    }


    // =============================================================
    // SUPER ADMIN
    // =============================================================

    @Test
    @DisplayName(
            "SUPER_ADMIN: getAllRequests() returns all requests"
    )
    void testGetAllRequestsAsSuperAdmin() {

        authenticate("admin@test.com", "SUPER_ADMIN");

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(superAdminUser));

        when(maintenanceRequestRepository.findAll())
                .thenReturn(
                        List.of(
                                request25,
                                request27,
                                request9,
                                request24,
                                request21
                        )
                );

        List<MaintenanceRequestResponse> results =
                service.getAllRequests();

        assertNotNull(results);

        assertEquals(5, results.size());

        verify(maintenanceRequestRepository).findAll();
    }


    // =============================================================
    // TENANT
    // =============================================================

    @Test
    @DisplayName(
            "TENANT: getAllRequests() returns only own requests"
    )
    void testGetAllRequestsAsTenant() {

        authenticate("tenant@test.com", "TENANT");

        when(userRepository.findByEmail("tenant@test.com"))
                .thenReturn(Optional.of(tenantUser));

        when(tenantRepository.findByUser(tenantUser))
                .thenReturn(Optional.of(tenantProfile));

        when(maintenanceRequestRepository.findByTenant_TenantId(77L))
                .thenReturn(List.of(request25));

        List<MaintenanceRequestResponse> results =
                service.getAllRequests();

        assertNotNull(results);

        assertEquals(1, results.size());

        assertEquals(25L, results.get(0).getRequestId());

        verify(maintenanceRequestRepository)
                .findByTenant_TenantId(77L);
    }


    // =============================================================
    // OWNER ACCESS DENIED
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_OWNER (Owner 20): getRequestById() denies access to another owner's request"
    )
    void testGetRequestByIdDeniedForDifferentOwner() {

        authenticate("owner20@test.com", "PROPERTY_OWNER");

        when(userRepository.findByEmail("owner20@test.com"))
                .thenReturn(Optional.of(owner20));

        // Request 24 belongs to Owner 4
        when(maintenanceRequestRepository.findById(24L))
                .thenReturn(Optional.of(request24));

        assertThrows(
                AccessDeniedException.class,
                () -> service.getRequestById(24L)
        );
    }


    // =============================================================
    // OWNER ACCESS ALLOWED
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_OWNER (Owner 20): getRequestById() allows access to own property request"
    )
    void testGetRequestByIdAllowedForOwnRequest() {

        authenticate("owner20@test.com", "PROPERTY_OWNER");

        when(userRepository.findByEmail("owner20@test.com"))
                .thenReturn(Optional.of(owner20));

        // Request 25 belongs to Owner 20
        when(maintenanceRequestRepository.findById(25L))
                .thenReturn(Optional.of(request25));

        MaintenanceRequestResponse response =
                service.getRequestById(25L);

        assertNotNull(response);

        assertEquals(25L, response.getRequestId());

        assertEquals(16L, response.getPropertyId());
    }


    // =============================================================
    // UPDATE STATUS ACCESS DENIED
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_OWNER (Owner 20): updateStatus() denies access to another owner's request"
    )
    void testUpdateStatusDeniedForDifferentOwner() {

        authenticate("owner20@test.com", "PROPERTY_OWNER");

        when(userRepository.findByEmail("owner20@test.com"))
                .thenReturn(Optional.of(owner20));

        // Request 24 belongs to Owner 4
        when(maintenanceRequestRepository.findById(24L))
                .thenReturn(Optional.of(request24));

        MaintenanceStatusUpdateRequest updateReq =
                new MaintenanceStatusUpdateRequest();

        updateReq.setStatus("IN_PROGRESS");

        assertThrows(
                AccessDeniedException.class,
                () -> service.updateStatus(24L, updateReq)
        );
    }


    // =============================================================
    // DELETE ACCESS DENIED
    // =============================================================

    @Test
    @DisplayName(
            "PROPERTY_OWNER (Owner 20): deleteRequest() denies deletion of another owner's request"
    )
    void testDeleteRequestDeniedForDifferentOwner() {

        authenticate("owner20@test.com", "PROPERTY_OWNER");

        when(userRepository.findByEmail("owner20@test.com"))
                .thenReturn(Optional.of(owner20));

        // Request 24 belongs to Owner 4
        when(maintenanceRequestRepository.findById(24L))
                .thenReturn(Optional.of(request24));

        assertThrows(
                AccessDeniedException.class,
                () -> service.deleteRequest(24L)
        );
    }
}

