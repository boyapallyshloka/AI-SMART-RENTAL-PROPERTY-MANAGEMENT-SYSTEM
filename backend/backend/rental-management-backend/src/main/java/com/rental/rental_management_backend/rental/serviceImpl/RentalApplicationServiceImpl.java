package com.rental.rental_management_backend.rental.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.property.entity.Building;
import com.rental.rental_management_backend.property.entity.Floor;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
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

    public RentalApplicationServiceImpl(
            RentalApplicationRepository rentalApplicationRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            UnitRepository unitRepository) {

        this.rentalApplicationRepository = rentalApplicationRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.unitRepository = unitRepository;
    }

    // ============================================================
    // CREATE APPLICATION
    // ============================================================

    @Override
    public RentalApplicationResponse createApplication(
            String email,
            RentalApplicationCreateRequest request) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Application request is required");
        }

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email));

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant profile not found for user"));

        Unit unit = unitRepository
                .findById(request.getUnitId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                        + request.getUnitId()));

        /*
         * Prevent the same tenant from having
         * multiple pending applications for
         * the same unit.
         */
        boolean alreadyApplied =
                rentalApplicationRepository
                        .existsByTenant_TenantIdAndUnit_UnitIdAndStatus(
                                tenant.getTenantId(),
                                unit.getUnitId(),
                                RentalApplicationStatus.PENDING
                        );

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
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public RentalApplicationResponse getApplicationById(
            Long applicationId) {

        RentalApplication application =
                rentalApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rental application not found "
                                                + "with ID: "
                                                + applicationId));

        return mapToResponse(application);
    }

    // ============================================================
    // GET MY APPLICATIONS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getMyApplications(
            String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email));

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant profile not found for user"));

        return rentalApplicationRepository
                .findByTenant_TenantId(tenant.getTenantId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET APPLICATIONS FOR UNIT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getApplicationsForUnit(
            Long unitId) {

        unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: "
                                        + unitId));

        return rentalApplicationRepository
                .findByUnit_UnitId(unitId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET ALL APPLICATIONS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalApplicationResponse> getAllApplications() {

        return rentalApplicationRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // REVIEW APPLICATION
    // ============================================================

    @Override
    public RentalApplicationResponse reviewApplication(
            Long applicationId,
            String email,
            RentalApplicationReviewRequest request) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Review request is required");
        }

        if (request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "Application status is required");
        }

        RentalApplication application =
                rentalApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rental application not found "
                                                + "with ID: "
                                                + applicationId));

        /*
         * Only PENDING applications can be reviewed.
         */
        if (application.getStatus()
                != RentalApplicationStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending applications can be reviewed");
        }

        /*
         * Find the property through:
         *
         * Application
         *      ↓
         * Unit
         *      ↓
         * Floor
         *      ↓
         * Building
         *      ↓
         * Property
         *      ↓
         * Owner
         */
        Unit unit = application.getUnit();

        if (unit == null) {
            throw new ResourceNotFoundException(
                    "Unit not found for this application");
        }

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

        User owner = property.getOwner();

        if (owner == null) {
            throw new ResourceNotFoundException(
                    "Property owner not found");
        }

        /*
         * Only the owner of the property can
         * approve or reject the application.
         */
        if (owner.getEmail() == null
                || !owner.getEmail()
                        .equalsIgnoreCase(email.trim())) {

            throw new IllegalArgumentException(
                    "You are not authorized to review "
                            + "this application");
        }

        RentalApplicationStatus newStatus =
                request.getStatus();

        /*
         * Review operation supports only:
         *
         * APPROVED
         * REJECTED
         */
        if (newStatus != RentalApplicationStatus.APPROVED
                && newStatus != RentalApplicationStatus.REJECTED) {

            throw new IllegalArgumentException(
                    "Application can only be APPROVED "
                            + "or REJECTED");
        }

        // --------------------------------------------------------
        // REJECT APPLICATION
        // --------------------------------------------------------

        if (newStatus == RentalApplicationStatus.REJECTED) {

            String rejectionReason =
                    cleanString(request.getRejectionReason());

            if (rejectionReason == null) {
                throw new IllegalArgumentException(
                        "Rejection reason is required");
            }

            application.setRejectionReason(
                    rejectionReason);
        }

        // --------------------------------------------------------
        // APPROVE APPLICATION
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
    // ============================================================

    @Override
    public void withdrawApplication(
            Long applicationId,
            String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }

        RentalApplication application =
                rentalApplicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Rental application not found "
                                                + "with ID: "
                                                + applicationId));

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + email));

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant profile not found for user"));

        /*
         * Make sure the logged-in tenant owns
         * this application.
         */
        if (application.getTenant() == null
                || !application.getTenant()
                        .getTenantId()
                        .equals(tenant.getTenantId())) {

            throw new IllegalArgumentException(
                    "You are not allowed to withdraw "
                            + "this application");
        }

        /*
         * Only pending applications can be withdrawn.
         */
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
    // MAP ENTITY TO RESPONSE
    // ============================================================

    private RentalApplicationResponse mapToResponse(
            RentalApplication application) {

        RentalApplicationResponse response =
                new RentalApplicationResponse();

        // --------------------------------------------------------
        // Application ID
        // --------------------------------------------------------

        response.setApplicationId(
                application.getApplicationId());

        // --------------------------------------------------------
        // Tenant
        // --------------------------------------------------------

        Tenant tenant = application.getTenant();

        if (tenant != null) {

            response.setTenantId(
                    tenant.getTenantId());

            User user = tenant.getUser();

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
        // Unit
        // --------------------------------------------------------

        Unit unit = application.getUnit();

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
            // Floor
            // ----------------------------------------------------

            Floor floor = unit.getFloor();

            if (floor != null) {

                response.setFloorId(
                        floor.getFloorId());

                // ------------------------------------------------
                // Building
                // ------------------------------------------------

                Building building =
                        floor.getBuilding();

                if (building != null) {

                    response.setBuildingId(
                            building.getBuildingId());

                    response.setBuildingName(
                            building.getBuildingName());

                    // --------------------------------------------
                    // Property
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
        // Application Details
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

        String cleaned = value.trim();

        if (cleaned.isEmpty()) {
            return null;
        }

        return cleaned;
    }
}