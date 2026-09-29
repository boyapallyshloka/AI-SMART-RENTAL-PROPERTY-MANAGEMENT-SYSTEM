
package com.rental.rental_management_backend.rental.serviceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
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
import com.rental.rental_management_backend.rental.service.RentalAgreementPdfService;
import com.rental.rental_management_backend.rental.service.RentalAgreementService;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class RentalAgreementServiceImpl
        implements RentalAgreementService {

    private final RentalAgreementRepository rentalAgreementRepository;

    private final RentalApplicationRepository rentalApplicationRepository;

    private final UserRepository userRepository;

    private final RentalAgreementPdfService rentalAgreementPdfService;

    private static final String AGREEMENT_UPLOAD_DIRECTORY =
            "uploads/rental-agreements";

    public RentalAgreementServiceImpl(
            RentalAgreementRepository rentalAgreementRepository,
            RentalApplicationRepository rentalApplicationRepository,
            UserRepository userRepository,
            RentalAgreementPdfService rentalAgreementPdfService) {

        this.rentalAgreementRepository =
                rentalAgreementRepository;

        this.rentalApplicationRepository =
                rentalApplicationRepository;

        this.userRepository =
                userRepository;

        this.rentalAgreementPdfService =
                rentalAgreementPdfService;
    }

    // =========================================================
    // CREATE AGREEMENT
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

        User user =
                getUserByEmail(email);

        RentalApplication application =
                rentalApplicationRepository
                        .findById(request.getApplicationId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental application not found with ID: "
                                                + request.getApplicationId()));

        // Application must be approved.
        if (application.getStatus() == null
                || !"APPROVED".equalsIgnoreCase(
                        application.getStatus().name())) {

            throw new IllegalStateException(
                    "Rental agreement can be created only for an APPROVED rental application");
        }

        // Tenant cannot create agreement.
        if (user.getRole() == RoleType.TENANT) {

            throw new IllegalStateException(
                    "Tenant is not authorized to create a rental agreement");
        }

        // Only management roles.
        if (user.getRole() != RoleType.SUPER_ADMIN
                && user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new IllegalStateException(
                    "You are not authorized to create a rental agreement");
        }

        // Owner / Manager property access.
        if (user.getRole() != RoleType.SUPER_ADMIN
                && !hasApplicationPropertyAccess(
                        application,
                        user)) {

            throw new IllegalStateException(
                    "You are not authorized to create an agreement for this property");
        }

        // Application must contain tenant and unit.
        if (application.getTenant() == null) {

            throw new IllegalStateException(
                    "Rental application does not have a tenant");
        }

        if (application.getUnit() == null) {

            throw new IllegalStateException(
                    "Rental application does not have a unit");
        }

        Unit unit =
                application.getUnit();

        // Prevent duplicate agreement.
        if (rentalAgreementRepository
                .existsByRentalApplication_ApplicationId(
                        request.getApplicationId())) {

            throw new IllegalStateException(
                    "A rental agreement already exists for this application");
        }

        // Unit must be vacant.
        if (unit.getStatus() != UnitStatus.VACANT) {

            throw new IllegalStateException(
                    "Rental agreement cannot be created because the unit is not vacant");
        }

        // Validate application dates and lease duration.
        validateDates(
                application);

        // Validate due day.
        if (request.getDueDay() != null
                && (request.getDueDay() < 1
                || request.getDueDay() > 31)) {

            throw new IllegalArgumentException(
                    "Due day must be between 1 and 31");
        }

        // Validate notice period.
        if (request.getNoticePeriodDays() != null
                && request.getNoticePeriodDays() < 0) {

            throw new IllegalArgumentException(
                    "Notice period cannot be negative");
        }

        // =====================================================
        // CREATE AGREEMENT
        // =====================================================

        RentalAgreement agreement =
                new RentalAgreement();

        // These are derived from the approved application.
        agreement.setRentalApplication(application);

        agreement.setTenant(
                application.getTenant());

        agreement.setUnit(unit);

        // =====================================================
        // AGREEMENT DATES
        // =====================================================

        // Start date comes from the preferred move-in date
        // stored in the Rental Application.
        //
        // End date is automatically calculated from the
        // preferred lease duration.
        //
        // Example:
        // 2026-10-01 + 12 months - 1 day
        // = 2027-09-30
        // =====================================================

        LocalDate startDate =
                application.getPreferredMoveInDate();

        Integer leaseDurationMonths =
                application.getPreferredLeaseDurationMonths();

        LocalDate endDate =
                startDate
                        .plusMonths(leaseDurationMonths)
                        .minusDays(1);

        agreement.setStartDate(
                startDate);

        agreement.setEndDate(
                endDate);

        // =====================================================
        // FINANCIAL DETAILS FROM UNIT
        // =====================================================

        agreement.setMonthlyRent(
                unit.getMonthlyRent());

        agreement.setSecurityDeposit(
                unit.getSecurityDeposit());

        // =====================================================
        // AGREEMENT-SPECIFIC DETAILS
        // =====================================================

        agreement.setDueDay(
                request.getDueDay());

        agreement.setNoticePeriodDays(
                request.getNoticePeriodDays());

        // Move-in date comes from RentalApplication.
        agreement.setMoveInDate(
                application.getPreferredMoveInDate());

        agreement.setTermsAndConditions(
                cleanString(
                        request.getTermsAndConditions()));

        /*
         * PDF is generated automatically by the backend.
         */
        agreement.setAgreementDocument(null);

        /*
         * New agreement starts as DRAFT.
         */
        agreement.setStatus(
                AgreementStatus.DRAFT);

        // =====================================================
        // FIRST SAVE
        // =====================================================

        // Generates agreementId.
        // =====================================================

        RentalAgreement savedAgreement =
                rentalAgreementRepository.save(
                        agreement);

        // =====================================================
        // GENERATE PDF AUTOMATICALLY
        // =====================================================

        String pdfPath =
                rentalAgreementPdfService
                        .generateAgreementPdf(
                                savedAgreement);

        // =====================================================
        // SAVE PDF PATH
        // =====================================================

        savedAgreement.setAgreementDocument(
                pdfPath);

        savedAgreement =
                rentalAgreementRepository.save(
                        savedAgreement);

        return mapToResponse(
                savedAgreement);
    }

    // =========================================================
    // GET ONE AGREEMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public RentalAgreementResponse getAgreement(
            Long agreementId,
            String email) {

        User user =
                getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository
                        .findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        if (!hasAccess(
                agreement,
                user)) {

            throw new IllegalStateException(
                    "You are not authorized to access this rental agreement");
        }

        return mapToResponse(
                agreement);
    }

    // =========================================================
    // TENANT -> MY AGREEMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalAgreementResponse> getMyAgreements(
            String email) {

        User user =
                getUserByEmail(email);

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
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RentalAgreementResponse> getAllAgreements(
            String email) {

        User user =
                getUserByEmail(email);

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

        if (user.getRole() == RoleType.SUPER_ADMIN) {

            return rentalAgreementRepository
                    .findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return rentalAgreementRepository
                .findAll()
                .stream()
                .filter(agreement ->
                        hasAccess(
                                agreement,
                                user))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Override
    public RentalAgreementResponse updateStatus(
            Long agreementId,
            AgreementStatus status,
            String email) {

        User user =
                getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository
                        .findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        validateManagementAccess(
                agreement,
                user);

        if (status == null) {

            throw new IllegalArgumentException(
                    "Agreement status is required");
        }

        AgreementStatus currentStatus =
                agreement.getStatus();

        if (currentStatus == status) {

            return mapToResponse(
                    agreement);
        }

        // DRAFT -> ACTIVE
        if (status == AgreementStatus.ACTIVE) {

            validateActivation(
                    agreement);

            agreement.setStatus(
                    AgreementStatus.ACTIVE);

            occupyUnit(
                    agreement.getUnit());
        }

        // ACTIVE -> EXPIRED
        else if (status == AgreementStatus.EXPIRED) {

            if (currentStatus != AgreementStatus.ACTIVE) {

                throw new IllegalStateException(
                        "Only ACTIVE agreements can be marked as expired");
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

            agreement.setStatus(
                    AgreementStatus.EXPIRED);

            releaseUnit(
                    agreement.getUnit());
        }

        // ACTIVE -> TERMINATED
        else if (status == AgreementStatus.TERMINATED) {

            if (currentStatus != AgreementStatus.ACTIVE) {

                throw new IllegalStateException(
                        "Only ACTIVE agreements can be terminated");
            }

            agreement.setStatus(
                    AgreementStatus.TERMINATED);

            if (agreement.getMoveOutDate() == null) {

                agreement.setMoveOutDate(
                        LocalDate.now());
            }

            releaseUnit(
                    agreement.getUnit());
        }

        // DRAFT
        else if (status == AgreementStatus.DRAFT) {

            if (currentStatus == AgreementStatus.ACTIVE) {

                throw new IllegalStateException(
                        "An active agreement cannot be changed back to draft");
            }

            agreement.setStatus(
                    AgreementStatus.DRAFT);
        }

        RentalAgreement updatedAgreement =
                rentalAgreementRepository.save(
                        agreement);

        return mapToResponse(
                updatedAgreement);
    }

    // =========================================================
    // UPDATE MOVE-OUT DATE
    // =========================================================

    @Override
    public RentalAgreementResponse updateMoveOutDate(
            Long agreementId,
            LocalDate moveOutDate,
            String email) {

        User user =
                getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository
                        .findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        validateManagementAccess(
                agreement,
                user);

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

        agreement.setMoveOutDate(
                moveOutDate);

        if (agreement.getStatus()
                == AgreementStatus.ACTIVE) {

            agreement.setStatus(
                    AgreementStatus.TERMINATED);

            releaseUnit(
                    agreement.getUnit());
        }

        RentalAgreement updatedAgreement =
                rentalAgreementRepository.save(
                        agreement);

        return mapToResponse(
                updatedAgreement);
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
                .isBefore(
                        agreement.getStartDate())) {

            throw new IllegalStateException(
                    "Agreement end date cannot be before start date");
        }

        if (agreement.getMoveInDate() != null
                && agreement.getMoveInDate()
                        .isBefore(
                                agreement.getStartDate())) {

            throw new IllegalStateException(
                    "Move-in date cannot be before agreement start date");
        }

        if (agreement.getUnit() == null) {

            throw new IllegalStateException(
                    "Agreement unit is missing");
        }

        Unit unit =
                agreement.getUnit();

        if (unit.getStatus()
                != UnitStatus.VACANT) {

            throw new IllegalStateException(
                    "Agreement cannot be activated because the unit is not vacant");
        }

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

    private void occupyUnit(
            Unit unit) {

        if (unit == null) {
            return;
        }

        unit.setStatus(
                UnitStatus.OCCUPIED);
    }

    // =========================================================
    // RELEASE UNIT
    // =========================================================

    private void releaseUnit(
            Unit unit) {

        if (unit == null) {
            return;
        }

        unit.setStatus(
                UnitStatus.VACANT);
    }

    // =========================================================
    // VALIDATE CREATE DATES
    // =========================================================

    private void validateDates(
            RentalApplication application) {

        LocalDate moveInDate =
                application.getPreferredMoveInDate();

        if (moveInDate == null) {

            throw new IllegalArgumentException(
                    "Preferred move-in date is required in the rental application");
        }

        Integer leaseDurationMonths =
                application.getPreferredLeaseDurationMonths();

        if (leaseDurationMonths == null
                || leaseDurationMonths < 1) {

            throw new IllegalArgumentException(
                    "Preferred lease duration must be at least 1 month in the rental application");
        }

        LocalDate calculatedEndDate =
                moveInDate
                        .plusMonths(leaseDurationMonths)
                        .minusDays(1);

        if (calculatedEndDate.isBefore(moveInDate)) {

            throw new IllegalArgumentException(
                    "Calculated agreement end date cannot be before start date");
        }
    }

    // =========================================================
    // USER LOOKUP
    // =========================================================

    private User getUserByEmail(
            String email) {

        if (email == null
                || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user email is required");
        }

        return userRepository
                .findByEmail(email)
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

        if (agreement == null
                || user == null) {

            return false;
        }

        if (user.getRole()
                == RoleType.SUPER_ADMIN) {

            return true;
        }

        if (user.getRole()
                == RoleType.TENANT) {

            return agreement.getTenant() != null
                    && agreement.getTenant().getUser() != null
                    && agreement.getTenant().getUser().getId() != null
                    && agreement.getTenant()
                            .getUser()
                            .getId()
                            .equals(user.getId());
        }

        if (agreement.getUnit() == null
                || agreement.getUnit().getFloor() == null
                || agreement.getUnit()
                        .getFloor()
                        .getBuilding() == null
                || agreement.getUnit()
                        .getFloor()
                        .getBuilding()
                        .getProperty() == null) {

            return false;
        }

        var property =
                agreement.getUnit()
                        .getFloor()
                        .getBuilding()
                        .getProperty();

        if (user.getRole()
                == RoleType.PROPERTY_OWNER) {

            return property.getOwner() != null
                    && property.getOwner().getId() != null
                    && property.getOwner()
                            .getId()
                            .equals(user.getId());
        }

        if (user.getRole()
                == RoleType.PROPERTY_MANAGER) {

            return property.getPropertyManager() != null
                    && property.getPropertyManager().getUser() != null
                    && property.getPropertyManager()
                            .getUser()
                            .getId() != null
                    && property.getPropertyManager()
                            .getUser()
                            .getId()
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
                || application.getUnit()
                        .getFloor()
                        .getBuilding() == null
                || application.getUnit()
                        .getFloor()
                        .getBuilding()
                        .getProperty() == null) {

            return false;
        }

        var property =
                application.getUnit()
                        .getFloor()
                        .getBuilding()
                        .getProperty();

        if (user.getRole()
                == RoleType.PROPERTY_OWNER) {

            return property.getOwner() != null
                    && property.getOwner().getId() != null
                    && property.getOwner()
                            .getId()
                            .equals(user.getId());
        }

        if (user.getRole()
                == RoleType.PROPERTY_MANAGER) {

            return property.getPropertyManager() != null
                    && property.getPropertyManager()
                            .getUser() != null
                    && property.getPropertyManager()
                            .getUser()
                            .getId() != null
                    && property.getPropertyManager()
                            .getUser()
                            .getId()
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

        if (user.getRole()
                == RoleType.TENANT) {

            throw new IllegalStateException(
                    "Tenant is not authorized to modify a rental agreement");
        }

        if (user.getRole() != RoleType.SUPER_ADMIN
                && user.getRole() != RoleType.PROPERTY_OWNER
                && user.getRole() != RoleType.PROPERTY_MANAGER) {

            throw new IllegalStateException(
                    "You are not authorized to modify this rental agreement");
        }

        if (user.getRole()
                == RoleType.SUPER_ADMIN) {

            return;
        }

        if (!hasAccess(
                agreement,
                user)) {

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

            // Lease duration comes from the Rental Application.
            // It is not stored separately in RentalAgreement.
            response.setLeaseDurationMonths(
                    agreement.getRentalApplication()
                            .getPreferredLeaseDurationMonths());
        }

        if (agreement.getTenant() != null) {

            response.setTenantId(
                    agreement.getTenant()
                            .getTenantId());
        }

        if (agreement.getUnit() != null) {

            response.setUnitId(
                    agreement.getUnit()
                            .getUnitId());
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

    private String cleanString(
            String value) {

        if (value == null) {

            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    // =========================================================
    // GET AGREEMENT DOCUMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Resource getAgreementDocument(
            Long agreementId,
            String email) {

        User user =
                getUserByEmail(email);

        RentalAgreement agreement =
                rentalAgreementRepository
                        .findById(agreementId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Rental agreement not found with ID: "
                                                + agreementId));

        if (!hasAccess(
                agreement,
                user)) {

            throw new IllegalStateException(
                    "You are not authorized to access this agreement document");
        }

        String documentPath =
                agreement.getAgreementDocument();

        if (documentPath == null
                || documentPath.isBlank()) {

            throw new EntityNotFoundException(
                    "Agreement document not found for agreement ID: "
                            + agreementId);
        }

        String filename =
                java.nio.file.Paths
                        .get(documentPath)
                        .getFileName()
                        .toString();

        java.nio.file.Path uploadDirectory =
                java.nio.file.Paths
                        .get(AGREEMENT_UPLOAD_DIRECTORY)
                        .toAbsolutePath()
                        .normalize();

        java.nio.file.Path filePath =
                uploadDirectory
                        .resolve(filename)
                        .normalize();

        if (!filePath.startsWith(
                uploadDirectory)) {

            throw new IllegalStateException(
                    "Invalid agreement document path");
        }

        if (!java.nio.file.Files.exists(filePath)
                || !java.nio.file.Files.isRegularFile(filePath)) {

            throw new EntityNotFoundException(
                    "Agreement document file not found");
        }

        return new FileSystemResource(
                filePath);
    }
}

