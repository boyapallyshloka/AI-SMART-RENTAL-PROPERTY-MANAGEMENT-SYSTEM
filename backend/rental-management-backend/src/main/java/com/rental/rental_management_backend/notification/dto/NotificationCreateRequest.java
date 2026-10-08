package com.rental.rental_management_backend.notification.dto;

import com.rental.rental_management_backend.notification.enums.NotificationPriority;
import com.rental.rental_management_backend.notification.enums.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NotificationCreateRequest {

    // ============================================================
    // FIELDS
    // ============================================================

    @NotNull
    private Long userId;

    @NotNull
    private NotificationType type;

    @NotNull
    private NotificationPriority priority;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private Long referenceId;

    private String referenceType;

    // ============================================================
    // DEFAULT CONSTRUCTOR
    // ============================================================

    public NotificationCreateRequest() {
    }

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getUserId() {
        return userId;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationPriority getPriority() {
        return priority;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public void setPriority(NotificationPriority priority) {
        this.priority = priority;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }
}