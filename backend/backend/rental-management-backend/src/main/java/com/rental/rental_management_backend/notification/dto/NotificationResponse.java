package com.rental.rental_management_backend.notification.dto;

import java.time.LocalDateTime;

import com.rental.rental_management_backend.notification.enums.NotificationPriority;
import com.rental.rental_management_backend.notification.enums.NotificationType;

public class NotificationResponse {

    private Long notificationId;

    private NotificationType type;

    private NotificationPriority priority;

    private String title;

    private String message;

    private Long referenceId;

    private String referenceType;

    private boolean read;

    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(
            Long notificationId,
            NotificationType type,
            NotificationPriority priority,
            String title,
            String message,
            Long referenceId,
            String referenceType,
            boolean read,
            LocalDateTime createdAt) {

        this.notificationId = notificationId;
        this.type = type;
        this.priority = priority;
        this.title = title;
        this.message = message;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public NotificationPriority getPriority() {
        return priority;
    }

    public void setPriority(NotificationPriority priority) {
        this.priority = priority;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}