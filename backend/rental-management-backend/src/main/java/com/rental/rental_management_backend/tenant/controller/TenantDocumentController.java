package com.rental.rental_management_backend.tenant.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.tenant.dto.TenantDocumentResponse;
import com.rental.rental_management_backend.tenant.enums.DocumentVerificationStatus;
import com.rental.rental_management_backend.tenant.enums.TenantDocumentType;
import com.rental.rental_management_backend.tenant.service.TenantDocumentService;

@RestController
@RequestMapping("/api/tenants")
public class TenantDocumentController {

    private final TenantDocumentService tenantDocumentService;

    public TenantDocumentController(
            TenantDocumentService tenantDocumentService) {

        this.tenantDocumentService =
                tenantDocumentService;
    }

    // =========================================================
    // TENANT - UPLOAD DOCUMENT
    // =========================================================

    @PostMapping(
            value = "/me/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantDocumentResponse> uploadDocument(

            Authentication authentication,

            @RequestPart("file")
            MultipartFile file,

            @RequestParam("documentType")
            TenantDocumentType documentType) {

        String email =
                authentication.getName();

        TenantDocumentResponse response =
                tenantDocumentService.uploadDocument(
                        email,
                        file,
                        documentType);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // TENANT - GET MY DOCUMENTS
    // =========================================================

    @GetMapping("/me/documents")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<TenantDocumentResponse>>
            getMyDocuments(
                    Authentication authentication) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                tenantDocumentService
                        .getMyDocuments(email));
    }

    // =========================================================
    // TENANT - GET MY DOCUMENT
    // =========================================================

    @GetMapping("/me/documents/{documentId}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantDocumentResponse>
            getMyDocument(

                    Authentication authentication,

                    @PathVariable Long documentId) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                tenantDocumentService
                        .getMyDocument(
                                email,
                                documentId));
    }

    // =========================================================
    // TENANT - DELETE MY DOCUMENT
    // =========================================================

    @DeleteMapping("/me/documents/{documentId}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<String> deleteMyDocument(

            Authentication authentication,

            @PathVariable Long documentId) {

        String email =
                authentication.getName();

        tenantDocumentService.deleteMyDocument(
                email,
                documentId);

        return ResponseEntity.ok(
                "Tenant document deleted successfully");
    }

    // =========================================================
    // SUPER ADMIN - GET TENANT DOCUMENTS
    // =========================================================

    @GetMapping("/{tenantId}/documents")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<TenantDocumentResponse>>
            getTenantDocuments(
                    @PathVariable Long tenantId) {

        return ResponseEntity.ok(
                tenantDocumentService
                        .getTenantDocuments(tenantId));
    }

    // =========================================================
    // SUPER ADMIN - VERIFY / REJECT
    // =========================================================

    @PatchMapping(
            "/{tenantId}/documents/{documentId}/verification")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TenantDocumentResponse>
            updateVerificationStatus(

                    @PathVariable Long tenantId,

                    @PathVariable Long documentId,

                    @RequestParam
                    DocumentVerificationStatus status) {

        return ResponseEntity.ok(
                tenantDocumentService
                        .updateVerificationStatus(
                                tenantId,
                                documentId,
                                status));
    }
}