package com.rental.rental_management_backend.property.controller;

import java.util.List;


import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.property.dto.PropertyImageResponse;
import com.rental.rental_management_backend.property.service.PropertyImageService;


@RestController
@RequestMapping("/api/property-images")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('PROPERTY_OWNER')")
public class PropertyImageController {

    private final PropertyImageService propertyImageService;

    public PropertyImageController(
            PropertyImageService propertyImageService) {

        this.propertyImageService = propertyImageService;
    }

    // =========================================================
    // UPLOAD IMAGE
    // =========================================================

    @PostMapping(
            value = "/{propertyId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyImageResponse> addImage(
            @PathVariable Long propertyId,

            @RequestPart("file")
            MultipartFile file,

            @RequestParam(required = false)
            String imageType,

            @RequestParam(defaultValue = "false")
            Boolean isPrimary) {

        PropertyImageResponse response =
                propertyImageService.addImage(
                        propertyId,
                        file,
                        imageType,
                        isPrimary);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET PROPERTY IMAGES
    // =========================================================

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyImageResponse>>
            getImagesByProperty(
                    @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                propertyImageService
                        .getImagesByProperty(propertyId));
    }

    // =========================================================
    // GET IMAGE BY ID
    // =========================================================

    @GetMapping("/{imageId}")
    public ResponseEntity<PropertyImageResponse>
            getImageById(
                    @PathVariable Long imageId) {

        return ResponseEntity.ok(
                propertyImageService
                        .getImageById(imageId));
    }

    // =========================================================
    // UPDATE IMAGE
    // =========================================================

    @PutMapping(
            value = "/{imageId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyImageResponse> updateImage(

            @PathVariable Long imageId,

            @RequestPart(
                    value = "file",
                    required = false)
            MultipartFile file,

            @RequestParam(
                    value = "imageType",
                    required = false)
            String imageType,

            @RequestParam(
                    value = "isPrimary",
                    required = false)
            Boolean isPrimary) {

        PropertyImageResponse response =
                propertyImageService.updateImage(
                        imageId,
                        file,
                        imageType,
                        isPrimary);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

    @DeleteMapping("/{imageId}")
    public ResponseEntity<String> deleteImage(
            @PathVariable Long imageId) {

        propertyImageService.deleteImage(imageId);

        return ResponseEntity.ok(
                "Property image deleted successfully");
    }
}