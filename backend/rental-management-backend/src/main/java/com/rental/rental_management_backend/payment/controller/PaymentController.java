package com.rental.rental_management_backend.payment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;
import com.rental.rental_management_backend.payment.dto.RazorpayOrderRequestDTO;
import com.rental.rental_management_backend.payment.dto.RazorpayOrderResponseDTO;
import com.rental.rental_management_backend.payment.dto.RazorpayPaymentVerificationRequestDTO;
import com.rental.rental_management_backend.payment.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Existing payment creation
    @PostMapping("/create")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentCreateDTO request,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.createPayment(
                        request,
                        authentication.getName()));
    }

    // CREATE RAZORPAY ORDER
    @PostMapping("/razorpay/order")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<RazorpayOrderResponseDTO> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequestDTO request,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.createRazorpayOrder(
                        request,
                        authentication.getName()));
    }

    // VERIFY RAZORPAY PAYMENT
    @PostMapping("/razorpay/verify")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<PaymentResponse> verifyRazorpayPayment(
            @Valid @RequestBody RazorpayPaymentVerificationRequestDTO request,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.verifyRazorpayPayment(
                        request,
                        authentication.getName()));
    }

    // GET PAYMENT BY ID
    @GetMapping("/{paymentId}")
    @PreAuthorize("""
        hasAnyRole(
            'SUPER_ADMIN',
            'PROPERTY_OWNER',
            'PROPERTY_MANAGER',
            'TENANT'
        )
    """)
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(
                        paymentId,
                        authentication.getName()));
    }

    // GET PAYMENTS BY TENANT
    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("""
        hasAnyRole(
            'SUPER_ADMIN',
            'PROPERTY_OWNER',
            'PROPERTY_MANAGER',
            'TENANT'
        )
    """)
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTenant(
            @PathVariable Long tenantId,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByTenant(
                        tenantId,
                        authentication.getName()));
    }

    // GET PAYMENTS BY INVOICE
    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("""
        hasAnyRole(
            'SUPER_ADMIN',
            'PROPERTY_OWNER',
            'PROPERTY_MANAGER',
            'TENANT'
        )
    """)
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(
            @PathVariable Long invoiceId,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByInvoice(
                        invoiceId,
                        authentication.getName()));
    }
}