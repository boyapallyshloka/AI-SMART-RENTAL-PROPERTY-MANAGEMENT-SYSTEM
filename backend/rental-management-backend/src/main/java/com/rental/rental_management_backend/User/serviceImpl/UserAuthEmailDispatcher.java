package com.rental.rental_management_backend.User.serviceImpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class UserAuthEmailDispatcher {

    private static final Logger logger =
            LoggerFactory.getLogger(UserAuthEmailDispatcher.class);

    @Async("userAuthEmailExecutor")
    public void dispatch(String notificationType, Runnable sendEmail) {
        try {
            sendEmail.run();
        } catch (MailException ex) {
            logger.error("{} email could not be sent.", notificationType, ex);
        }
    }
}
