package com.rental.rental_management_backend.expense.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Available expense categories")
public enum ExpenseCategory {

    @Schema(description = "Property tax expenses")
    PROPERTY_TAX,

    @Schema(description = "Property insurance expenses")
    INSURANCE,

    @Schema(description = "Electricity bill expenses")
    ELECTRICITY_BILL,

    @Schema(description = "Water bill expenses")
    WATER_BILL,

    @Schema(description = "Security expenses")
    SECURITY,

    @Schema(description = "Cleaning service expenses")
    CLEANING_SERVICE,

    @Schema(description = "Property management expenses")
    PROPERTY_MANAGEMENT,

    @Schema(description = "Legal fee expenses")
    LEGAL_FEES,

    @Schema(description = "Administrative expenses")
    ADMINISTRATIVE,

    @Schema(description = "Common area expenses")
    COMMON_AREA,

    @Schema(description = "Other expenses")
    OTHER
}