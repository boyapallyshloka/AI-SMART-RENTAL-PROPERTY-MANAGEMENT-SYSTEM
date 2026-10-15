package com.rental.rental_management_backend.tenant.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.tenant.dto.TenantDocumentResponse;
import com.rental.rental_management_backend.tenant.enums.DocumentVerificationStatus;
import com.rental.rental_management_backend.tenant.enums.TenantDocumentType;

public interface TenantDocumentService {

    TenantDocumentResponse uploadDocument(
            String email,
            MultipartFile file,
            TenantDocumentType documentType);

    List<TenantDocumentResponse> getMyDocuments(
            String email);

    TenantDocumentResponse getMyDocument(
            String email,
            Long documentId);

    void deleteMyDocument(
            String email,
            Long documentId);

    List<TenantDocumentResponse> getTenantDocuments(
            Long tenantId);

    TenantDocumentResponse updateVerificationStatus(
            Long tenantId,
            Long documentId,
            DocumentVerificationStatus status);
}