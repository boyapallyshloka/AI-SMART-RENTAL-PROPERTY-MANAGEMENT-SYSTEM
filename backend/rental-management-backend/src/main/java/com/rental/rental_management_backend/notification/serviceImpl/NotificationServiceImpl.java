package com.rental.rental_management_backend.notification.serviceImpl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.notification.dto.NotificationCreateRequest;
import com.rental.rental_management_backend.notification.dto.NotificationResponse;
import com.rental.rental_management_backend.notification.entity.Notification;
import com.rental.rental_management_backend.notification.enums.NotificationPriority;
import com.rental.rental_management_backend.notification.enums.NotificationType;
import com.rental.rental_management_backend.notification.repository.NotificationRepository;
import com.rental.rental_management_backend.notification.service.NotificationService;
import com.rental.rental_management_backend.notification.service.NotificationSseService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;

    private final NotificationSseService notificationSseService;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationSseService notificationSseService) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationSseService = notificationSseService;
    }

    // ============================================================
    // CREATE NOTIFICATION
    // ============================================================

    @Override
    public NotificationResponse createNotification(
            NotificationCreateRequest request) {

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        Notification notification = new Notification(
                user,
                request.getType(),
                request.getPriority(),
                request.getTitle(),
                request.getMessage(),
                request.getReferenceId(),
                request.getReferenceType(),
                false
        );

        Notification savedNotification =
                notificationRepository.save(notification);

        NotificationResponse response =
                mapToResponse(savedNotification);

        /*
         * Send the notification immediately to the
         * connected frontend through SSE.
         */
        notificationSseService.sendNotification(
                user.getId(),
                response
        );

        return response;
    }

    // ============================================================
    // GET ALL NOTIFICATIONS OF LOGGED-IN USER
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {

        User user = getLoggedInUser();

        return notificationRepository
                .findByUser_IdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET UNREAD NOTIFICATIONS OF LOGGED-IN USER
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnreadNotifications() {

        User user = getLoggedInUser();

        return notificationRepository
                .findByUser_IdAndReadFalseOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================================================
    // GET UNREAD NOTIFICATION COUNT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public long getMyUnreadCount() {

        User user = getLoggedInUser();

        return notificationRepository
                .countByUser_IdAndReadFalse(
                        user.getId()
                );
    }

    // ============================================================
    // MARK ONE NOTIFICATION AS READ
    // ============================================================

    @Override
    public void markAsRead(Long notificationId) {

        User user = getLoggedInUser();

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found"
                                )
                        );

        /*
         * IMPORTANT:
         *
         * A user can only mark their own notification
         * as read.
         */
        if (!notification.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this notification"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    // ============================================================
    // MARK ALL NOTIFICATIONS AS READ
    // ============================================================

    @Override
    public void markAllAsRead() {

        User user = getLoggedInUser();

        List<Notification> notifications =
                notificationRepository
                        .findByUser_IdOrderByCreatedAtDesc(
                                user.getId()
                        );

        notifications.forEach(
                notification -> notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }

    // ============================================================
    // SEND NOTIFICATION TO SPECIFIC USER
    // ============================================================

    @Override
    public void notifyUser(
            Long userId,
            NotificationType type,
            NotificationPriority priority,
            String title,
            String message,
            Long referenceId,
            String referenceType) {

        NotificationCreateRequest request =
                new NotificationCreateRequest();

        request.setUserId(userId);
        request.setType(type);
        request.setPriority(priority);
        request.setTitle(title);
        request.setMessage(message);
        request.setReferenceId(referenceId);
        request.setReferenceType(referenceType);

        createNotification(request);
    }

    // ============================================================
    // GET LOGGED-IN USER
    // ============================================================

    private User getLoggedInUser() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }

    // ============================================================
    // CONVERT ENTITY TO RESPONSE DTO
    // ============================================================

    private NotificationResponse mapToResponse(
            Notification notification) {

        return new NotificationResponse(
                notification.getNotificationId(),
                notification.getType(),
                notification.getPriority(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceId(),
                notification.getReferenceType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}