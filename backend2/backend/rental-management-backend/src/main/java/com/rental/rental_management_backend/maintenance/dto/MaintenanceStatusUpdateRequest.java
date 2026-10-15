package com.rental.rental_management_backend.maintenance.dto;

public class MaintenanceStatusUpdateRequest {

    private String status;

    public MaintenanceStatusUpdateRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}