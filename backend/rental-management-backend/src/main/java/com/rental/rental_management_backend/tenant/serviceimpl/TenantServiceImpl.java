package com.rental.rental_management_backend.tenant.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.User.enums.UserStatus;
import com.rental.rental_management_backend.User.exception.ResourceNotFoundException;
import com.rental.rental_management_backend.tenant.dto.TenantProfileUpdateRequest;
import com.rental.rental_management_backend.tenant.dto.TenantResponse;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;
import com.rental.rental_management_backend.tenant.service.TenantService;

@Service
@Transactional
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    public TenantServiceImpl(
            TenantRepository tenantRepository,
            UserRepository userRepository) {

        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET ALL TENANTS
    // SUPER ADMIN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {

        return tenantRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET TENANT BY ID
    // SUPER ADMIN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long tenantId) {

        if (tenantId == null) {
            throw new IllegalArgumentException(
                    "Tenant ID is required"
            );
        }

        Tenant tenant =
                tenantRepository.findById(tenantId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tenant not found with ID: "
                                                + tenantId
                                )
                        );

        return mapToResponse(tenant);
    }

    // =========================================================
    // GET TENANT BY USER ID
    // SUPER ADMIN
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantByUserId(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        Tenant tenant =
                tenantRepository.findByUser_Id(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tenant not found for user ID: "
                                                + userId
                                )
                        );

        return mapToResponse(tenant);
    }

    // =========================================================
    // GET MY TENANT PROFILE
    // TENANT
    // =========================================================

    @Override
    public TenantResponse getMyTenantProfile(String email) {

        User user = getAuthenticatedTenant(email);

        Tenant tenant =
                tenantRepository.findByUser(user)
                        .orElseGet(() ->
                                createEmptyTenantProfile(user)
                        );

        return mapToResponse(tenant);
    }

    // =========================================================
    // UPDATE MY TENANT PROFILE
    // TENANT
    // =========================================================

    @Override
    public TenantResponse updateMyTenantProfile(
            String email,
            TenantProfileUpdateRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Tenant profile request cannot be null"
            );
        }

        User user = getAuthenticatedTenant(email);

        Tenant tenant =
                tenantRepository.findByUser(user)
                        .orElseGet(() ->
                                createEmptyTenantProfile(user)
                        );

        // =====================================================
        // PERSONAL DETAILS
        // =====================================================

        if (request.getDateOfBirth() != null) {
            tenant.setDateOfBirth(
                    request.getDateOfBirth()
            );
        }

        if (request.getAlternatePhone() != null) {
            tenant.setAlternatePhone(
                    cleanValue(
                            request.getAlternatePhone()
                    )
            );
        }

        // =====================================================
        // PROFESSIONAL DETAILS
        // =====================================================

        if (request.getOccupation() != null) {
            tenant.setOccupation(
                    cleanValue(
                            request.getOccupation()
                    )
            );
        }

        if (request.getCompanyName() != null) {
            tenant.setCompanyName(
                    cleanValue(
                            request.getCompanyName()
                    )
            );
        }

        if (request.getMonthlyIncome() != null) {
            tenant.setMonthlyIncome(
                    request.getMonthlyIncome()
            );
        }

        // =====================================================
        // EMERGENCY CONTACT
        // =====================================================

        if (request.getEmergencyContactName() != null) {
            tenant.setEmergencyContactName(
                    cleanValue(
                            request.getEmergencyContactName()
                    )
            );
        }

        if (request.getEmergencyContactPhone() != null) {
            tenant.setEmergencyContactPhone(
                    cleanValue(
                            request.getEmergencyContactPhone()
                    )
            );
        }

        // =====================================================
        // CURRENT ADDRESS
        // =====================================================

        if (request.getCurrentAddress() != null) {
            tenant.setCurrentAddress(
                    cleanValue(
                            request.getCurrentAddress()
                    )
            );
        }

        if (request.getCity() != null) {
            tenant.setCity(
                    cleanValue(
                            request.getCity()
                    )
            );
        }

        if (request.getState() != null) {
            tenant.setState(
                    cleanValue(
                            request.getState()
                    )
            );
        }

        if (request.getPincode() != null) {
            tenant.setPincode(
                    cleanValue(
                            request.getPincode()
                    )
            );
        }

        Tenant updatedTenant =
                tenantRepository.save(tenant);

        return mapToResponse(updatedTenant);
    }

    // =========================================================
    // UPDATE TENANT STATUS
    // SUPER ADMIN
    // =========================================================

    @Override
    public TenantResponse updateTenantStatus(
            Long tenantId,
            UserStatus status) {

        if (tenantId == null) {
            throw new IllegalArgumentException(
                    "Tenant ID is required"
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Status is required"
            );
        }

        Tenant tenant =
                tenantRepository.findById(tenantId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tenant not found with ID: "
                                                + tenantId
                                )
                        );

        User user = tenant.getUser();

        user.setStatus(status);

        userRepository.save(user);

        return mapToResponse(tenant);
    }

    // =========================================================
    // DELETE TENANT
    // SUPER ADMIN
    // =========================================================

    @Override
    public void deleteTenant(Long tenantId) {

        if (tenantId == null) {
            throw new IllegalArgumentException(
                    "Tenant ID is required"
            );
        }

        Tenant tenant =
                tenantRepository.findById(tenantId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tenant not found with ID: "
                                                + tenantId
                                )
                        );

        tenantRepository.delete(tenant);
    }

    // =========================================================
    // GET AUTHENTICATED TENANT
    // =========================================================

    private User getAuthenticatedTenant(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required"
            );
        }

        User user =
                userRepository.findByEmail(
                        email.toLowerCase().trim()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"
                        )
                );

        if (user.getRole() != RoleType.TENANT) {
            throw new IllegalArgumentException(
                    "Only TENANT users can access this profile"
            );
        }

        return user;
    }

    // =========================================================
    // CREATE EMPTY TENANT PROFILE
    // =========================================================

    private Tenant createEmptyTenantProfile(User user) {

        if (tenantRepository.existsByUser_Id(user.getId())) {

            return tenantRepository
                    .findByUser_Id(user.getId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Tenant profile could not be loaded"
                            )
                    );
        }

        Tenant tenant = new Tenant();

        tenant.setUser(user);

        return tenantRepository.save(tenant);
    }

    // =========================================================
    // CLEAN STRING
    // =========================================================

    private String cleanValue(String value) {

        if (value == null) {
            return null;
        }

        String cleaned = value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private TenantResponse mapToResponse(
            Tenant tenant) {

        User user = tenant.getUser();

        TenantResponse response =
                new TenantResponse();

        // =====================================================
        // TENANT ID
        // =====================================================

        response.setTenantId(
                tenant.getTenantId()
        );

        // =====================================================
        // USER ID
        // =====================================================

        response.setUserId(
                user.getId()
        );

        // =====================================================
        // USER INFORMATION
        // =====================================================

        response.setFirstName(
                user.getFirstName()
        );

        response.setLastName(
                user.getLastName()
        );

        response.setEmail(
                user.getEmail()
        );

        response.setPhone(
                user.getPhone()
        );

        if (user.getGender() != null) {
            response.setGender(
                    user.getGender().name()
            );
        }

        if (user.getRole() != null) {
            response.setRole(
                    user.getRole().name()
            );
        }

        if (user.getStatus() != null) {
            response.setStatus(
                    user.getStatus().name()
            );
        }

        // =====================================================
        // TENANT PERSONAL DETAILS
        // =====================================================

        response.setDateOfBirth(
                tenant.getDateOfBirth()
        );

        response.setAlternatePhone(
                tenant.getAlternatePhone()
        );

        // =====================================================
        // PROFESSIONAL DETAILS
        // =====================================================

        response.setOccupation(
                tenant.getOccupation()
        );

        response.setCompanyName(
                tenant.getCompanyName()
        );

        response.setMonthlyIncome(
                tenant.getMonthlyIncome()
        );

        // =====================================================
        // EMERGENCY CONTACT
        // =====================================================

        response.setEmergencyContactName(
                tenant.getEmergencyContactName()
        );

        response.setEmergencyContactPhone(
                tenant.getEmergencyContactPhone()
        );

        // =====================================================
        // CURRENT ADDRESS
        // =====================================================

        response.setCurrentAddress(
                tenant.getCurrentAddress()
        );

        response.setCity(
                tenant.getCity()
        );

        response.setState(
                tenant.getState()
        );

        response.setPincode(
                tenant.getPincode()
        );

        // =====================================================
        // AUDIT
        // =====================================================

        response.setCreatedAt(
                tenant.getCreatedAt()
        );

        response.setUpdatedAt(
                tenant.getUpdatedAt()
        );

        return response;
    }
}