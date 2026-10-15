package com.rental.rental_management_backend.tenant.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.entity.TenantDocument;

public interface TenantDocumentRepository
        extends JpaRepository<TenantDocument, Long> {

    List<TenantDocument> findByTenant(Tenant tenant);

    Optional<TenantDocument> findByDocumentIdAndTenant(
            Long documentId,
            Tenant tenant);

    boolean existsByDocumentIdAndTenant(
            Long documentId,
            Tenant tenant);
}