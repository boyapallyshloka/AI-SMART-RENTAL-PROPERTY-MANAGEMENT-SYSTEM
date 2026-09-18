package com.rental.rental_management_backend.tenant.serviceimpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.property.entity.Amenity;
import com.rental.rental_management_backend.property.repository.AmenityRepository;
import com.rental.rental_management_backend.rental.entity.TenantPreference;
import com.rental.rental_management_backend.tenant.dto.AmenityResponseDTO;
import com.rental.rental_management_backend.tenant.dto.TenantPreferenceDTO;
import com.rental.rental_management_backend.tenant.dto.TenantPreferenceResponseDTO;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantPreferenceRepository;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;
import com.rental.rental_management_backend.tenant.service.TenantPreferenceService;

@Service
@Transactional
public class TenantPreferenceServiceImpl
        implements TenantPreferenceService {

    private final TenantPreferenceRepository tenantPreferenceRepository;
    private final TenantRepository tenantRepository;
    private final AmenityRepository amenityRepository;
    private final UserRepository userRepository;

    public TenantPreferenceServiceImpl(
            TenantPreferenceRepository tenantPreferenceRepository,
            TenantRepository tenantRepository,
            AmenityRepository amenityRepository,
            UserRepository userRepository) {

        this.tenantPreferenceRepository =
                tenantPreferenceRepository;

        this.tenantRepository =
                tenantRepository;

        this.amenityRepository =
                amenityRepository;

        this.userRepository =
                userRepository;
    }

    @Override
    public TenantPreferenceResponseDTO createPreference(
            TenantPreferenceDTO dto) {

        Tenant tenant = getAuthenticatedTenant();

        if (tenantPreferenceRepository.existsByTenant(tenant)) {

            throw new RuntimeException(
                    "Tenant preferences already exist. Use update instead.");
        }

        TenantPreference preference =
                new TenantPreference();

        preference.setTenant(tenant);

        mapDtoToEntity(dto, preference);

        LocalDateTime now = LocalDateTime.now();

        preference.setCreatedAt(now);
        preference.setUpdatedAt(now);

        TenantPreference savedPreference =
                tenantPreferenceRepository.save(preference);

        return mapToResponseDTO(savedPreference);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantPreferenceResponseDTO getMyPreference() {

        Tenant tenant = getAuthenticatedTenant();

        TenantPreference preference =
                tenantPreferenceRepository
                        .findByTenant(tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant preferences not found."));

        return mapToResponseDTO(preference);
    }

    @Override
    public TenantPreferenceResponseDTO updatePreference(
            TenantPreferenceDTO dto) {

        Tenant tenant = getAuthenticatedTenant();

        TenantPreference preference =
                tenantPreferenceRepository
                        .findByTenant(tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant preferences not found. Create preferences first."));

        mapDtoToEntity(dto, preference);

        preference.setUpdatedAt(LocalDateTime.now());

        TenantPreference updatedPreference =
                tenantPreferenceRepository.save(preference);

        return mapToResponseDTO(updatedPreference);
    }

    @Override
    public void deleteMyPreference() {

        Tenant tenant = getAuthenticatedTenant();

        TenantPreference preference =
                tenantPreferenceRepository
                        .findByTenant(tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant preferences not found."));

        tenantPreferenceRepository.delete(preference);
    }

    private Tenant getAuthenticatedTenant() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated.");
        }

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Authenticated user not found."));

        Tenant tenant =
                tenantRepository.findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant profile not found for the authenticated user."));

        return tenant;
    }

    private void mapDtoToEntity(
            TenantPreferenceDTO dto,
            TenantPreference preference) {

        preference.setPreferredCity(
                dto.getPreferredCity());

        preference.setMaxBudget(
                dto.getMaxBudget());

        preference.setMinBedrooms(
                dto.getMinBedrooms());

        preference.setFurnishingPreference(
                dto.getFurnishingPreference());

        preference.setParkingRequired(
                dto.getParkingRequired());

        preference.setPreferredLatitude(
                dto.getPreferredLatitude());

        preference.setPreferredLongitude(
                dto.getPreferredLongitude());

        preference.setMaxDistanceKm(
                dto.getMaxDistanceKm());

        Set<Amenity> amenities =
                new HashSet<>();

        List<Long> amenityIds =
                dto.getPreferredAmenityIds();

        if (amenityIds != null &&
                !amenityIds.isEmpty()) {

            for (Long amenityId : amenityIds) {

                Amenity amenity =
                        amenityRepository
                                .findById(amenityId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Amenity not found with ID: "
                                                        + amenityId));

                amenities.add(amenity);
            }
        }

        preference.setPreferredAmenities(amenities);
    }

    private TenantPreferenceResponseDTO mapToResponseDTO(
            TenantPreference preference) {

        TenantPreferenceResponseDTO response =
                new TenantPreferenceResponseDTO();

        response.setPreferenceId(
                preference.getPreferenceId());

        response.setPreferredCity(
                preference.getPreferredCity());

        response.setMaxBudget(
                preference.getMaxBudget());

        response.setMinBedrooms(
                preference.getMinBedrooms());

        response.setFurnishingPreference(
                preference.getFurnishingPreference());

        response.setParkingRequired(
                preference.getParkingRequired());

        response.setPreferredLatitude(
                preference.getPreferredLatitude());

        response.setPreferredLongitude(
                preference.getPreferredLongitude());

        response.setMaxDistanceKm(
                preference.getMaxDistanceKm());

        response.setCreatedAt(
                preference.getCreatedAt());

        response.setUpdatedAt(
                preference.getUpdatedAt());

        List<AmenityResponseDTO> amenityResponses =
                new ArrayList<>();

        if (preference.getPreferredAmenities() != null) {

            for (Amenity amenity :
                    preference.getPreferredAmenities()) {

                AmenityResponseDTO amenityResponse =
                        new AmenityResponseDTO();

                amenityResponse.setAmenityId(
                        amenity.getAmenityId());

                amenityResponse.setAmenityName(
                        amenity.getAmenityName());

                amenityResponse.setDescription(
                        amenity.getDescription());

                amenityResponses.add(amenityResponse);
            }
        }

        response.setPreferredAmenities(
                amenityResponses);

        return response;
    }
}