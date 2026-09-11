package com.rental.rental_management_backend.tenant.entity;

import java.time.LocalDateTime;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import com.rental.rental_management_backend.tenant.enums.DocumentVerificationStatus;
import com.rental.rental_management_backend.tenant.enums.TenantDocumentType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenant_documents")
public class TenantDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private TenantDocumentType documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "document_url", nullable = false, length = 500)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private DocumentVerificationStatus verificationStatus;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public TenantDocument() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public TenantDocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(TenantDocumentType documentType) {
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
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}