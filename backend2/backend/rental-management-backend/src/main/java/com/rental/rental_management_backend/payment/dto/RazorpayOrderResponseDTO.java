package com.rental.rental_management_backend.payment.dto;

import java.math.BigDecimal;

public class RazorpayOrderResponseDTO {

    private Long paymentId;
    private Long invoiceId;

    private String orderId;

    private BigDecimal amount;

    private String currency;

    private String keyId;

    public RazorpayOrderResponseDTO() {
    }

    public RazorpayOrderResponseDTO(
            Long paymentId,
            Long invoiceId,
            String orderId,
            BigDecimal amount,
            String currency,
            String keyId) {

        this.paymentId = paymentId;
        this.invoiceId = invoiceId;
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.keyId = keyId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }
}