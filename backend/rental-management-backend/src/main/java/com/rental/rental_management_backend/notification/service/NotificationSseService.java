package com.rental.rental_management_backend.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface NotificationSseService {

    SseEmitter connect(Long userId);

    void sendNotification(Long userId, Object notification);

    void removeConnection(Long userId);
}