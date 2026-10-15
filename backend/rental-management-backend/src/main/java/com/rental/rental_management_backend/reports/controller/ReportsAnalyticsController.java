package com.rental.rental_management_backend.reports.controller;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.rental.rental_management_backend.reports.dto.ReportsAnalyticsResponse;
import com.rental.rental_management_backend.reports.service.ReportsAnalyticsService;

@RestController
@RequestMapping("/api/reports-analytics")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
public class ReportsAnalyticsController {

    private final ReportsAnalyticsService reportsAnalyticsService;

    public ReportsAnalyticsController(ReportsAnalyticsService reportsAnalyticsService) {
        this.reportsAnalyticsService = reportsAnalyticsService;
    }

    /**
     * Returns report figures for the authenticated owner's properties,
     * manager's assigned properties, or all properties for SUPER_ADMIN.
     * Defaults to the current calendar month through today.
     */
    @GetMapping
    public ResponseEntity<ReportsAnalyticsResponse> getReports(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        LocalDate today = LocalDate.now();
        LocalDate resolvedEnd = endDate == null ? today : endDate;
        LocalDate resolvedStart = startDate == null
                ? resolvedEnd.with(TemporalAdjusters.firstDayOfMonth())
                : startDate;

        if (resolvedStart.isAfter(resolvedEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "startDate must be on or before endDate");
        }

        return ResponseEntity.ok(reportsAnalyticsService.getReports(
                authentication.getName(), resolvedStart, resolvedEnd));
    }
}
