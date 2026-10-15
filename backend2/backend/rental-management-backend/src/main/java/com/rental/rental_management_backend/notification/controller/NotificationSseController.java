package com.rental.rental_management_backend.notification.controller;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.notification.service.NotificationSseService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationSseController {

    private final NotificationSseService notificationSseService;

    private final UserRepository userRepository;

    public NotificationSseController(
            NotificationSseService notificationSseService,
            UserRepository userRepository) {

        this.notificationSseService =
                notificationSseService;

        this.userRepository =
                userRepository;
    }

    @GetMapping(
            value = "/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter stream(
            Authentication authentication) {

        String email =
                authentication.getName();

        Long userId =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        )
                        .getId();

        return notificationSseService
                .connect(userId);
    }
}