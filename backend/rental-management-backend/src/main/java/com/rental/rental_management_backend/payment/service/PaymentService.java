
package com.rental.rental_management_backend.payment.service;

import java.util.List;

import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(
            PaymentCreateDTO request,
            String email);

    PaymentResponse confirmPayment(
            Long paymentId,
            String email);

    PaymentResponse getPaymentById(
            Long paymentId,
            String email);

    List<PaymentResponse> getPaymentsByTenant(
            Long tenantId,
            String email);

    List<PaymentResponse> getPaymentsByInvoice(
            Long invoiceId,
            String email);
}
