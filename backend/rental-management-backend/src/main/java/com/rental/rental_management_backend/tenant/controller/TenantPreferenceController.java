package com.rental.rental_management_backend.tenant.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.tenant.dto.TenantPreferenceDTO;
import com.rental.rental_management_backend.tenant.dto.TenantPreferenceResponseDTO;
import com.rental.rental_management_backend.tenant.service.TenantPreferenceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tenant/preferences")
@PreAuthorize("hasRole('TENANT')")
public class TenantPreferenceController {

    private final TenantPreferenceService tenantPreferenceService;

    public TenantPreferenceController(
            TenantPreferenceService tenantPreferenceService) {

        this.tenantPreferenceService =
                tenantPreferenceService;
    }

    @PostMapping
    public ResponseEntity<TenantPreferenceResponseDTO> createPreference(
            @Valid @RequestBody TenantPreferenceDTO dto) {

        TenantPreferenceResponseDTO response =
                tenantPreferenceService.createPreference(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<TenantPreferenceResponseDTO> getMyPreference() {

        TenantPreferenceResponseDTO response =
                tenantPreferenceService.getMyPreference();

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<TenantPreferenceResponseDTO> updatePreference(
            @Valid @RequestBody TenantPreferenceDTO dto) {

        TenantPreferenceResponseDTO response =
                tenantPreferenceService.updatePreference(dto);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMyPreference() {

        tenantPreferenceService.deleteMyPreference();

        return ResponseEntity.noContent().build();
    }
}