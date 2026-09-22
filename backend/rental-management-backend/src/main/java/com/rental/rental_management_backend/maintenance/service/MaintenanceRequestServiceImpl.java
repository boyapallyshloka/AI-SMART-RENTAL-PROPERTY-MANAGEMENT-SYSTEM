package com.rental.rental_management_backend.maintenance.service;

import java.io.IOException;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestRequest;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestResponse;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceStatusUpdateRequest;
import com.rental.rental_management_backend.maintenance.entity.MaintenanceRequest;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceStatus;
import com.rental.rental_management_backend.maintenance.repository.MaintenanceRequestRepository;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
@Transactional
public class MaintenanceRequestServiceImpl
        implements MaintenanceRequestService {

    // =========================================================
    // REPOSITORIES / SERVICES
    // =========================================================

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final UnitRepository unitRepository;
    private final MaintenanceImageService maintenanceImageService;
    private final UserRepository userRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public MaintenanceRequestServiceImpl(
            MaintenanceRequestRepository maintenanceRequestRepository,
            TenantRepository tenantRepository,
            PropertyRepository propertyRepository,
            UnitRepository unitRepository,
            MaintenanceImageService maintenanceImageService,
            UserRepository userRepository) {

        this.maintenanceRequestRepository =
                maintenanceRequestRepository;

        this.tenantRepository =
                tenantRepository;

        this.propertyRepository =
                propertyRepository;

        this.unitRepository =
                unitRepository;

        this.maintenanceImageService =
                maintenanceImageService;

        this.userRepository =
                userRepository;
    }

    // =========================================================
    // CREATE MAINTENANCE REQUEST
    //
    // TENANT IS TAKEN FROM LOGGED-IN USER
    //
    // Tenant ID is NOT taken from Swagger/request.
    // =========================================================

    @Override
    public MaintenanceRequestResponse createRequest(
            MaintenanceRequestRequest request,
            MultipartFile image) throws IOException {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // -----------------------------------------------------
        // CHECK AUTHENTICATION
        // -----------------------------------------------------

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        // -----------------------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------------------

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof UserDetails)) {

            throw new AccessDeniedException(
                    "Unable to identify logged-in user");
        }

        UserDetails userDetails =
                (UserDetails) principal;

        String email =
                userDetails.getUsername();

        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User user =
                userRepository
                        .findByEmail(email.toLowerCase().trim())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Logged-in user not found"));

        // -----------------------------------------------------
        // CHECK USER ROLE
        //
        // Controller already checks ROLE_TENANT.
        // This is an additional service-level safety check.
        // -----------------------------------------------------

        if (user.getRole() == null
                || !"TENANT".equals(
                        user.getRole().name())) {

            throw new AccessDeniedException(
                    "Only tenants can create maintenance requests");
        }

        // -----------------------------------------------------
        // FIND TENANT PROFILE
        // -----------------------------------------------------

        Tenant tenant =
                tenantRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Tenant profile not found "
                                                + "for logged-in user: "
                                                + email));

        // -----------------------------------------------------
        // FIND PROPERTY
        // -----------------------------------------------------

        Property property =
                propertyRepository
                        .findById(request.getPropertyId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found with ID: "
                                                + request.getPropertyId()));

        // -----------------------------------------------------
        // FIND UNIT
        // -----------------------------------------------------

        Unit unit =
                unitRepository
                        .findById(request.getUnitId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Unit not found with ID: "
                                                + request.getUnitId()));

        // -----------------------------------------------------
        // CREATE MAINTENANCE REQUEST
        // -----------------------------------------------------

        MaintenanceRequest maintenanceRequest =
                new MaintenanceRequest();

        // Tenant comes ONLY from logged-in user
        maintenanceRequest.setTenant(tenant);

        maintenanceRequest.setProperty(property);

        maintenanceRequest.setUnit(unit);

        maintenanceRequest.setCategory(
                request.getCategory());

        maintenanceRequest.setDescription(
                request.getDescription());

        maintenanceRequest.setPriority(
                request.getPriority());

        // New request starts as OPEN
        maintenanceRequest.setStatus(
                MaintenanceStatus.OPEN);

        // -----------------------------------------------------
        // OPTIONAL IMAGE
        // -----------------------------------------------------

        if (image != null && !image.isEmpty()) {

            String imageUrl =
                    maintenanceImageService
                            .saveImage(image);

            maintenanceRequest.setImageUrl(imageUrl);
        }

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        MaintenanceRequest savedRequest =
                maintenanceRequestRepository
                        .save(maintenanceRequest);

        return mapToResponse(savedRequest);
    }

    // =========================================================
    // GET ALL MAINTENANCE REQUESTS
    //
    // PROPERTY_MANAGER / PROPERTY_OWNER / SUPER_ADMIN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequestResponse> getAllRequests() {

        return maintenanceRequestRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET MAINTENANCE REQUEST BY ID
    //
    // TENANT:
    //     Can see only their own request.
    //
    // MANAGER / OWNER / SUPER ADMIN:
    //     Can see any request.
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public MaintenanceRequestResponse getRequestById(
            Long requestId) {

        MaintenanceRequest request =
                maintenanceRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Maintenance request not found "
                                                + "with ID: "
                                                + requestId));

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        boolean isTenant =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals("ROLE_TENANT"));

        // -----------------------------------------------------
        // TENANT OWNERSHIP CHECK
        // -----------------------------------------------------

        if (isTenant) {

            User user = getLoggedInUser();

            Tenant tenant =
                    tenantRepository
                            .findByUser(user)
                            .orElseThrow(() ->
                                    new AccessDeniedException(
                                            "Tenant profile not found "
                                                    + "for logged-in user"));

            if (request.getTenant() == null
                    || request.getTenant().getTenantId() == null) {

                throw new AccessDeniedException(
                        "Maintenance request has no tenant");
            }

            Long loggedInTenantId =
                    tenant.getTenantId();

            Long requestTenantId =
                    request.getTenant().getTenantId();

            if (!loggedInTenantId.equals(requestTenantId)) {

                throw new AccessDeniedException(
                        "You are not allowed to view "
                                + "this maintenance request");
            }
        }

        return mapToResponse(request);
    }

    // =========================================================
    // UPDATE MAINTENANCE REQUEST
    //
    // TENANT:
    // 1. Must own the request.
    // 2. Request must be OPEN.
    // 3. Cannot change owner.
    //
    // MANAGER / OWNER / SUPER ADMIN:
    // Allowed by controller.
    // =========================================================

    @Override
    public MaintenanceRequestResponse updateRequest(
            Long requestId,
            MaintenanceRequestRequest request,
            MultipartFile image) throws IOException {

        // -----------------------------------------------------
        // FIND EXISTING REQUEST
        // -----------------------------------------------------

        MaintenanceRequest existingRequest =
                maintenanceRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Maintenance request not found "
                                                + "with ID: "
                                                + requestId));

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        boolean isTenant =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals("ROLE_TENANT"));

        // =====================================================
        // TENANT SECURITY CHECK
        // =====================================================

        if (isTenant) {

            User user = getLoggedInUser();

            Tenant loggedInTenant =
                    tenantRepository
                            .findByUser(user)
                            .orElseThrow(() ->
                                    new AccessDeniedException(
                                            "Tenant profile not found "
                                                    + "for logged-in user"));

            // -------------------------------------------------
            // CHECK REQUEST OWNERSHIP
            // -------------------------------------------------

            if (existingRequest.getTenant() == null
                    || existingRequest.getTenant().getTenantId() == null) {

                throw new AccessDeniedException(
                        "Maintenance request has no tenant");
            }

            Long loggedInTenantId =
                    loggedInTenant.getTenantId();

            Long requestTenantId =
                    existingRequest
                            .getTenant()
                            .getTenantId();

            if (!loggedInTenantId.equals(requestTenantId)) {

                throw new AccessDeniedException(
                        "You are not allowed to update "
                                + "this maintenance request");
            }

            // -------------------------------------------------
            // TENANT CAN UPDATE ONLY OPEN REQUESTS
            // -------------------------------------------------

            MaintenanceStatus currentStatus =
                    existingRequest.getStatus();

            if (currentStatus != null
                    && currentStatus != MaintenanceStatus.OPEN) {

                throw new AccessDeniedException(
                        "You cannot update this maintenance request "
                                + "because it is already being processed");
            }
        }

        // =====================================================
        // FIND PROPERTY
        // =====================================================

        Property property =
                propertyRepository
                        .findById(request.getPropertyId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Property not found with ID: "
                                                + request.getPropertyId()));

        // =====================================================
        // FIND UNIT
        // =====================================================

        Unit unit =
                unitRepository
                        .findById(request.getUnitId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Unit not found with ID: "
                                                + request.getUnitId()));

        // =====================================================
        // TENANT HANDLING
        // =====================================================

        Tenant tenant;

        if (isTenant) {

            // Tenant cannot change ownership
            tenant = existingRequest.getTenant();

        } else {

            tenant =
                    tenantRepository
                            .findById(request.getTenantId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Tenant not found with ID: "
                                                    + request.getTenantId()));
        }

        // =====================================================
        // UPDATE BASIC FIELDS
        // =====================================================

        existingRequest.setTenant(tenant);

        existingRequest.setProperty(property);

        existingRequest.setUnit(unit);

        existingRequest.setCategory(
                request.getCategory());

        existingRequest.setDescription(
                request.getDescription());

        existingRequest.setPriority(
                request.getPriority());

        // =====================================================
        // UPDATE STATUS IF PROVIDED
        // =====================================================

        if (request.getStatus() != null) {

            existingRequest.setStatus(
                    request.getStatus());
        }

        // =====================================================
        // UPDATE COMPLETED DATE IF PROVIDED
        // =====================================================

        if (request.getCompletedDate() != null) {

            existingRequest.setCompletedDate(
                    request.getCompletedDate());
        }

        // =====================================================
        // UPDATE COST IF PROVIDED
        // =====================================================

        if (request.getCost() != null) {

            existingRequest.setCost(
                    request.getCost());
        }

        // =====================================================
        // UPDATE IMAGE IF PROVIDED
        // =====================================================

        if (image != null && !image.isEmpty()) {

            String imageUrl =
                    maintenanceImageService
                            .saveImage(image);

            existingRequest.setImageUrl(imageUrl);
        }

        // =====================================================
        // SAVE
        // =====================================================

        MaintenanceRequest updatedRequest =
                maintenanceRequestRepository
                        .save(existingRequest);

        return mapToResponse(updatedRequest);
    }

    // =========================================================
    // UPDATE STATUS
    //
    // PROPERTY_MANAGER / PROPERTY_OWNER / SUPER_ADMIN
    //
    // Tenant is blocked by @PreAuthorize in Controller.
    // =========================================================

    @Override
    public MaintenanceRequestResponse updateStatus(
            Long ticketId,
            MaintenanceStatusUpdateRequest request) {

        // -----------------------------------------------------
        // VALIDATE REQUEST BODY
        // -----------------------------------------------------

        if (request == null
                || request.getStatus() == null
                || request.getStatus().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Status is required");
        }

        // -----------------------------------------------------
        // FIND MAINTENANCE REQUEST
        // -----------------------------------------------------

        MaintenanceRequest maintenanceRequest =
                maintenanceRequestRepository
                        .findById(ticketId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Maintenance request not found "
                                                + "with ID: "
                                                + ticketId));

        // -----------------------------------------------------
        // CONVERT STRING TO ENUM
        // -----------------------------------------------------

        MaintenanceStatus newStatus;

        try {

            newStatus =
                    MaintenanceStatus.valueOf(
                            request.getStatus()
                                    .trim()
                                    .toUpperCase());

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Invalid maintenance status: "
                            + request.getStatus());
        }

        // -----------------------------------------------------
        // UPDATE STATUS
        // -----------------------------------------------------

        maintenanceRequest.setStatus(newStatus);

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        MaintenanceRequest updatedRequest =
                maintenanceRequestRepository
                        .save(maintenanceRequest);

        return mapToResponse(updatedRequest);
    }

    // =========================================================
    // DELETE MAINTENANCE REQUEST
    //
    // TENANT:
    // 1. Must own the request.
    // 2. Request must be OPEN.
    //
    // MANAGER / OWNER / SUPER ADMIN:
    // Allowed by controller.
    // =========================================================

    @Override
    public void deleteRequest(Long requestId) {

        // -----------------------------------------------------
        // FIND REQUEST
        // -----------------------------------------------------

        MaintenanceRequest request =
                maintenanceRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Maintenance request not found "
                                                + "with ID: "
                                                + requestId));

        // -----------------------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------------------

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        boolean isTenant =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals("ROLE_TENANT"));

        // =====================================================
        // TENANT SECURITY CHECK
        // =====================================================

        if (isTenant) {

            User user = getLoggedInUser();

            Tenant loggedInTenant =
                    tenantRepository
                            .findByUser(user)
                            .orElseThrow(() ->
                                    new AccessDeniedException(
                                            "Tenant profile not found "
                                                    + "for logged-in user"));

            // -------------------------------------------------
            // CHECK OWNERSHIP
            // -------------------------------------------------

            if (request.getTenant() == null
                    || request.getTenant().getTenantId() == null) {

                throw new AccessDeniedException(
                        "Maintenance request has no tenant");
            }

            Long loggedInTenantId =
                    loggedInTenant.getTenantId();

            Long requestTenantId =
                    request.getTenant()
                            .getTenantId();

            if (!loggedInTenantId.equals(requestTenantId)) {

                throw new AccessDeniedException(
                        "You are not allowed to delete "
                                + "this maintenance request");
            }

            // -------------------------------------------------
            // TENANT CAN DELETE ONLY OPEN REQUESTS
            // -------------------------------------------------

            if (request.getStatus() != MaintenanceStatus.OPEN) {

                throw new AccessDeniedException(
                        "You can delete a maintenance request "
                                + "only while its status is OPEN");
            }
        }

        // -----------------------------------------------------
        // DELETE
        // -----------------------------------------------------

        maintenanceRequestRepository.delete(request);
    }

    // =========================================================
    // HELPER METHOD
    //
    // GET CURRENT LOGGED-IN USER
    // =========================================================

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof UserDetails)) {

            throw new AccessDeniedException(
                    "Unable to identify logged-in user");
        }

        UserDetails userDetails =
                (UserDetails) principal;

        String email =
                userDetails.getUsername();

        return userRepository
                .findByEmail(email.toLowerCase().trim())
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Logged-in user not found"));
    }

    // =========================================================
    // MAP ENTITY TO RESPONSE DTO
    // =========================================================

    private MaintenanceRequestResponse mapToResponse(
            MaintenanceRequest request) {

        MaintenanceRequestResponse response =
                new MaintenanceRequestResponse();

        response.setRequestId(
                request.getRequestId());

        // -----------------------------------------------------
        // TENANT
        // -----------------------------------------------------

        if (request.getTenant() != null) {

            response.setTenantId(
                    request.getTenant()
                            .getTenantId());
        }

        // -----------------------------------------------------
        // PROPERTY
        // -----------------------------------------------------

        if (request.getProperty() != null) {

            response.setPropertyId(
                    request.getProperty()
                            .getPropertyId());
        }

        // -----------------------------------------------------
        // UNIT
        // -----------------------------------------------------

        if (request.getUnit() != null) {

            response.setUnitId(
                    request.getUnit()
                            .getUnitId());
        }

        // -----------------------------------------------------
        // MAINTENANCE DETAILS
        // -----------------------------------------------------

        response.setCategory(
                request.getCategory());

        response.setDescription(
                request.getDescription());

        response.setPriority(
                request.getPriority());

        response.setStatus(
                request.getStatus());

        response.setImageUrl(
                request.getImageUrl());

        response.setRequestedDate(
                request.getRequestedDate());

        response.setCompletedDate(
                request.getCompletedDate());

        response.setCost(
                request.getCost());

        return response;
    }
}