package com.rental.rental_management_backend.tenant.service;

import java.util.List;

import com.rental.rental_management_backend.User.enums.UserStatus;
import com.rental.rental_management_backend.tenant.dto.TenantProfileUpdateRequest;
import com.rental.rental_management_backend.tenant.dto.TenantResponse;

public interface TenantService {

    // =========================================================
    // SUPER ADMIN
    // =========================================================

    List<TenantResponse> getAllTenants();

    TenantResponse getTenantById(Long tenantId);

    TenantResponse getTenantByUserId(Long userId);

    // =========================================================
    // TENANT
    // =========================================================

    TenantResponse getMyTenantProfile(String email);

    TenantResponse updateMyTenantProfile(
            String email,
            TenantProfileUpdateRequest request
    );

    // =========================================================
    // SUPER ADMIN
    // =========================================================

    TenantResponse updateTenantStatus(
            Long tenantId,
            UserStatus status
    );

    void deleteTenant(Long tenantId);
}