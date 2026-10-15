package com.rental.rental_management_backend.receipt.service;

import java.util.List;

import com.rental.rental_management_backend.receipt.dto.ReceiptResponse;

public interface ReceiptService {

    // Automatically called after successful Razorpay payment
    ReceiptResponse createReceipt(Long paymentId);

    ReceiptResponse getReceiptById(
            Long receiptId,
            String email);

    ReceiptResponse getReceiptByPaymentId(
            Long paymentId,
            String email);

    List<ReceiptResponse> getReceiptsByTenant(
            Long tenantId,
            String email);

    List<ReceiptResponse> getReceiptsByInvoice(
            Long invoiceId,
            String email);
}