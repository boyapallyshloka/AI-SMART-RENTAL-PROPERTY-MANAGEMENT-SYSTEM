package com.rental.rental_management_backend.receipt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.receipt.entity.Receipt;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByPayment_PaymentId(Long paymentId);

    Optional<Receipt> findByReceiptNumber(String receiptNumber);

    List<Receipt> findByTenantId(Long tenantId);

    List<Receipt> findByInvoiceId(Long invoiceId);
}