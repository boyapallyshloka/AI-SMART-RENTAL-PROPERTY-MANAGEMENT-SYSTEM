package com.rental.rental_management_backend.expense.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.rental.rental_management_backend.expense.enums.ExpenseCategory;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Schema(description = "Expense creation request")
public class ExpenseCreateRequest {

    @NotNull
    @Schema(
            description = "Property ID",
            example = "1",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long propertyId;

    @NotNull
    @Schema(
            description = "Type of expense",
            example = "PROPERTY_TAX",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private ExpenseCategory category;

    @Size(max = 1000)
    @Schema(
            description = "Description of the expense",
            example = "Property tax payment"
    )
    private String description;

    @NotNull
    @Positive
    @Schema(
            description = "Expense amount",
            example = "5000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private BigDecimal amount;

    @NotNull
    @Schema(
            description = "Date of the expense",
            example = "2026-09-29",
            requiredMode = Schema.RequiredMode.REQUIRED
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