package com.rental.rental_management_backend.rental.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;

import org.springframework.web.multipart.MultipartFile;

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

    // =========================================================
    // CREATE AGREEMENT
    // SUPER_ADMIN / PROPERTY_OWNER / PROPERTY_MANAGER
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> createAgreement(
            @Valid @RequestBody RentalAgreementRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        RentalAgreementResponse response =
                rentalAgreementService.createAgreement(
                        request,
                        email);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // VIEW ONE AGREEMENT
    //
    // SUPER_ADMIN      -> any agreement
    // PROPERTY_OWNER   -> own property's agreement
    // PROPERTY_MANAGER -> assigned property's agreement
    // TENANT           -> own agreement
    // =========================================================

    @GetMapping("/{agreementId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT')")
    public ResponseEntity<RentalAgreementResponse> getAgreement(
            @PathVariable Long agreementId,
            Authentication authentication) {

        String email = authentication.getName();

        RentalAgreementResponse response =
                rentalAgreementService.getAgreement(
                        agreementId,
                        email);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // TENANT -> VIEW OWN AGREEMENTS
    // TENANT ONLY
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<RentalAgreementResponse>> getMyAgreements(
            Authentication authentication) {

        String email = authentication.getName();

        List<RentalAgreementResponse> agreements =
                rentalAgreementService.getMyAgreements(email);

        return ResponseEntity.ok(agreements);
    }

    // =========================================================
    // VIEW AGREEMENTS
    //
    // SUPER_ADMIN      -> all agreements
    // PROPERTY_OWNER   -> own property agreements
    // PROPERTY_MANAGER -> assigned property agreements
    //
    // TENANT DOES NOT USE THIS ENDPOINT.
    // Tenant uses /my.
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<List<RentalAgreementResponse>> getAllAgreements(
            Authentication authentication) {

        String email = authentication.getName();

        List<RentalAgreementResponse> agreements =
                rentalAgreementService.getAllAgreements(email);

        return ResponseEntity.ok(agreements);
    }

    // =========================================================
    // UPDATE AGREEMENT STATUS
    //
    // SUPER_ADMIN      -> any agreement
    // PROPERTY_OWNER   -> own property's agreement
    // PROPERTY_MANAGER -> assigned property's agreement
    // TENANT           -> NOT ALLOWED
    // =========================================================

    @PatchMapping("/{agreementId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> updateStatus(
            @PathVariable Long agreementId,
            @RequestParam AgreementStatus status,
            Authentication authentication) {

        String email = authentication.getName();

        RentalAgreementResponse response =
                rentalAgreementService.updateStatus(
                        agreementId,
                        status,
                        email);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // UPDATE MOVE-OUT DATE
    //
    // SUPER_ADMIN      -> any agreement
    // PROPERTY_OWNER   -> own property's agreement
    // PROPERTY_MANAGER -> assigned property's agreement
    // TENANT           -> NOT ALLOWED
    // =========================================================

    @PatchMapping("/{agreementId}/move-out")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> updateMoveOutDate(
            @PathVariable Long agreementId,
            @RequestParam LocalDate moveOutDate,
            Authentication authentication) {

        String email = authentication.getName();

        RentalAgreementResponse response =
                rentalAgreementService.updateMoveOutDate(
                        agreementId,
                        moveOutDate,
                        email);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // UPLOAD AGREEMENT DOCUMENT
    //
    // SUPER_ADMIN      -> any agreement
    // PROPERTY_OWNER   -> own property's agreement
    // PROPERTY_MANAGER -> assigned property's agreement
    // TENANT           -> NOT ALLOWED
    //
    // Uploads actual PDF from local system.
    // =========================================================

    @PostMapping(
            value = "/{agreementId}/document",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')")
    public ResponseEntity<RentalAgreementResponse> uploadAgreementDocument(
            @PathVariable Long agreementId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();

        RentalAgreementResponse response =
                rentalAgreementService.uploadAgreementDocument(
                        agreementId,
                        file,
                        email);

        return ResponseEntity.ok(response);
    }
 // =========================================================
 // VIEW / DOWNLOAD AGREEMENT DOCUMENT
 //
 // SUPER_ADMIN      -> any agreement
 // PROPERTY_OWNER   -> own property's agreement
 // PROPERTY_MANAGER -> assigned property's agreement
 // TENANT           -> own agreement
 //
 // Returns the actual PDF file.
 // =========================================================

 @GetMapping("/{agreementId}/document")
 @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'TENANT')")
 public ResponseEntity<Resource> getAgreementDocument(
         @PathVariable Long agreementId,
         Authentication authentication) {

     String email = authentication.getName();

     Resource resource =
             rentalAgreementService.getAgreementDocument(
                     agreementId,
                     email);

     try {

         return ResponseEntity.ok()
                 .contentType(MediaType.APPLICATION_PDF)
                 .contentLength(resource.contentLength())
                 .header(
                         "Content-Disposition",
                         "inline; filename=\"rental-agreement-" +
                                 agreementId +
                                 ".pdf\"")
                 .body(resource);

     } catch (Exception ex) {

         throw new RuntimeException(
                 "Failed to read agreement document",
                 ex);
     }
 }
}