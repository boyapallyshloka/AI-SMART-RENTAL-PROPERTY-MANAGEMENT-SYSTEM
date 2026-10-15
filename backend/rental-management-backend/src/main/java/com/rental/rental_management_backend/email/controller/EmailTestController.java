
package com.rental.rental_management_backend.email.controller;

import com.rental.rental_management_backend.email.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String to) {

        if (to == null || to.isBlank()
                || !to.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest()
                    .body("Please provide a valid recipient email address.");
        }

        try {
            emailService.sendEmail(
                    to,
                    "SMTP Test - Rental Management",
                    "Gmail SMTP is working in your AI Smart Rental & Property Management System."
            );

            return ResponseEntity.ok("Test email sent successfully.");

        } catch (MailException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Unable to send the test email. Check the SMTP configuration and application logs.");
        }
    }
    
}


