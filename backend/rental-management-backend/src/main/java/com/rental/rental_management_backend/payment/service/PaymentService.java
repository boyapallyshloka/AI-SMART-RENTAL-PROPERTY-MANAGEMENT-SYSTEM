package com.rental.rental_management_backend.payment.service;

import java.util.List;

import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;
import com.rental.rental_management_backend.payment.dto.RazorpayOrderRequestDTO;
import com.rental.rental_management_backend.payment.dto.RazorpayOrderResponseDTO;
import com.rental.rental_management_backend.payment.dto.RazorpayPaymentVerificationRequestDTO;


public interface PaymentService {

    PaymentResponse createPayment(
            PaymentCreateDTO request,
            String email);

    RazorpayOrderResponseDTO createRazorpayOrder(
            RazorpayOrderRequestDTO request,
            String email);

    PaymentResponse verifyRazorpayPayment(
            RazorpayPaymentVerificationRequestDTO request,
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