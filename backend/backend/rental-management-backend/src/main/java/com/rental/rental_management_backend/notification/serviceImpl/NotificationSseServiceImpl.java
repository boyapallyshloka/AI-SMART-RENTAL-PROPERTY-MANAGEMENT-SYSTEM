package com.rental.rental_management_backend.notification.serviceImpl;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.rental.rental_management_backend.notification.service.NotificationSseService;

@Service
public class NotificationSseServiceImpl
        implements NotificationSseService {

    /*
     * Stores the active SSE connection for each user.
     *
     * Key   = userId
     * Value = SseEmitter
     */
    private final Map<Long, SseEmitter> emitters =
            new ConcurrentHashMap<>();

    /*
     * SSE connection timeout.
     *
     * 30 minutes = 30 * 60 * 1000 milliseconds
     */
    private static final long SSE_TIMEOUT =
            30 * 60 * 1000L;

    // ============================================================
    // CONNECT USER TO SSE
    // ============================================================

    @Override
    public SseEmitter connect(Long userId) {

        /*
         * Create a new SSE emitter.
         */
        SseEmitter emitter =
                new SseEmitter(SSE_TIMEOUT);

        /*
         * Store the connection against the logged-in user.
         */
        emitters.put(userId, emitter);

        /*
         * Remove the connection when it completes.
         */
        emitter.onCompletion(
                () -> emitters.remove(userId)
        );

        /*
         * Remove the connection when it times out.
         */
        emitter.onTimeout(
                () -> {
                    emitters.remove(userId);
                    emitter.complete();
                }
        );

        /*
         * Remove the connection when an error occurs.
         */
        emitter.onError(
                error -> emitters.remove(userId)
        );

        /*
         * Send an initial event so the frontend knows
         * that the SSE connection is successfully established.
         */
        try {

            emitter.send(
                    SseEmitter.event()
                            .name("connected")
                            .data("Notification stream connected")
            );

        } catch (IOException e) {

            emitters.remove(userId);

            emitter.completeWithError(e);
        }

        return emitter;
    }

    // ============================================================
    // SEND NOTIFICATION
    // ============================================================

    @Override
    public void sendNotification(
            Long userId,
            Object notification) {

        SseEmitter emitter =
                emitters.get(userId);

        /*
         * User is not currently connected.
         *
         * The notification is already stored in the database,
         * so the user can retrieve it later through:
         *
         * GET /api/notifications
         */
        if (emitter == null) {
            return;
        }

        try {

            emitter.send(
                    SseEmitter.event()
                            .name("notification")
                            .data(notification)
            );

        } catch (IOException e) {

            emitters.remove(userId);

            emitter.completeWithError(e);
        }
    }

    // ============================================================
    // REMOVE CONNECTION
    // ============================================================

    @Override
    public void removeConnection(Long userId) {

        SseEmitter emitter =
                emitters.remove(userId);

        if (emitter != null) {
            emitter.complete();
        }
    }
}