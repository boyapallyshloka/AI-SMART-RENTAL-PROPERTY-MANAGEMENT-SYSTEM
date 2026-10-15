package com.rental.rental_management_backend.reports.service;

import java.time.LocalDate;

import com.rental.rental_management_backend.reports.dto.ReportsAnalyticsResponse;

public interface ReportsAnalyticsService {

    ReportsAnalyticsResponse getReports(
            String authenticatedEmail,
            LocalDate startDate,
            LocalDate endDate);
}
