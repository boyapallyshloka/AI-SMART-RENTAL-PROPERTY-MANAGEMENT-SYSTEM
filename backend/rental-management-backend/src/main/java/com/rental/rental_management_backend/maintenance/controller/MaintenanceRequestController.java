package com.rental.rental_management_backend.maintenance.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.maintenance.dto.M5PredictionRequest;
import com.rental.rental_management_backend.maintenance.dto.M5PredictionResponse;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestRequest;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestResponse;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceStatusUpdateRequest;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceCategory;
import com.rental.rental_management_backend.maintenance.enums.MaintenancePriority;
import com.rental.rental_management_backend.maintenance.enums.MaintenanceStatus;
import com.rental.rental_management_backend.maintenance.service.M5AggregationService;
import com.rental.rental_management_backend.maintenance.service.MaintenanceAiServiceClient;
import com.rental.rental_management_backend.maintenance.service.MaintenanceRequestService;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.repository.UnitRepository;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private M5AggregationService m5AggregationService;

    @Autowired
    private MaintenanceAiServiceClient aiServiceClient;

    public MaintenanceRequestController(
            MaintenanceRequestService maintenanceRequestService) {

        this.maintenanceRequestService = maintenanceRequestService;
    }

    // =========================================================
    // PREDICT MAINTENANCE
    // Property Manager / Property Owner / Super Admin
    // =========================================================

    @GetMapping("/predict/{propertyId}")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<M5PredictionResponse> predictMaintenance(
            @PathVariable Long propertyId,
            @RequestParam(required = false) Long unitId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found with ID: " + propertyId
                        )
                );

        Unit unit = (unitId != null)
                ? unitRepository.findById(unitId).orElse(null)
                : null;

        M5PredictionRequest payload =
                m5AggregationService.aggregate(property, unit);

        M5PredictionResponse response =
                aiServiceClient.callPrediction(payload);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // CREATE MAINTENANCE REQUEST
    // Tenant only
    // =========================================================

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<MaintenanceRequestResponse> createRequest(

            @RequestParam Long propertyId,

            @RequestParam Long unitId,

            @RequestParam MaintenanceCategory category,

            @RequestParam String description,

            @RequestParam MaintenancePriority priority,

            @RequestParam(value = "image", required = false)
            MultipartFile image)

            throws IOException {

        System.out.println(
                ">>> CREATE MAINTENANCE CONTROLLER REACHED <<<"
        );

        MaintenanceRequestRequest request =
                new MaintenanceRequestRequest();

        request.setPropertyId(propertyId);
        request.setUnitId(unitId);
        request.setCategory(category);
        request.setDescription(description);
        request.setPriority(priority);

        MaintenanceRequestResponse response =
                maintenanceRequestService.createRequest(
                        request,
                        image
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET ALL MAINTENANCE REQUESTS
    // Property Manager / Property Owner / Super Admin
    // =========================================================

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MaintenanceRequestResponse>>
            getAllRequests() {

        return ResponseEntity.ok(
                maintenanceRequestService.getAllRequests()
        );
    }

    // =========================================================
    // GET MAINTENANCE REQUEST BY ID
    // Tenant / Property Manager / Property Owner / Super Admin
    //
    // IMPORTANT:
    // Tenant should only be able to view their own request.
    // This ownership check must be handled in the service layer.
    // =========================================================

    @GetMapping("/{requestId}")
    @PreAuthorize(
            "hasAnyRole('TENANT', 'PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MaintenanceRequestResponse>
            getRequestById(
                    @PathVariable Long requestId) {

        return ResponseEntity.ok(
                maintenanceRequestService.getRequestById(requestId)
        );
    }

    // =========================================================
    // UPDATE MAINTENANCE REQUEST
    // Property Manager / Property Owner / Super Admin
    //
    // Tenant is NOT allowed to use PUT.
    // =========================================================

    @PutMapping(
            value = "/{requestId}",
            consumes = "multipart/form-data"
    )
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MaintenanceRequestResponse>
            updateRequest(

                    @PathVariable Long requestId,

                    @RequestParam Long tenantId,

                    @RequestParam Long propertyId,

                    @RequestParam Long unitId,

                    @RequestParam MaintenanceCategory category,

                    @RequestParam String description,

                    @RequestParam MaintenancePriority priority,

                    @RequestParam(value = "status", required = false)
                    MaintenanceStatus status,

                    @RequestParam(value = "completedDate", required = false)
                    LocalDateTime completedDate,

                    @RequestParam(value = "cost", required = false)
                    BigDecimal cost,

                    @RequestParam(value = "image", required = false)
                    MultipartFile image)

                    throws IOException {

        MaintenanceRequestRequest request =
                new MaintenanceRequestRequest();

        request.setTenantId(tenantId);
        request.setPropertyId(propertyId);
        request.setUnitId(unitId);
        request.setCategory(category);
        request.setDescription(description);
        request.setPriority(priority);
        request.setStatus(status);
        request.setCompletedDate(completedDate);
        request.setCost(cost);

        MaintenanceRequestResponse response =
                maintenanceRequestService.updateRequest(
                        requestId,
                        request,
                        image
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // UPDATE STATUS
    // Property Manager / Property Owner / Super Admin only
    //
    // Tenant is NOT allowed.
    // =========================================================

    @PatchMapping("/{ticketId}/status")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MaintenanceRequestResponse>
            updateStatus(

                    @PathVariable Long ticketId,

                    @RequestBody MaintenanceStatusUpdateRequest request) {

        MaintenanceRequestResponse response =
                maintenanceRequestService.updateStatus(
                        ticketId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // DELETE MAINTENANCE REQUEST
    // Property Manager / Property Owner / Super Admin
    //
    // Tenant is NOT allowed.
    // =========================================================

    @DeleteMapping("/{requestId}")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<Void> deleteRequest(
            @PathVariable Long requestId) {

        maintenanceRequestService.deleteRequest(requestId);

        return ResponseEntity.noContent().build();
    }
}