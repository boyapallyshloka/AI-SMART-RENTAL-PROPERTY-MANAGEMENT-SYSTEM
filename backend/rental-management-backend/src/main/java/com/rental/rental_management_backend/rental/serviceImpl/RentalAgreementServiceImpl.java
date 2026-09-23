package com.rental.rental_management_backend.rental.serviceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.rental.dto.RentalAgreementRequest;
import com.rental.rental_management_backend.rental.dto.RentalAgreementResponse;
import com.rental.rental_management_backend.rental.entity.RentalAgreement;
import com.rental.rental_management_backend.rental.entity.RentalApplication;
import com.rental.rental_management_backend.rental.enums.AgreementStatus;
import com.rental.rental_management_backend.rental.repository.RentalAgreementRepository;
import com.rental.rental_management_backend.rental.repository.RentalApplicationRepository;
import com.rental.rental_management_backend.rental.service.RentalAgreementService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;


import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

@Service
@Transactional
public class RentalAgreementServiceImpl implements RentalAgreementService {

    private final RentalAgreementRepository rentalAgreementRepository;
    private final RentalApplicationRepository rentalApplicationRepository;
    private final UserRepository userRepository;

    public RentalAgreementServiceImpl(
            RentalAgreementRepository rentalAgreementRepository,
            RentalApplicationRepository rentalApplicationRepository,
            UserRepository userRepository) {

        this.rentalAgreementRepository = rentalAgreementRepository;
        this.rentalApplicationRepository = rentalApplicationRepository;
        this.userRepository = userRepository;
    }
    private static final String AGREEMENT_UPLOAD_DIRECTORY =
            "uploads/rental-agreements";

    // =========================================================
    // CREATE AGREEMENT
    // SUPER_ADMIN / PROPERTY_OWNER / PROPERTY_MANAGER
    // =========================================================

    @Override
    public RentalAgreementResponse createAgreement(
            RentalAgreementRequest request,
            String email) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Rental agreement request is required");
        }

        if (request.getApplicationId() == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        User user = getUserByEmail(email);

        RentalApplication application =
                rentalApplicationRepository
                        .findById(request.getApplicationId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental application not found with ID: "
                                                + request.getApplicationId()));

        // -----------------------------------------------------
        // Application must be APPROVED
        // -----------------------------------------------------

        if (application.getStatus() == null
                || !"APPROVED".equalsIgnoreCase(
                        application.getStatus().name())) {

            throw new IllegalStateException(
                    "Rental agreement can be created only for an APPROVED rental application");
        }

        // -----------------------------------------------------
        // Tenant cannot create agreement
        // -----------------------------------------------------

        if (user.getRole() == RoleType.TENANT) {

            throw new IllegalStateException(
                    "Tenant is not authorized to create a rental agreement");
        }

        // -----------------------------------------------------
        // Only allowed management roles
        // -----------------------------------------------------

        if (user.getRole() != RoleType.SUPER_ADMIN
                && user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new IllegalStateException(
                    "You are not authorized to create a rental agreement");
        }

        // -----------------------------------------------------
        // Owner / Manager property access
        // -----------------------------------------------------

        if (user.getRole() != RoleType.SUPER_ADMIN
                && !hasApplicationPropertyAccess(application, user)) {

            throw new IllegalStateException(
                    "You are not authorized to create an agreement for this property");
        }

        // -----------------------------------------------------
        // Application must have tenant and unit
        // -----------------------------------------------------

        if (application.getTenant() == null) {
            throw new IllegalStateException(
                    "Rental application does not have a tenant");
        }

        if (application.getUnit() == null) {
            throw new IllegalStateException(
                    "Rental application does not have a unit");
        }

        Unit unit = application.getUnit();

        // -----------------------------------------------------
        // Prevent duplicate agreement for application
        // -----------------------------------------------------

        if (rentalAgreementRepository
                .existsByRentalApplication_ApplicationId(
                        request.getApplicationId())) {

            throw new IllegalStateException(
                    "A rental agreement already exists for this application");
        }

        // -----------------------------------------------------
        // Unit must currently be VACANT
        // -----------------------------------------------------

        if (unit.getStatus() != UnitStatus.VACANT) {

            throw new IllegalStateException(
                    "Rental agreement cannot be created because the unit is not vacant");
        }

        // -----------------------------------------------------
        // Validate dates
        // -----------------------------------------------------

        validateDates(request);

        // -----------------------------------------------------
        // Validate financial fields
        // -----------------------------------------------------

        if (request.getMonthlyRent() == null) {
            throw new IllegalArgumentException(
                    "Monthly rent is required");
        }

        if (request.getMonthlyRent().signum() < 0) {
            throw new IllegalArgumentException(
                    "Monthly rent cannot be negative");
        }

        if (request.getSecurityDeposit() != null
                && request.getSecurityDeposit().signum() < 0) {

            throw new IllegalArgumentException(
                    "Security deposit cannot be negative");
        }

        // -----------------------------------------------------
        // Validate due day
        // -----------------------------------------------------

        if (request.getDueDay() != null
                && (request.getDueDay() < 1
                || request.getDueDay() > 31)) {

            throw new IllegalArgumentException(
                    "Due day must be between 1 and 31");
        }

        // -----------------------------------------------------
        // Validate notice period
        // -----------------------------------------------------

        if (request.getNoticePeriodDays() != null
                && request.getNoticePeriodDays() < 0) {

            throw new IllegalArgumentException(
                    "Notice period cannot be negative");
        }

        // -----------------------------------------------------
        // Create agreement
        // -----------------------------------------------------

        RentalAgreement agreement = new RentalAgreement();

        // These come from the approved application.
        // Frontend cannot change tenant/unit.
        agreement.setRentalApplication(application);
        agreement.setTenant(application.getTenant());
        agreement.setUnit(unit);

        agreement.setStartDate(request.getStartDate());
        agreement.setEndDate(request.getEndDate());

        agreement.setMonthlyRent(request.getMonthlyRent());
        agreement.setSecurityDeposit(request.getSecurityDeposit());

        agreement.setDueDay(request.getDueDay());
        agreement.setNoticePeriodDays(
                request.getNoticePeriodDays());

        agreement.setMoveInDate(request.getMoveInDate());
        agreement.setTermsAndConditions(
                cleanString(request.getTermsAndConditions()));

        agreement.setAgreementDocument(
                cleanString(request.getAgreementDocument()));

        // New agreement starts as DRAFT.
        agreement.setStatus(AgreementStatus.DRAFT);

        RentalAgreement savedAgreement =
                rentalAgreementRepository.save(agreement);

        return mapToResponse(savedAgreement);
    }

    // =========================================================
    // GET ONE AGREEMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public RentalAgreementResponse getAgreement(
            Long agreementId,
            String email) {

        User user = getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository.findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        if (!hasAccess(agreement, user)) {

            throw new IllegalStateException(
                    "You are not authorized to access this rental agreement");
        }

        return mapToResponse(agreement);
    }

    // =========================================================
    // TENANT -> MY AGREEMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalAgreementResponse> getMyAgreements(
            String email) {

        User user = getUserByEmail(email);

        if (user.getRole() != RoleType.TENANT) {

            throw new IllegalStateException(
                    "Only tenants can access their own agreements");
        }

        return rentalAgreementRepository
                .findByTenant_User_Email(email)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET ALL AGREEMENTS
    //
    // SUPER_ADMIN      -> ALL
    // PROPERTY_OWNER   -> OWN PROPERTIES
    // PROPERTY_MANAGER -> ASSIGNED PROPERTIES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalAgreementResponse> getAllAgreements(
            String email) {

        User user = getUserByEmail(email);

        if (user.getRole() == RoleType.TENANT) {

            throw new IllegalStateException(
                    "Tenant should use the My Agreements endpoint");
        }

        if (user.getRole() != RoleType.SUPER_ADMIN
                && user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new IllegalStateException(
                    "You are not authorized to view rental agreements");
        }

        // -----------------------------------------------------
        // SUPER ADMIN -> ALL AGREEMENTS
        // -----------------------------------------------------

        if (user.getRole() == RoleType.SUPER_ADMIN) {

            return rentalAgreementRepository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // -----------------------------------------------------
        // OWNER / MANAGER -> AUTHORIZED PROPERTIES ONLY
        // -----------------------------------------------------

        return rentalAgreementRepository.findAll()
                .stream()
                .filter(agreement -> hasAccess(agreement, user))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE STATUS
    //
    // ACTIVE
    // EXPIRED
    // TERMINATED
    // =========================================================

    @Override
    public RentalAgreementResponse updateStatus(
            Long agreementId,
            AgreementStatus status,
            String email) {

        User user = getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository.findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        validateManagementAccess(agreement, user);

        if (status == null) {

            throw new IllegalArgumentException(
                    "Agreement status is required");
        }

        AgreementStatus currentStatus =
                agreement.getStatus();

        // -----------------------------------------------------
        // No status change
        // -----------------------------------------------------

        if (currentStatus == status) {
            return mapToResponse(agreement);
        }

        // -----------------------------------------------------
        // DRAFT -> ACTIVE
        // -----------------------------------------------------

        if (status == AgreementStatus.ACTIVE) {

            validateActivation(agreement);

            agreement.setStatus(AgreementStatus.ACTIVE);

            occupyUnit(agreement.getUnit());
        }

        // -----------------------------------------------------
        // ACTIVE/DRAFT -> EXPIRED
        // -----------------------------------------------------

        else if (status == AgreementStatus.EXPIRED) {

            if (currentStatus != AgreementStatus.ACTIVE
                    && currentStatus != AgreementStatus.DRAFT) {

                throw new IllegalStateException(
                        "Only DRAFT or ACTIVE agreements can be marked as expired");
            }

            if (agreement.getEndDate() == null) {

                throw new IllegalStateException(
                        "Agreement end date is required before expiration");
            }

            if (agreement.getEndDate()
                    .isAfter(LocalDate.now())) {

                throw new IllegalStateException(
                        "Agreement cannot be marked expired before its end date");
            }

            agreement.setStatus(AgreementStatus.EXPIRED);

            releaseUnit(agreement.getUnit());
        }

        // -----------------------------------------------------
        // ACTIVE/DRAFT -> TERMINATED
        // -----------------------------------------------------

        else if (status == AgreementStatus.TERMINATED) {

            if (currentStatus != AgreementStatus.ACTIVE
                    && currentStatus != AgreementStatus.DRAFT) {

                throw new IllegalStateException(
                        "Only DRAFT or ACTIVE agreements can be terminated");
            }

            agreement.setStatus(AgreementStatus.TERMINATED);

            if (agreement.getMoveOutDate() == null) {

                agreement.setMoveOutDate(LocalDate.now());
            }

            releaseUnit(agreement.getUnit());
        }

        // -----------------------------------------------------
        // DRAFT can remain DRAFT
        // -----------------------------------------------------

        else if (status == AgreementStatus.DRAFT) {

            if (currentStatus == AgreementStatus.ACTIVE) {

                throw new IllegalStateException(
                        "An active agreement cannot be changed back to draft");
            }

            agreement.setStatus(AgreementStatus.DRAFT);
        }

        RentalAgreement updatedAgreement =
                rentalAgreementRepository.save(agreement);

        return mapToResponse(updatedAgreement);
    }

    // =========================================================
    // UPDATE MOVE-OUT DATE
    // =========================================================

    @Override
    public RentalAgreementResponse updateMoveOutDate(
            Long agreementId,
            LocalDate moveOutDate,
            String email) {

        User user = getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository.findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        validateManagementAccess(agreement, user);

        if (moveOutDate == null) {

            throw new IllegalArgumentException(
                    "Move-out date is required");
        }

        if (agreement.getStartDate() != null
                && moveOutDate.isBefore(
                        agreement.getStartDate())) {

            throw new IllegalArgumentException(
                    "Move-out date cannot be before agreement start date");
        }

        if (agreement.getEndDate() != null
                && moveOutDate.isAfter(
                        agreement.getEndDate())) {

            throw new IllegalArgumentException(
                    "Move-out date cannot be after agreement end date");
        }

        agreement.setMoveOutDate(moveOutDate);

        // -----------------------------------------------------
        // Active agreement becomes terminated
        // -----------------------------------------------------

        if (agreement.getStatus() == AgreementStatus.ACTIVE) {

            agreement.setStatus(
                    AgreementStatus.TERMINATED);

            releaseUnit(agreement.getUnit());
        }

        RentalAgreement updatedAgreement =
                rentalAgreementRepository.save(agreement);

        return mapToResponse(updatedAgreement);
    }

    // =========================================================
    // VALIDATE ACTIVATION
    // =========================================================

    private void validateActivation(
            RentalAgreement agreement) {

        if (agreement.getStartDate() == null
                || agreement.getEndDate() == null) {

            throw new IllegalStateException(
                    "Agreement start date and end date are required before activation");
        }

        if (agreement.getEndDate()
                .isBefore(agreement.getStartDate())) {

            throw new IllegalStateException(
                    "Agreement end date cannot be before start date");
        }

        if (agreement.getMoveInDate() != null
                && agreement.getMoveInDate()
                .isBefore(agreement.getStartDate())) {

            throw new IllegalStateException(
                    "Move-in date cannot be before agreement start date");
        }

        if (agreement.getUnit() == null) {

            throw new IllegalStateException(
                    "Agreement unit is missing");
        }

        Unit unit = agreement.getUnit();

        // -----------------------------------------------------
        // Unit must be vacant
        // -----------------------------------------------------

        if (unit.getStatus() != UnitStatus.VACANT) {

            throw new IllegalStateException(
                    "Agreement cannot be activated because the unit is not vacant");
        }

        // -----------------------------------------------------
        // Prevent another ACTIVE agreement on same unit
        // -----------------------------------------------------

        if (rentalAgreementRepository
                .existsByUnit_UnitIdAndStatus(
                        unit.getUnitId(),
                        AgreementStatus.ACTIVE)) {

            throw new IllegalStateException(
                    "This unit already has an active rental agreement");
        }
    }

    // =========================================================
    // OCCUPY UNIT
    // =========================================================

    private void occupyUnit(Unit unit) {

        if (unit == null) {
            return;
        }

        unit.setStatus(UnitStatus.OCCUPIED);
    }

    // =========================================================
    // RELEASE UNIT
    // =========================================================

    private void releaseUnit(Unit unit) {

        if (unit == null) {
            return;
        }

        unit.setStatus(UnitStatus.VACANT);
    }

    // =========================================================
    // VALIDATE CREATE DATES
    // =========================================================

    private void validateDates(
            RentalAgreementRequest request) {

        if (request.getStartDate() == null
                || request.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Agreement start date and end date are required");
        }

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new IllegalArgumentException(
                    "Agreement end date cannot be before start date");
        }

        if (request.getMoveInDate() != null
                && request.getMoveInDate()
                        .isBefore(request.getStartDate())) {

            throw new IllegalArgumentException(
                    "Move-in date cannot be before agreement start date");
        }

        if (request.getMoveInDate() != null
                && request.getMoveInDate()
                        .isAfter(request.getEndDate())) {

            throw new IllegalArgumentException(
                    "Move-in date cannot be after agreement end date");
        }
    }

    // =========================================================
    // USER LOOKUP
    // =========================================================

    private User getUserByEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "User not found with email: "
                                        + email));
    }

    // =========================================================
    // GENERAL AGREEMENT ACCESS
    // =========================================================

    private boolean hasAccess(
            RentalAgreement agreement,
            User user) {

        if (agreement == null || user == null) {
            return false;
        }

        // -----------------------------------------------------
        // SUPER ADMIN
        // -----------------------------------------------------

        if (user.getRole() == RoleType.SUPER_ADMIN) {
            return true;
        }

        // -----------------------------------------------------
        // TENANT -> OWN AGREEMENT
        // -----------------------------------------------------

        if (user.getRole() == RoleType.TENANT) {

            return agreement.getTenant() != null
                    && agreement.getTenant().getUser() != null
                    && agreement.getTenant().getUser().getId() != null
                    && agreement.getTenant().getUser().getId()
                            .equals(user.getId());
        }

        // -----------------------------------------------------
        // Get property through:
        //
        // Agreement
        //   -> Unit
        //      -> Floor
        //         -> Building
        //            -> Property
        // -----------------------------------------------------

        if (agreement.getUnit() == null
                || agreement.getUnit().getFloor() == null
                || agreement.getUnit().getFloor()
                        .getBuilding() == null
                || agreement.getUnit().getFloor()
                        .getBuilding().getProperty() == null) {

            return false;
        }

        var property = agreement.getUnit()
                .getFloor()
                .getBuilding()
                .getProperty();

        // -----------------------------------------------------
        // PROPERTY OWNER
        // -----------------------------------------------------

        if (user.getRole() == RoleType.PROPERTY_OWNER) {

            return property.getOwner() != null
                    && property.getOwner().getId() != null
                    && property.getOwner().getId()
                            .equals(user.getId());
        }

        // -----------------------------------------------------
        // PROPERTY MANAGER
        // -----------------------------------------------------

        if (user.getRole() == RoleType.PROPERTY_MANAGER) {

            return property.getPropertyManager() != null
                    && property.getPropertyManager().getUser() != null
                    && property.getPropertyManager()
                            .getUser().getId() != null
                    && property.getPropertyManager()
                            .getUser().getId()
                            .equals(user.getId());
        }

        return false;
    }

    // =========================================================
    // APPLICATION PROPERTY ACCESS
    // =========================================================

    private boolean hasApplicationPropertyAccess(
            RentalApplication application,
            User user) {

        if (application == null
                || application.getUnit() == null
                || application.getUnit().getFloor() == null
                || application.getUnit().getFloor()
                        .getBuilding() == null
                || application.getUnit().getFloor()
                        .getBuilding().getProperty() == null) {

            return false;
        }

        var property = application.getUnit()
                .getFloor()
                .getBuilding()
                .getProperty();

        // -----------------------------------------------------
        // PROPERTY OWNER
        // -----------------------------------------------------

        if (user.getRole() == RoleType.PROPERTY_OWNER) {

            return property.getOwner() != null
                    && property.getOwner().getId() != null
                    && property.getOwner().getId()
                            .equals(user.getId());
        }

        // -----------------------------------------------------
        // PROPERTY MANAGER
        // -----------------------------------------------------

        if (user.getRole() == RoleType.PROPERTY_MANAGER) {

            return property.getPropertyManager() != null
                    && property.getPropertyManager().getUser() != null
                    && property.getPropertyManager()
                            .getUser().getId() != null
                    && property.getPropertyManager()
                            .getUser().getId()
                            .equals(user.getId());
        }

        return false;
    }

    // =========================================================
    // MANAGEMENT ACCESS
    // =========================================================

    private void validateManagementAccess(
            RentalAgreement agreement,
            User user) {

        if (user == null) {

            throw new IllegalStateException(
                    "Authenticated user not found");
        }

        // Tenant cannot modify agreement
        if (user.getRole() == RoleType.TENANT) {

            throw new IllegalStateException(
                    "Tenant is not authorized to modify a rental agreement");
        }

        // Only management roles
        if (user.getRole() != RoleType.SUPER_ADMIN
                && user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new IllegalStateException(
                    "You are not authorized to modify this rental agreement");
        }

        // Super admin has global access
        if (user.getRole() == RoleType.SUPER_ADMIN) {
            return;
        }

        // Owner / manager must have property access
        if (!hasAccess(agreement, user)) {

            throw new IllegalStateException(
                    "You are not authorized to modify this rental agreement");
        }
    }

    // =========================================================
    // RESPONSE MAPPING
    // =========================================================

    private RentalAgreementResponse mapToResponse(
            RentalAgreement agreement) {

        RentalAgreementResponse response =
                new RentalAgreementResponse();

        response.setAgreementId(
                agreement.getAgreementId());

        if (agreement.getRentalApplication() != null) {

            response.setApplicationId(
                    agreement.getRentalApplication()
                            .getApplicationId());
        }

        if (agreement.getTenant() != null) {

            response.setTenantId(
                    agreement.getTenant().getTenantId());
        }

        if (agreement.getUnit() != null) {

            response.setUnitId(
                    agreement.getUnit().getUnitId());
        }

        response.setStartDate(
                agreement.getStartDate());

        response.setEndDate(
                agreement.getEndDate());

        response.setMonthlyRent(
                agreement.getMonthlyRent());

        response.setSecurityDeposit(
                agreement.getSecurityDeposit());

        response.setDueDay(
                agreement.getDueDay());

        response.setNoticePeriodDays(
                agreement.getNoticePeriodDays());

        response.setAgreementDocument(
                agreement.getAgreementDocument());

        response.setMoveInDate(
                agreement.getMoveInDate());

        response.setMoveOutDate(
                agreement.getMoveOutDate());

        response.setStatus(
                agreement.getStatus());

        response.setTermsAndConditions(
                agreement.getTermsAndConditions());

        response.setCreatedAt(
                agreement.getCreatedAt());

        response.setUpdatedAt(
                agreement.getUpdatedAt());

        return response;
    }

    // =========================================================
    // CLEAN STRING
    // =========================================================

    private String cleanString(String value) {

        if (value == null) {
            return null;
        }

        String cleaned = value.trim();

        return cleaned.isEmpty() ? null : cleaned;
    }
    @Override
    @Transactional
    public RentalAgreementResponse uploadAgreementDocument(
            Long agreementId,
            MultipartFile file,
            String email) {

        /*
         * Get authenticated user.
         */
        User user = getUserByEmail(email);

        /*
         * Validate file.
         */
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Agreement document file is required");
        }

        /*
         * Validate filename.
         */
        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null
                || originalFilename.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Agreement document filename is required");
        }

        /*
         * Only PDF files are allowed.
         */
        boolean validPdfExtension =
                originalFilename
                        .toLowerCase()
                        .endsWith(".pdf");

        boolean validPdfContentType =
                "application/pdf".equalsIgnoreCase(
                        file.getContentType());

        if (!validPdfExtension || !validPdfContentType) {

            throw new IllegalArgumentException(
                    "Only PDF agreement documents are allowed");
        }

        /*
         * Maximum file size = 10 MB.
         */
        long maxFileSize =
                10L * 1024L * 1024L;

        if (file.getSize() > maxFileSize) {

            throw new IllegalArgumentException(
                    "Agreement document size must not exceed 10 MB");
        }

        /*
         * Load agreement.
         */
        RentalAgreement agreement =
                rentalAgreementRepository.findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        /*
         * Validate management role and property access.
         *
         * Uses your EXISTING access-control logic.
         */
        validateManagementAccess(agreement, user);

        /*
         * Create upload directory.
         */
        try {

            Path uploadDirectory =
                    Paths.get(AGREEMENT_UPLOAD_DIRECTORY)
                            .toAbsolutePath()
                            .normalize();

            Files.createDirectories(uploadDirectory);

            /*
             * Generate a unique filename.
             *
             * Never use the original filename as
             * the stored server filename.
             */
            String storedFilename =
                    "agreement_"
                            + agreementId
                            + "_"
                            + UUID.randomUUID()
                            + ".pdf";

            Path targetFile =
                    uploadDirectory
                            .resolve(storedFilename)
                            .normalize();

            /*
             * Path traversal protection.
             */
            if (!targetFile.startsWith(uploadDirectory)) {

                throw new IllegalArgumentException(
                        "Invalid agreement document path");
            }

            /*
             * Save uploaded PDF.
             */
            Files.copy(
                    file.getInputStream(),
                    targetFile,
                    StandardCopyOption.REPLACE_EXISTING);

            /*
             * Delete old document if one exists.
             */
            String oldDocument =
                    agreement.getAgreementDocument();

            if (oldDocument != null
                    && !oldDocument.trim().isEmpty()) {

                try {

                    String oldFilename =
                            Paths.get(oldDocument)
                                    .getFileName()
                                    .toString();

                    Path oldFile =
                            uploadDirectory
                                    .resolve(oldFilename)
                                    .normalize();

                    if (oldFile.startsWith(uploadDirectory)) {

                        Files.deleteIfExists(oldFile);
                    }

                } catch (Exception ignored) {
                    /*
                     * Failure to delete old document
                     * should not fail the new upload.
                     */
                }
            }

            /*
             * Store only the server-relative path
             * in the database.
             */
            agreement.setAgreementDocument(
                    "/uploads/rental-agreements/"
                            + storedFilename);

            RentalAgreement savedAgreement =
                    rentalAgreementRepository.save(agreement);

            return mapToResponse(savedAgreement);

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to upload rental agreement document",
                    ex);
        }
    }
    @Override
    @Transactional(readOnly = true)
    public Resource getAgreementDocument(
            Long agreementId,
            String email) {

        /*
         * Get authenticated user.
         */
        User user = getUserByEmail(email);

        /*
         * Load agreement.
         */
        RentalAgreement agreement =
                rentalAgreementRepository.findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        /*
         * Verify management or tenant access.
         *
         * Tenant -> own agreement
         * Owner -> own property's agreement
         * Manager -> assigned property's agreement
         * Super Admin -> any agreement
         */
        if (!hasAccess(agreement, user)) {
            throw new IllegalStateException(
                    "You are not authorized to access this agreement document");
        }

        /*
         * Check document exists in database.
         */
        String documentPath =
                agreement.getAgreementDocument();

        if (documentPath == null
                || documentPath.isBlank()) {

            throw new EntityNotFoundException(
                    "Agreement document not found for agreement ID: "
                            + agreementId);
        }

        /*
         * Use only the stored filename.
         *
         * This prevents a database/path value from
         * escaping the agreement upload directory.
         */
        String filename =
                Paths.get(documentPath)
                        .getFileName()
                        .toString();

        Path uploadDirectory =
                Paths.get(AGREEMENT_UPLOAD_DIRECTORY)
                        .toAbsolutePath()
                        .normalize();

        Path filePath =
                uploadDirectory
                        .resolve(filename)
                        .normalize();

        /*
         * Path traversal protection.
         */
        if (!filePath.startsWith(uploadDirectory)) {

            throw new IllegalStateException(
                    "Invalid agreement document path");
        }

        /*
         * Verify file exists.
         */
        if (!Files.exists(filePath)
                || !Files.isRegularFile(filePath)) {

            throw new EntityNotFoundException(
                    "Agreement document file not found");
        }

        return new FileSystemResource(filePath);
    }
}