
package com.rental.rental_management_backend.tenant.serviceimpl;

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

import com.rental.rental_management_backend.property.dto.AmenityResponse;
import com.rental.rental_management_backend.property.entity.Amenity;
import com.rental.rental_management_backend.property.repository.AmenityRepository;

import com.rental.rental_management_backend.tenant.dto.TenantPreferenceDTO;
import com.rental.rental_management_backend.tenant.dto.TenantPreferenceResponseDTO;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.entity.TenantPreference;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;
import com.rental.rental_management_backend.tenant.repository.TenantPreferenceRepository;
import com.rental.rental_management_backend.tenant.service.TenantPreferenceService;

@Service
@Transactional
public class TenantPreferenceServiceImpl
        implements TenantPreferenceService {

    private final TenantPreferenceRepository tenantPreferenceRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AmenityRepository amenityRepository;

    public TenantPreferenceServiceImpl(
            TenantPreferenceRepository tenantPreferenceRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            AmenityRepository amenityRepository) {

        this.tenantPreferenceRepository = tenantPreferenceRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.amenityRepository = amenityRepository;
    }

    @Override
    public TenantPreferenceResponseDTO createPreference(
            TenantPreferenceDTO dto) {

        Tenant tenant = getAuthenticatedTenant();

        if (tenantPreferenceRepository.existsByTenant(tenant)) {
            throw new RuntimeException(
                    "Tenant preference already exists");
        }

        TenantPreference preference = new TenantPreference();

        preference.setTenant(tenant);

        mapDtoToEntity(dto, preference);

        TenantPreference saved =
                tenantPreferenceRepository.save(preference);

        return mapToResponseDTO(saved);
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
                                        "Tenant preference not found"));

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
                                        "Tenant preference not found"));

        mapDtoToEntity(dto, preference);

        TenantPreference updated =
                tenantPreferenceRepository.save(preference);

        return mapToResponseDTO(updated);
    }

    @Override
    public void deleteMyPreference() {

        Tenant tenant = getAuthenticatedTenant();

        TenantPreference preference =
                tenantPreferenceRepository
                        .findByTenant(tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant preference not found"));

        tenantPreferenceRepository.delete(preference);
    }

    private Tenant getAuthenticatedTenant() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        return tenantRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tenant profile not found"));
    }

    private void mapDtoToEntity(
            TenantPreferenceDTO dto,
            TenantPreference entity) {

        entity.setPreferredCity(
                dto.getPreferredCity());

        entity.setMaxBudget(
                dto.getMaxBudget());

        entity.setMinBedrooms(
                dto.getMinBedrooms());

        entity.setPreferredPropertyType(
                dto.getPreferredPropertyType());

        entity.setFurnishingPreference(
                dto.getFurnishingPreference());

        entity.setParkingRequired(
                dto.getParkingRequired());

        entity.setPreferredLatitude(
                dto.getPreferredLatitude());

        entity.setPreferredLongitude(
                dto.getPreferredLongitude());

        entity.setMaxDistanceKm(
                dto.getMaxDistanceKm());

        Set<Amenity> amenities = new HashSet<>();

        if (dto.getPreferredAmenityIds() != null
                && !dto.getPreferredAmenityIds().isEmpty()) {

            List<Amenity> foundAmenities =
                    amenityRepository.findAllById(
                            dto.getPreferredAmenityIds());

            if (foundAmenities.size()
                    != dto.getPreferredAmenityIds().size()) {

                throw new RuntimeException(
                        "One or more preferred amenity IDs are invalid");
            }

            amenities.addAll(foundAmenities);
        }

        entity.setPreferredAmenities(amenities);
    }

    private TenantPreferenceResponseDTO mapToResponseDTO(
            TenantPreference entity) {

        TenantPreferenceResponseDTO response =
                new TenantPreferenceResponseDTO();

        response.setPreferenceId(
                entity.getPreferenceId());

        response.setPreferredCity(
                entity.getPreferredCity());

        response.setMaxBudget(
                entity.getMaxBudget());

        response.setMinBedrooms(
                entity.getMinBedrooms());

        response.setPreferredPropertyType(
                entity.getPreferredPropertyType());

        response.setFurnishingPreference(
                entity.getFurnishingPreference());

        response.setParkingRequired(
                entity.getParkingRequired());

        response.setPreferredLatitude(
                entity.getPreferredLatitude());

        response.setPreferredLongitude(
                entity.getPreferredLongitude());

        response.setMaxDistanceKm(
                entity.getMaxDistanceKm());

        response.setCreatedAt(
                entity.getCreatedAt());

        response.setUpdatedAt(
                entity.getUpdatedAt());

        List<AmenityResponse> amenityResponses =
                new ArrayList<>();

        if (entity.getPreferredAmenities() != null) {

            for (Amenity amenity :
                    entity.getPreferredAmenities()) {

                AmenityResponse amenityResponse =
                        new AmenityResponse();

                amenityResponse.setAmenityId(
                        amenity.getAmenityId());

                amenityResponse.setAmenityName(
                        amenity.getAmenityName());

                amenityResponses.add(
                        amenityResponse);
            }
        }

        response.setPreferredAmenities(
                amenityResponses);

        return response;
    }
}
