package com.rental.rental_management_backend.receipt.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.receipt.dto.ReceiptResponse;
import com.rental.rental_management_backend.receipt.service.ReceiptService;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    // =========================================================
    // GET RECEIPT BY ID
    // =========================================================

    @GetMapping("/{receiptId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROPERTY_OWNER','PROPERTY_MANAGER','TENANT')")
    public ResponseEntity<ReceiptResponse> getReceiptById(
            @PathVariable Long receiptId,
            Authentication authentication) {

        return ResponseEntity.ok(
                receiptService.getReceiptById(
                        receiptId,
                        authentication.getName()));
    }

    // =========================================================
    // GET RECEIPT BY PAYMENT ID
    // =========================================================

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROPERTY_OWNER','PROPERTY_MANAGER','TENANT')")
    public ResponseEntity<ReceiptResponse> getReceiptByPaymentId(
            @PathVariable Long paymentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                receiptService.getReceiptByPaymentId(
                        paymentId,
                        authentication.getName()));
    }

    // =========================================================
    // GET RECEIPTS BY TENANT
    // =========================================================

    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROPERTY_OWNER','PROPERTY_MANAGER','TENANT')")
    public ResponseEntity<List<ReceiptResponse>> getReceiptsByTenant(
            @PathVariable Long tenantId,
            Authentication authentication) {

        return ResponseEntity.ok(
                receiptService.getReceiptsByTenant(
                        tenantId,
                        authentication.getName()));
    }

    // =========================================================
    // GET RECEIPTS BY INVOICE
    // =========================================================

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROPERTY_OWNER','PROPERTY_MANAGER','TENANT')")
    public ResponseEntity<List<ReceiptResponse>> getReceiptsByInvoice(
            @PathVariable Long invoiceId,
            Authentication authentication) {

        return ResponseEntity.ok(
                receiptService.getReceiptsByInvoice(
                        invoiceId,
                        authentication.getName()));
    }
}