
package com.rental.rental_management_backend.payment.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import com.rental.rental_management_backend.payment.enums.PaymentMethod;

public class PaymentCreateDTO {

    @NotNull(message = "Invoice ID is required")
    private Long invoiceId;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Payment amount must be greater than zero"
    )
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    public PaymentCreateDTO() {
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
