
package com.rental.rental_management_backend.tenant.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.entity.TenantPreference;

public interface TenantPreferenceRepository
        extends JpaRepository<TenantPreference, Long> {

    Optional<TenantPreference> findByTenant(Tenant tenant);

    Optional<TenantPreference> findByTenant_TenantId(Long tenantId);

    boolean existsByTenant(Tenant tenant);

    boolean existsByTenant_TenantId(Long tenantId);
}

