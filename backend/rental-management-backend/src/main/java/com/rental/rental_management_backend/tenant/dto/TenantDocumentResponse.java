package com.rental.rental_management_backend.tenant.dto;

import java.time.LocalDateTime;

import com.rental.rental_management_backend.tenant.enums.DocumentVerificationStatus;
import com.rental.rental_management_backend.tenant.enums.TenantDocumentType;

public class TenantDocumentResponse {

    private Long documentId;

    private Long tenantId;

    private Long userId;

    private TenantDocumentType documentType;

    private String fileName;

    private String documentUrl;

    private DocumentVerificationStatus verificationStatus;

    private LocalDateTime uploadedAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public TenantDocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(
            TenantDocumentType documentType) {

        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public DocumentVerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(
            DocumentVerificationStatus verificationStatus) {

        this.verificationStatus = verificationStatus;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}