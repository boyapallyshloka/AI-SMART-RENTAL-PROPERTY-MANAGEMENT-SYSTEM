package com.rental.rental_management_backend.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.payment.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Get all payments for a particular invoice
    List<Payment> findByInvoice_InvoiceId(Long invoiceId);

    // Get all payments made by a particular tenant
    List<Payment> findByTenantId(Long tenantId);

    // Find payment using Razorpay order ID
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Find payment using Razorpay payment ID
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    // Check whether a Razorpay order already exists
    boolean existsByRazorpayOrderId(String razorpayOrderId);

    // Check whether a Razorpay payment already exists
    boolean existsByRazorpayPaymentId(String razorpayPaymentId);
}