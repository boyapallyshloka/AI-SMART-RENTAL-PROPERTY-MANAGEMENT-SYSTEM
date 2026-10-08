package com.rental.rental_management_backend.notification.service;

import java.util.List;

import com.rental.rental_management_backend.notification.dto.NotificationCreateRequest;
import com.rental.rental_management_backend.notification.dto.NotificationResponse;
import com.rental.rental_management_backend.notification.enums.NotificationPriority;
import com.rental.rental_management_backend.notification.enums.NotificationType;

public interface NotificationService {

    // Create notification
    NotificationResponse createNotification(
            NotificationCreateRequest request
    );

    // Get notifications of logged-in user
    List<NotificationResponse> getMyNotifications();

    // Get unread notifications of logged-in user
    List<NotificationResponse> getMyUnreadNotifications();

    // Get unread notification count
    long getMyUnreadCount();

    // Mark one notification as read
    void markAsRead(Long notificationId);

    // Mark all notifications as read
    void markAllAsRead();

    // Internal method used by other modules
    // such as Maintenance, Rent Payment, Agreement, etc.
    void notifyUser(
            Long userId,
            NotificationType type,
            NotificationPriority priority,
            String title,
            String message,
            Long referenceId,
            String referenceType
    );
}