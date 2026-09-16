package com.rental.rental_management_backend.rental.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RentalApplicationCreateRequest {

    @NotNull(message = "Unit ID is required")
    private Long unitId;

    @FutureOrPresent(message = "Preferred move-in date cannot be in the past")
    private LocalDate preferredMoveInDate;

    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;

    public RentalApplicationCreateRequest() {
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public LocalDate getPreferredMoveInDate() {
        return preferredMoveInDate;
    }

    public void setPreferredMoveInDate(LocalDate preferredMoveInDate) {
        this.preferredMoveInDate = preferredMoveInDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}