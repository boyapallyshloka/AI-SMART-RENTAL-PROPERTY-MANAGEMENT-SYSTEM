package com.rental.rental_management_backend.tenant.service;

import com.rental.rental_management_backend.tenant.dto.TenantPreferenceDTO;
import com.rental.rental_management_backend.tenant.dto.TenantPreferenceResponseDTO;

public interface TenantPreferenceService {

    TenantPreferenceResponseDTO createPreference(
            TenantPreferenceDTO dto);

    TenantPreferenceResponseDTO getMyPreference();

    TenantPreferenceResponseDTO updatePreference(
            TenantPreferenceDTO dto);

    void deleteMyPreference();
}