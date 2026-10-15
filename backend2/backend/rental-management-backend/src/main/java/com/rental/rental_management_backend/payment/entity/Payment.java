package com.rental.rental_management_backend.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rental.rental_management_backend.payment.enums.PaymentMethod;
import com.rental.rental_management_backend.payment.enums.PaymentStatus;
import com.rental.rental_management_backend.rental.entity.RentInvoice;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rent_payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    // Payment belongs to an invoice
    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private RentInvoice invoice;

    // Tenant ID from the invoice/user system
    @Column(nullable = false)
    private Long tenantId;

    // Amount paid
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Payment status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    // Payment method used by tenant
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private PaymentMethod paymentMethod;
  

    // Razorpay order ID
    @Column(unique = true)
    private String razorpayOrderId;

    // Razorpay payment ID
    @Column(unique = true)
    private String razorpayPaymentId;

    // Date and time when payment was completed
    private LocalDateTime paymentDate;

    // Record creation time
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Record update time
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Payment() {
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public RentInvoice getInvoice() {
        return invoice;
    }

    public void setInvoice(RentInvoice invoice) {
        this.invoice = invoice;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}