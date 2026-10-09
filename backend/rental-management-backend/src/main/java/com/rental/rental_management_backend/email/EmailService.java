
package com.rental.rental_management_backend.email;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendEmailVerificationOtp(
            String email,
            String firstName,
            String otp) {

        String subject = "Verify Your AI Smart Rental Email";

        String body = "Hello " + firstName + ",\n\n"
                + "Your email verification OTP is: " + otp + "\n\n"
                + "This OTP expires in 10 minutes.\n"
                + "Do not share this OTP with anyone.\n\n"
                + "If you did not register, you can ignore this email.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(email, subject, body);
    }

    public void sendTenantWelcomeEmail(
            String tenantEmail,
            String tenantName) {

        String subject = "Welcome to AI Smart Rental";
        String body = "Hello " + tenantName + ",\n\n"
                + "Welcome to AI Smart Rental & Property Management System.\n"
                + "Your email has been verified successfully.\n\n"
                + "You can log in when your account is active.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(tenantEmail, subject, body);
    }

    public void sendPropertyCreatedEmail(
            String recipientEmail,
            String propertyName) {

        String subject = "Property Created Successfully";
        String body = "Hello,\n\n"
                + "Your property \"" + propertyName
                + "\" has been created successfully.\n\n"
                + "You can log in to the platform to manage your property.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(recipientEmail, subject, body);
    }

    public void sendAgreementNotification(
            String tenantEmail,
            String tenantName,
            String agreementDetails) {

        String subject = "Rental Agreement Notification";
        String body = "Hello " + tenantName + ",\n\n"
                + "There is an update regarding your rental agreement.\n\n"
                + agreementDetails + "\n\n"
                + "Please log in to the platform to review the details.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(tenantEmail, subject, body);
    }

    public void sendPaymentSuccessEmail(
            String tenantEmail,
            String tenantName,
            String amount,
            String invoiceNumber) {

        String subject = "Rent Payment Successful";
        String body = "Hello " + tenantName + ",\n\n"
                + "Your rent payment has been verified successfully.\n\n"
                + "Amount paid: " + amount + "\n"
                + "Invoice number: " + invoiceNumber + "\n\n"
                + "Thank you for your payment.\n\n"
                + "AI Smart Rental Team";

        sendEmail(tenantEmail, subject, body);
    }

    public void sendPaymentFailureEmail(
            String tenantEmail,
            String tenantName,
            String invoiceNumber) {

        String subject = "Rent Payment Not Completed";
        String body = "Hello " + tenantName + ",\n\n"
                + "Your rent payment for invoice "
                + invoiceNumber + " has not been confirmed.\n\n"
                + "Please check your payment status in the platform "
                + "before attempting another payment.\n\n"
                + "If your account was charged, please contact support "
                + "before retrying.\n\n"
                + "AI Smart Rental Team";

        sendEmail(tenantEmail, subject, body);
    }

    public void sendMaintenanceUpdateEmail(
            String recipientEmail,
            String recipientName,
            String requestDetails,
            String status) {

        String subject = "Maintenance Request Status Update";
        String body = "Hello " + recipientName + ",\n\n"
                + "Your maintenance request has been updated.\n\n"
                + "Request details: " + requestDetails + "\n"
                + "Current status: " + status + "\n\n"
                + "Please log in to the platform for further details.\n\n"
                + "AI Smart Rental Team";

        sendEmail(recipientEmail, subject, body);
    }

    public void sendLoginNotificationEmail(
            String userEmail,
            String firstName) {

        String subject = "New Login to Your Smart Rental Account";
        String body = "Hello " + firstName + ",\n\n"
                + "A successful login to your AI Smart Rental account was detected.\n\n"
                + "If this was you, no action is required. If you do not recognize "
                + "this activity, please change your password and contact support.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(userEmail, subject, body);
    }

    public void sendPasswordResetEmail(
            String email,
            String firstName,
            String token) {

        String subject = "Reset Your AI Smart Rental Password";

        String body = "Hello " + firstName + ",\n\n"
                + "We received a request to reset your password.\n\n"
                + "Your password reset token is:\n"
                + token + "\n\n"
                + "This token expires in 15 minutes and can be used only once.\n\n"
                + "If you did not request a password reset, please ignore this email.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(email, subject, body);
        
    }
    
    public void sendPasswordChangedEmail(
            String email,
            String firstName) {

        String subject = "Your AI Smart Rental Password Was Changed";

        String body = "Hello " + firstName + ",\n\n"
                + "Your account password was changed successfully.\n\n"
                + "If you made this change, no action is required.\n"
                + "If you did not make this change, please contact support "
                + "and secure your account immediately.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(email, subject, body);
    }

    public void sendPasswordResetSuccessEmail(
            String email,
            String firstName) {

        String subject = "Your AI Smart Rental Password Was Reset";

        String body = "Hello " + firstName + ",\n\n"
                + "Your account password was reset successfully.\n\n"
                + "If you did not make this change, please contact support "
                + "and secure your account immediately.\n\n"
                + "Thank you,\nAI Smart Rental Team";

        sendEmail(email, subject, body);
    }
    

}