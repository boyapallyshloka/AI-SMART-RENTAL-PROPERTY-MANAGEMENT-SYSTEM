package com.rental.rental_management_backend.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.notification.dto.NotificationCreateRequest;
import com.rental.rental_management_backend.notification.dto.NotificationResponse;
import com.rental.rental_management_backend.notification.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @GetMapping
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'PROPERTY_OWNER'," +
            "'PROPERTY_MANAGER'," +
            "'TENANT'" +
            ")"
    )
    public ResponseEntity<List<NotificationResponse>>
            getMyNotifications() {

        return ResponseEntity.ok(
                notificationService.getMyNotifications()
        );
    }

    // =========================================================
    // GET MY UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/unread")
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'PROPERTY_OWNER'," +
            "'PROPERTY_MANAGER'," +
            "'TENANT'" +
            ")"
    )
    public ResponseEntity<List<NotificationResponse>>
            getMyUnreadNotifications() {

        return ResponseEntity.ok(
                notificationService
                        .getMyUnreadNotifications()
        );
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @GetMapping("/unread/count")
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'PROPERTY_OWNER'," +
            "'PROPERTY_MANAGER'," +
            "'TENANT'" +
            ")"
    )
    public ResponseEntity<Long> getUnreadCount() {

        return ResponseEntity.ok(
                notificationService.getMyUnreadCount()
        );
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'PROPERTY_OWNER'," +
            "'PROPERTY_MANAGER'," +
            "'TENANT'" +
            ")"
    )
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId) {

        notificationService.markAsRead(
                notificationId
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @PatchMapping("/read-all")
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'PROPERTY_OWNER'," +
            "'PROPERTY_MANAGER'," +
            "'TENANT'" +
            ")"
    )
    public ResponseEntity<Void> markAllAsRead() {

        notificationService.markAllAsRead();

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // CREATE NOTIFICATION
    // Mainly for internal testing/admin use
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<NotificationResponse>
            createNotification(
                    @Valid
                    @RequestBody
                    NotificationCreateRequest request) {

        return ResponseEntity.ok(
                notificationService
                        .createNotification(request)
        );
    }
}