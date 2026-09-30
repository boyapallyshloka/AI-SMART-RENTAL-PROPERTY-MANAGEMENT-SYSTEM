package com.rental.rental_management_backend.payment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;
import com.rental.rental_management_backend.payment.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =========================================================
    // CREATE PAYMENT
    // TENANT ONLY
    // =========================================================

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

    // =========================================================
    // CONFIRM PAYMENT
    // TENANT ONLY
    // =========================================================

    @PostMapping("/confirm/{paymentId}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable Long paymentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.confirmPayment(
                        paymentId,
                        authentication.getName()));
    }

    // =========================================================
    // GET PAYMENT BY ID
    // SUPER_ADMIN / OWNER / MANAGER / TENANT
    // =========================================================

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

    // =========================================================
    // GET PAYMENTS BY TENANT
    // SUPER_ADMIN / OWNER / MANAGER / TENANT
    // =========================================================

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

    // =========================================================
    // GET PAYMENTS BY INVOICE
    // SUPER_ADMIN / OWNER / MANAGER / TENANT
    // =========================================================

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