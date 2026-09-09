package com.rental.rental_management_backend.tenant.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.User.enums.UserStatus;
import com.rental.rental_management_backend.tenant.dto.TenantProfileUpdateRequest;
import com.rental.rental_management_backend.tenant.dto.TenantResponse;
import com.rental.rental_management_backend.tenant.service.TenantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tenants")
@Validated
public class TenantController {

    private final TenantService tenantService;

    public TenantController(
            TenantService tenantService) {

        this.tenantService = tenantService;
    }

    // =========================================================
    // GET ALL TENANTS
    // SUPER ADMIN
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<TenantResponse>> getAllTenants() {

        return ResponseEntity.ok(
                tenantService.getAllTenants()
        );
    }

    // =========================================================
    // GET MY TENANT PROFILE
    // TENANT
    // =========================================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantResponse> getMyTenantProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                tenantService.getMyTenantProfile(email)
        );
    }

    // =========================================================
    // UPDATE MY TENANT PROFILE
    // TENANT
    // =========================================================

    @PutMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantResponse> updateMyTenantProfile(
            Authentication authentication,
            @Valid @RequestBody TenantProfileUpdateRequest request) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                tenantService.updateMyTenantProfile(
                        email,
                        request
                )
        );
    }

    // =========================================================
    // GET TENANT BY ID
    // SUPER ADMIN
    // =========================================================

    @GetMapping("/{tenantId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TenantResponse> getTenantById(
            @PathVariable Long tenantId) {

        return ResponseEntity.ok(
                tenantService.getTenantById(tenantId)
        );
    }

    // =========================================================
    // GET TENANT BY USER ID
    // SUPER ADMIN
    // =========================================================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TenantResponse> getTenantByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                tenantService.getTenantByUserId(userId)
        );
    }

    // =========================================================
    // UPDATE TENANT STATUS
    // SUPER ADMIN
    // =========================================================

    @PatchMapping("/{tenantId}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TenantResponse> updateTenantStatus(
            @PathVariable Long tenantId,
            @RequestParam UserStatus status) {

        return ResponseEntity.ok(
                tenantService.updateTenantStatus(
                        tenantId,
                        status
                )
        );
    }

    // =========================================================
    // DELETE TENANT
    // SUPER ADMIN
    // =========================================================

    @DeleteMapping("/{tenantId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTenant(
            @PathVariable Long tenantId) {

        tenantService.deleteTenant(tenantId);

        return ResponseEntity.noContent().build();
    }
}