package com.rental.rental_management_backend.rental.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;
import com.rental.rental_management_backend.rental.dto.RentalApplicationCreateRequest;
import com.rental.rental_management_backend.rental.dto.RentalApplicationResponse;
import com.rental.rental_management_backend.rental.dto.RentalApplicationReviewRequest;
import com.rental.rental_management_backend.rental.entity.RentalApplication;
import com.rental.rental_management_backend.rental.enums.RentalApplicationStatus;
import com.rental.rental_management_backend.rental.repository.RentalApplicationRepository;
import com.rental.rental_management_backend.rental.service.RentalApplicationService;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
@Transactional
public class RentalApplicationServiceImpl
        implements RentalApplicationService {

    private final RentalApplicationRepository rentalApplicationRepository;

    private final TenantRepository tenantRepository;

    private final UserRepository userRepository;

    private final UnitRepository unitRepository;

    private final PropertyRepository propertyRepository;

    public RentalApplicationServiceImpl(
            RentalApplicationRepository rentalApplicationRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            UnitRepository unitRepository,
            PropertyRepository propertyRepository) {

        this.rentalApplicationRepository =
                rentalApplicationRepository;

        this.tenantRepository =
                tenantRepository;

        this.userRepository =
                userRepository;

        this.unitRepository =
                unitRepository;

        this.propertyRepository =
                propertyRepository;
    }

    // ============================================================
    // CREATE APPLICATION
    // TENANT ONLY
    // ============================================================

    @Override
    public RentalApplicationResponse createApplication(
            String email,
            RentalApplicationCreateRequest request) {

        validateEmail(email);

        if (request == null) {

            throw new IllegalArgumentException(
                    "Application request is required");
        }

        User user = findUserByEmail(email);

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant profile not found for user"));

        if (request.getUnitId() == null) {

            throw new IllegalArgumentException(
                    "Unit ID is required");
        }

        Unit unit = unitRepository
                .findById(request.getUnitId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                        + request.getUnitId()));

        // --------------------------------------------------------
        // ONLY VACANT UNITS CAN RECEIVE APPLICATIONS
        // --------------------------------------------------------

        if (unit.getStatus() != UnitStatus.VACANT) {

            throw new IllegalArgumentException(
                    "Applications can only be submitted "
                            + "for vacant units");
        }

        // --------------------------------------------------------
        // PREVENT DUPLICATE PENDING APPLICATION
        // --------------------------------------------------------

        boolean alreadyApplied =
                rentalApplicationRepository
                        .existsByTenant_TenantIdAndUnit_UnitIdAndStatus(
                                tenant.getTenantId(),
                                unit.getUnitId(),
                                RentalApplicationStatus.PENDING);

        if (alreadyApplied) {

            throw new IllegalArgumentException(
                    "You already have a pending application "
                            + "for this unit");
        }

        RentalApplication application =
                new RentalApplication();

        application.setTenant(tenant);

        application.setUnit(unit);

        application.setPreferredMoveInDate(
                request.getPreferredMoveInDate());

        application.setMessage(
                cleanString(request.getMessage()));

        application.setStatus(
                RentalApplicationStatus.PENDING);

        RentalApplication saved =
                rentalApplicationRepository.save(application);

        return mapToResponse(saved);
    }

    // ============================================================
    // GET APPLICATION BY ID
    //
    // TENANT
    //     -> own application only
    //
    // PROPERTY_OWNER
    //     -> applications for owned properties only
    //
    // PROPERTY_MANAGER
    //     -> applications for assigned properties only
    //
    // SUPER_ADMIN
    //     -> any application
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public RentalApplicationResponse getApplicationById(
            Long applicationId) {

        if (applicationId == null) {

            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        RentalApplication application =
                rentalApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rental application not found "
                                                + "with ID: "
                                                + applicationId));

        String email = getAuthenticatedEmail();

        String role = getAuthenticatedRole();

        // --------------------------------------------------------
        // SUPER ADMIN CAN VIEW ANY APPLICATION
        // --------------------------------------------------------

        if ("ROLE_SUPER_ADMIN".equals(role)) {

            return mapToResponse(application);
        }

        // --------------------------------------------------------
        // TENANT CAN VIEW ONLY THEIR OWN APPLICATION
        // --------------------------------------------------------

        if ("ROLE_TENANT".equals(role)) {

            Tenant tenant = tenantRepository
                    .findByUser_Id(
                            findUserByEmail(email).getId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Tenant profile not found for user"));

            if (application.getTenant() == null
                    || !application.getTenant()
                            .getTenantId()
                            .equals(tenant.getTenantId())) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "this application");
            }

            return mapToResponse(application);
        }

        // --------------------------------------------------------
        // PROPERTY OWNER CAN VIEW ONLY THEIR PROPERTY APPLICATIONS
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_OWNER".equals(role)) {

            Property property =
                    getPropertyFromApplication(application);

            User owner = property.getOwner();

            if (owner == null
                    || owner.getEmail() == null
                    || !owner.getEmail()
                            .equalsIgnoreCase(email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "this application");
            }

            return mapToResponse(application);
        }

        // --------------------------------------------------------
        // PROPERTY MANAGER CAN VIEW ONLY ASSIGNED PROPERTY
        // APPLICATIONS
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_MANAGER".equals(role)) {

            Property property =
                    getPropertyFromApplication(application);

            if (!isPropertyManagerAssignedToProperty(
                    property,
                    email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "this application");
            }

            return mapToResponse(application);
        }

        throw new IllegalArgumentException(
                "You are not authorized to view applications");
    }

    // ============================================================
    // GET MY APPLICATIONS
    // TENANT ONLY
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getMyApplications(
            String email) {

        validateEmail(email);

        User user = findUserByEmail(email);

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant profile not found for user"));

        return rentalApplicationRepository
                .findByTenant_TenantId(
                        tenant.getTenantId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET APPLICATIONS FOR UNIT
    //
    // PROPERTY_OWNER
    //     -> own property only
    //
    // PROPERTY_MANAGER
    //     -> assigned property only
    //
    // SUPER_ADMIN
    //     -> any unit
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getApplicationsForUnit(
            Long unitId) {

        if (unitId == null) {

            throw new IllegalArgumentException(
                    "Unit ID is required");
        }

        Unit unit = unitRepository
                .findById(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                        + unitId));

        String email = getAuthenticatedEmail();

        String role = getAuthenticatedRole();

        // --------------------------------------------------------
        // SUPER ADMIN
        // --------------------------------------------------------

        if ("ROLE_SUPER_ADMIN".equals(role)) {

            return rentalApplicationRepository
                    .findByUnit_UnitId(unitId)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // --------------------------------------------------------
        // PROPERTY OWNER
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_OWNER".equals(role)) {

            Property property =
                    getPropertyFromUnit(unit);

            User owner = property.getOwner();

            if (owner == null
                    || owner.getEmail() == null
                    || !owner.getEmail()
                            .equalsIgnoreCase(email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "applications for this unit");
            }

            return rentalApplicationRepository
                    .findByUnit_UnitId(unitId)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // --------------------------------------------------------
        // PROPERTY MANAGER
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_MANAGER".equals(role)) {

            Property property =
                    getPropertyFromUnit(unit);

            if (!isPropertyManagerAssignedToProperty(
                    property,
                    email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "applications for this unit");
            }

            return rentalApplicationRepository
                    .findByUnit_UnitId(unitId)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        throw new IllegalArgumentException(
                "You are not authorized to view "
                        + "applications for this unit");
    }

    // ============================================================
    // GET ALL APPLICATIONS
    // SUPER ADMIN ONLY
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getAllApplications() {

        String role = getAuthenticatedRole();

        if (!"ROLE_SUPER_ADMIN".equals(role)) {

            throw new IllegalArgumentException(
                    "Only SUPER_ADMIN can view all applications");
        }

        return rentalApplicationRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // REVIEW APPLICATION
    //
    // PROPERTY OWNER
    //     -> can approve/reject applications for their properties
    //
    // PROPERTY MANAGER
    //     -> can approve/reject applications for properties
    //        assigned to them
    //
    // ONLY PENDING APPLICATIONS CAN BE REVIEWED
    // ============================================================

    @Override
    public RentalApplicationResponse reviewApplication(
            Long applicationId,
            String email,
            RentalApplicationReviewRequest request) {

        validateEmail(email);

        if (request == null) {

            throw new IllegalArgumentException(
                    "Review request is required");
        }

        if (request.getStatus() == null) {

            throw new IllegalArgumentException(
                    "Application status is required");
        }

        if (applicationId == null) {

            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        RentalApplication application =
                rentalApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rental application not found "
                                                + "with ID: "
                                                + applicationId));

        // --------------------------------------------------------
        // ONLY PENDING APPLICATIONS CAN BE REVIEWED
        // --------------------------------------------------------

        if (application.getStatus()
                != RentalApplicationStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending applications can be reviewed");
        }

        Property property =
                getPropertyFromApplication(application);

        User owner = property.getOwner();

        if (owner == null) {

            throw new ResourceNotFoundException(
                    "Property owner not found");
        }

        String role = getAuthenticatedRole();

        // --------------------------------------------------------
        // PROPERTY OWNER
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_OWNER".equals(role)) {

            if (owner.getEmail() == null
                    || !owner.getEmail()
                            .equalsIgnoreCase(email.trim())) {

                throw new IllegalArgumentException(
                        "You are not authorized to review "
                                + "this application");
            }
        }

        // --------------------------------------------------------
        // PROPERTY MANAGER
        // --------------------------------------------------------

        else if ("ROLE_PROPERTY_MANAGER".equals(role)) {

            if (!isPropertyManagerAssignedToProperty(
                    property,
                    email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to review "
                                + "this application");
            }
        }

        // --------------------------------------------------------
        // ANY OTHER ROLE
        // --------------------------------------------------------

        else {

            throw new IllegalArgumentException(
                    "You are not authorized to review "
                            + "this application");
        }

        RentalApplicationStatus newStatus =
                request.getStatus();

        // --------------------------------------------------------
        // ONLY APPROVED OR REJECTED
        // --------------------------------------------------------

        if (newStatus != RentalApplicationStatus.APPROVED
                && newStatus != RentalApplicationStatus.REJECTED) {

            throw new IllegalArgumentException(
                    "Application can only be APPROVED "
                            + "or REJECTED");
        }

        // --------------------------------------------------------
        // REJECT
        // --------------------------------------------------------

        if (newStatus == RentalApplicationStatus.REJECTED) {

            String rejectionReason =
                    cleanString(
                            request.getRejectionReason());

            if (rejectionReason == null) {

                throw new IllegalArgumentException(
                        "Rejection reason is required");
            }

            application.setRejectionReason(
                    rejectionReason);
        }

        // --------------------------------------------------------
        // APPROVE
        // --------------------------------------------------------

        else {

            application.setRejectionReason(null);
        }

        application.setStatus(newStatus);

        application.setReviewedAt(
                LocalDateTime.now());

        RentalApplication updated =
                rentalApplicationRepository
                        .save(application);

        return mapToResponse(updated);
    }

    // ============================================================
    // WITHDRAW APPLICATION
    // TENANT ONLY
    // ============================================================

    @Override
    public void withdrawApplication(
            Long applicationId,
            String email) {

        validateEmail(email);

        if (applicationId == null) {

            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        RentalApplication application =
                rentalApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rental application not found "
                                                + "with ID: "
                                                + applicationId));

        User user = findUserByEmail(email);

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant profile not found for user"));

        // --------------------------------------------------------
        // TENANT MUST OWN APPLICATION
        // --------------------------------------------------------

        if (application.getTenant() == null
                || !application.getTenant()
                        .getTenantId()
                        .equals(tenant.getTenantId())) {

            throw new IllegalArgumentException(
                    "You are not allowed to withdraw "
                            + "this application");
        }

        // --------------------------------------------------------
        // ONLY PENDING APPLICATIONS CAN BE WITHDRAWN
        // --------------------------------------------------------

        if (application.getStatus()
                != RentalApplicationStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending applications can be withdrawn");
        }

        application.setStatus(
                RentalApplicationStatus.WITHDRAWN);

        rentalApplicationRepository.save(application);
    }

    // ============================================================
    // GET ALL APPLICATIONS FOR PROPERTY
    //
    // PROPERTY_OWNER
    //     -> own property only
    //
    // PROPERTY_MANAGER
    //     -> assigned property only
    //
    // SUPER_ADMIN
    //     -> any property
    //
    // TENANT
    //     -> not allowed
    //
    // IMPORTANT:
    // A valid property with zero applications returns []
    // instead of 404.
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getApplicationsForProperty(
            Long propertyId) {

        if (propertyId == null) {

            throw new IllegalArgumentException(
                    "Property ID is required");
        }

        // --------------------------------------------------------
        // FIND PROPERTY FIRST
        //
        // This is important because a property can exist even
        // when it has no rental applications yet.
        // --------------------------------------------------------

        Property property =
                propertyRepository
                        .findById(propertyId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found with ID: "
                                                + propertyId));

        String email = getAuthenticatedEmail();

        String role = getAuthenticatedRole();

        // --------------------------------------------------------
        // GET APPLICATIONS FOR PROPERTY
        // --------------------------------------------------------

        List<RentalApplication> applications =
                rentalApplicationRepository
                        .findByUnit_Floor_Building_Property_PropertyId(
                                propertyId);

        // --------------------------------------------------------
        // SUPER ADMIN
        // --------------------------------------------------------

        if ("ROLE_SUPER_ADMIN".equals(role)) {

            return applications
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // --------------------------------------------------------
        // PROPERTY OWNER
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_OWNER".equals(role)) {

            User owner = property.getOwner();

            if (owner == null
                    || owner.getEmail() == null
                    || !owner.getEmail()
                            .equalsIgnoreCase(email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "applications for this property");
            }

            return applications
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // --------------------------------------------------------
        // PROPERTY MANAGER
        // --------------------------------------------------------

        if ("ROLE_PROPERTY_MANAGER".equals(role)) {

            if (!isPropertyManagerAssignedToProperty(
                    property,
                    email)) {

                throw new IllegalArgumentException(
                        "You are not authorized to view "
                                + "applications for this property");
            }

            return applications
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // --------------------------------------------------------
        // OTHER ROLES
        // --------------------------------------------------------

        throw new IllegalArgumentException(
                "You are not authorized to view "
                        + "applications for this property");
    }

    // ============================================================
    // CHECK PROPERTY MANAGER ACCESS
    // ============================================================

    private boolean isPropertyManagerAssignedToProperty(
            Property property,
            String managerEmail) {

        if (property == null
                || property.getPropertyManager() == null
                || property.getPropertyManager().getUser() == null
                || property.getPropertyManager().getUser()
                        .getEmail() == null
                || managerEmail == null
                || managerEmail.isBlank()) {

            return false;
        }

        return property.getPropertyManager()
                .getUser()
                .getEmail()
                .equalsIgnoreCase(
                        managerEmail.trim());
    }

    // ============================================================
    // GET PROPERTY FROM APPLICATION
    // ============================================================

    private Property getPropertyFromApplication(
            RentalApplication application) {

        if (application.getUnit() == null) {

            throw new ResourceNotFoundException(
                    "Unit not found for this application");
        }

        return getPropertyFromUnit(
                application.getUnit());
    }

    // ============================================================
    // GET PROPERTY FROM UNIT
    // ============================================================

    private Property getPropertyFromUnit(Unit unit) {

        Floor floor = unit.getFloor();

        if (floor == null) {

            throw new ResourceNotFoundException(
                    "Floor not found for this unit");
        }

        Building building = floor.getBuilding();

        if (building == null) {

            throw new ResourceNotFoundException(
                    "Building not found for this floor");
        }

        Property property = building.getProperty();

        if (property == null) {

            throw new ResourceNotFoundException(
                    "Property not found for this building");
        }

        return property;
    }

    // ============================================================
    // FIND USER BY EMAIL
    // ============================================================

    private User findUserByEmail(String email) {

        return userRepository
                .findByEmail(
                        email.trim().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + email));
    }

    // ============================================================
    // AUTHENTICATED EMAIL
    // ============================================================

    private String getAuthenticatedEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user is required");
        }

        return authentication.getName()
                .trim()
                .toLowerCase();
    }

    // ============================================================
    // AUTHENTICATED ROLE
    // ============================================================

    private String getAuthenticatedRole() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "Authenticated user is required");
        }

        for (GrantedAuthority authority :
                authentication.getAuthorities()) {

            String role = authority.getAuthority();

            if ("ROLE_SUPER_ADMIN".equals(role)
                    || "ROLE_PROPERTY_OWNER".equals(role)
                    || "ROLE_PROPERTY_MANAGER".equals(role)
                    || "ROLE_TENANT".equals(role)) {

                return role;
            }
        }

        throw new IllegalArgumentException(
                "User role not found");
    }

    // ============================================================
    // VALIDATE EMAIL
    // ============================================================

    private void validateEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }
    }

    // ============================================================
    // MAP ENTITY TO RESPONSE
    // ============================================================

    private RentalApplicationResponse mapToResponse(
            RentalApplication application) {

        RentalApplicationResponse response =
                new RentalApplicationResponse();

        // --------------------------------------------------------
        // APPLICATION ID
        // --------------------------------------------------------

        response.setApplicationId(
                application.getApplicationId());

        // --------------------------------------------------------
        // TENANT
        // --------------------------------------------------------

        Tenant tenant =
                application.getTenant();

        if (tenant != null) {

            response.setTenantId(
                    tenant.getTenantId());

            User user =
                    tenant.getUser();

            if (user != null) {

                String firstName =
                        user.getFirstName();

                String lastName =
                        user.getLastName();

                String tenantName =
                        ((firstName != null
                                ? firstName
                                : "")
                        + " "
                        + (lastName != null
                                ? lastName
                                : ""))
                        .trim();

                response.setTenantName(
                        tenantName);

                response.setTenantEmail(
                        user.getEmail());
            }
        }

        // --------------------------------------------------------
        // UNIT
        // --------------------------------------------------------

        Unit unit =
                application.getUnit();

        if (unit != null) {

            response.setUnitId(
                    unit.getUnitId());

            response.setUnitNumber(
                    unit.getUnitNumber());

            response.setMonthlyRent(
                    unit.getMonthlyRent());

            response.setSecurityDeposit(
                    unit.getSecurityDeposit());

            // ----------------------------------------------------
            // FLOOR
            // ----------------------------------------------------

            Floor floor =
                    unit.getFloor();

            if (floor != null) {

                response.setFloorId(
                        floor.getFloorId());

                // ------------------------------------------------
                // BUILDING
                // ------------------------------------------------

                Building building =
                        floor.getBuilding();

                if (building != null) {

                    response.setBuildingId(
                            building.getBuildingId());

                    response.setBuildingName(
                            building.getBuildingName());

                    // --------------------------------------------
                    // PROPERTY
                    // --------------------------------------------

                    Property property =
                            building.getProperty();

                    if (property != null) {

                        response.setPropertyId(
                                property.getPropertyId());

                        response.setPropertyName(
                                property.getPropertyName());
                    }
                }
            }
        }

        // --------------------------------------------------------
        // APPLICATION DETAILS
        // --------------------------------------------------------

        response.setApplicationDate(
                application.getApplicationDate());

        response.setPreferredMoveInDate(
                application.getPreferredMoveInDate());

        response.setMessage(
                application.getMessage());

        response.setStatus(
                application.getStatus());

        response.setRejectionReason(
                application.getRejectionReason());

        response.setReviewedAt(
                application.getReviewedAt());

        response.setCreatedAt(
                application.getCreatedAt());

        response.setUpdatedAt(
                application.getUpdatedAt());

        return response;
    }

    // ============================================================
    // CLEAN STRING
    // ============================================================

    private String cleanString(String value) {

        if (value == null) {

            return null;
        }

        String cleaned =
                value.trim();

        if (cleaned.isEmpty()) {

            return null;
        }

        return cleaned;
    }
}

