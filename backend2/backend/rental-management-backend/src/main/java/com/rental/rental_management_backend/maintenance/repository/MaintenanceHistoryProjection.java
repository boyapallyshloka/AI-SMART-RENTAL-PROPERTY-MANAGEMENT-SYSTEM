package com.rental.rental_management_backend.maintenance.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rental.rental_management_backend.maintenance.enums.MaintenanceCategory;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceStatus;

public interface MaintenanceHistoryProjection {

    LocalDateTime getRequestedDate();

    BigDecimal getCost();

    MaintenanceStatus getStatus();

    LocalDateTime getCompletedDate();

    MaintenanceCategory getCategory();
}
