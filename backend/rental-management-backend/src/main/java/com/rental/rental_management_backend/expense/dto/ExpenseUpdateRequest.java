package com.rental.rental_management_backend.expense.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.rental.rental_management_backend.expense.enums.ExpenseCategory;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ExpenseUpdateRequest {

    @Schema(
            description = "Property ID to which this expense belongs"
    )
    private Long propertyId;

    @Schema(
            description = "Type of expense",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private ExpenseCategory category;

    @Size(max = 1000)
    @Schema(
            description = "Description of the expense"
    )
    private String description;

    @Positive
    @Schema(
            description = "Expense amount"
    )
    private BigDecimal amount;

    @Schema(
            description = "Date of the expense"
    )
    private LocalDate expenseDate;

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }
}