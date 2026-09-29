package com.rental.rental_management_backend.payment.service;

import java.util.List;

import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPaymentOrder(
            PaymentCreateDTO request
    );

    PaymentResponse verifyPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    );

    PaymentResponse getPaymentById(
            Long paymentId
    );

    List<PaymentResponse> getPaymentsByTenant(
            Long tenantId
    );

    List<PaymentResponse> getPaymentsByInvoice(
            Long invoiceId
    );
}