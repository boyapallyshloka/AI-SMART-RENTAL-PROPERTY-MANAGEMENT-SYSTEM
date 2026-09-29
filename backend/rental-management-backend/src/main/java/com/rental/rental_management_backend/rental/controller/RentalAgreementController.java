package com.rental.rental_management_backend.rental.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.rental.rental_management_backend.rental.dto.RentalAgreementRequest;
import com.rental.rental_management_backend.rental.dto.RentalAgreementResponse;
import com.rental.rental_management_backend.rental.enums.AgreementStatus;
import com.rental.rental_management_backend.rental.service.RentalAgreementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rental-agreements")
public class RentalAgreementController {

    private final RentalAgreementService rentalAgreementService;

    public RentalAgreementController(
            RentalAgreementService rentalAgreementService) {

        this.rentalAgreementService = rentalAgreementService;
    }

    // ============================================================
    // CREATE RENTAL AGREEMENT
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> createAgreement(
            @Valid @RequestBody RentalAgreementRequest request,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        RentalAgreementResponse response =
                rentalAgreementService.createAgreement(request, email);

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // GET MY AGREEMENTS - TENANT
    // ============================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<RentalAgreementResponse>> getMyAgreements(
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalAgreementService.getMyAgreements(email)
        );
    }

    // ============================================================
    // GET ALL AGREEMENTS - MANAGEMENT
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<List<RentalAgreementResponse>> getAllAgreements(
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalAgreementService.getAllAgreements(email)
        );
    }

    // ============================================================
    // GET AGREEMENT BY ID
    // ============================================================

    @GetMapping("/{agreementId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT')")
    public ResponseEntity<RentalAgreementResponse> getAgreement(
            @PathVariable Long agreementId,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalAgreementService.getAgreement(
                        agreementId,
                        email
                )
        );
    }

    // ============================================================
    // UPDATE AGREEMENT STATUS
    // ============================================================

    @PatchMapping("/{agreementId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> updateStatus(
            @PathVariable Long agreementId,
            @RequestParam AgreementStatus status,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalAgreementService.updateStatus(
                        agreementId,
                        status,
                        email
                )
        );
    }

    // ============================================================
    // UPDATE MOVE-OUT DATE
    // ============================================================

    @PatchMapping("/{agreementId}/move-out")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> updateMoveOutDate(
            @PathVariable Long agreementId,
            @RequestParam LocalDate moveOutDate,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                rentalAgreementService.updateMoveOutDate(
                        agreementId,
                        moveOutDate,
                        email
                )
        );
    }

    // ============================================================
    // VIEW / DOWNLOAD GENERATED AGREEMENT PDF
    // ============================================================

    @GetMapping("/{agreementId}/document")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT')")
    public ResponseEntity<Resource> getAgreementDocument(
            @PathVariable Long agreementId,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        Resource resource =
                rentalAgreementService.getAgreementDocument(
                        agreementId,
                        email
                );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\""
                )
                .body(resource);
    }
    @GetMapping("/{agreementId}/document/download")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT')")
    public ResponseEntity<Resource> downloadAgreementDocument(
            @PathVariable Long agreementId,
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        Resource resource =
                rentalAgreementService.getAgreementDocument(
                        agreementId,
                        email
                );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\""
                )
                .body(resource);
    }
}