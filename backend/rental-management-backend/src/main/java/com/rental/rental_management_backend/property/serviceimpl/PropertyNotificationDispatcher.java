package com.rental.rental_management_backend.property.serviceimpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.email.EmailService;

@Service
public class PropertyNotificationDispatcher {

    private static final Logger logger =
            LoggerFactory.getLogger(PropertyNotificationDispatcher.class);

    private final EmailService emailService;

    public PropertyNotificationDispatcher(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async("propertyNotificationExecutor")
    public void sendPropertyCreatedEmail(String email, String propertyName) {
        try {
            emailService.sendPropertyCreatedEmail(email, propertyName);
        } catch (MailException ex) {
            logger.error(
                    "Property was created, but notification email could not be sent.",
                    ex);
        }
    }
}
