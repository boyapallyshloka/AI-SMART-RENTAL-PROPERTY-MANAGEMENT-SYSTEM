package com.rental.rental_management_backend.rental.dto;

import com.rental.rental_management_backend.rental.enums.RentalApplicationStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RentalApplicationReviewRequest {

    @NotNull(message = "Status is required")
    private RentalApplicationStatus status;

    @Size(max = 1000, message = "Rejection reason cannot exceed 1000 characters")
    private String rejectionReason;

    public RentalApplicationReviewRequest() {
    }

    public RentalApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(RentalApplicationStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}