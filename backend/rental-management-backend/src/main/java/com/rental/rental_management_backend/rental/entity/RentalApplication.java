package com.rental.rental_management_backend.rental.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.rental.enums.RentalApplicationStatus;
import com.rental.rental_management_backend.tenant.entity.Tenant;

import jakarta.persistence.*;

@Entity
@Table(
    name = "rental_applications",
    indexes = {
        @Index(name = "idx_application_tenant", columnList = "tenant_id"),
        @Index(name = "idx_application_unit", columnList = "unit_id"),
        @Index(name = "idx_application_status", columnList = "status")
    }
)
public class RentalApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    // Tenant who submits the rental application
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Unit for which the tenant is applying
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    // Date on which the application was submitted
    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    // Tenant's preferred move-in date
    @Column(name = "preferred_move_in_date")
    private LocalDate preferredMoveInDate;

    // Optional message from tenant
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    // Application status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RentalApplicationStatus status;

    // Used only when the application is rejected
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // Date/time when owner or manager reviewed the application
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public RentalApplication() {
    }

    @PrePersist
    protected void onCreate() {

        if (applicationDate == null) {
            applicationDate = LocalDate.now();
        }

        if (status == null) {
            status = RentalApplicationStatus.PENDING;
        }

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public LocalDate getPreferredMoveInDate() {
        return preferredMoveInDate;
    }

    public void setPreferredMoveInDate(LocalDate preferredMoveInDate) {
        this.preferredMoveInDate = preferredMoveInDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public RentalApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(RentalApplicationStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
