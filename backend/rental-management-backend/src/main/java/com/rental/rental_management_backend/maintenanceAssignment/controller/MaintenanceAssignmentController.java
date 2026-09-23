package com.rental.rental_management_backend.maintenanceAssignment.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.rental_management_backend.maintenanceAssignment.entity.MaintenanceAssignment;
import com.rental.rental_management_backend.maintenanceAssignment.service.MaintenanceAssignmentService;

@RestController
@RequestMapping("/api/maintenance-assignments")
public class MaintenanceAssignmentController {

    private final MaintenanceAssignmentService assignmentService;

    public MaintenanceAssignmentController(
            MaintenanceAssignmentService assignmentService) {

        this.assignmentService = assignmentService;
    }

    // =========================================================
    // CREATE ASSIGNMENT
    // PROPERTY MANAGER / PROPERTY OWNER / SUPER ADMIN
    // =========================================================

    @PostMapping
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MaintenanceAssignment> createAssignment(
            @RequestBody MaintenanceAssignment assignment) {

        MaintenanceAssignment createdAssignment =
                assignmentService.createAssignment(assignment);

        return new ResponseEntity<>(
                createdAssignment,
                HttpStatus.CREATED);
    }

    // =========================================================
    // GET ALL ASSIGNMENTS
    // PROPERTY MANAGER / PROPERTY OWNER / SUPER ADMIN
    // =========================================================

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<List<MaintenanceAssignment>>
            getAllAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllAssignments());
    }

    // =========================================================
    // GET ASSIGNMENT BY ID
    // PROPERTY MANAGER / PROPERTY OWNER / SUPER ADMIN
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MaintenanceAssignment> getAssignmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(id));
    }

    // =========================================================
    // UPDATE ASSIGNMENT
    // PROPERTY MANAGER / PROPERTY OWNER / SUPER ADMIN
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<MaintenanceAssignment> updateAssignment(
            @PathVariable Long id,
            @RequestBody MaintenanceAssignment assignment) {

        return ResponseEntity.ok(
                assignmentService.updateAssignment(
                        id,
                        assignment));
    }

    // =========================================================
    // DELETE ASSIGNMENT
    // PROPERTY MANAGER / PROPERTY OWNER / SUPER ADMIN
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('PROPERTY_MANAGER', 'PROPERTY_OWNER', 'SUPER_ADMIN')"
    )
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id) {

        assignmentService.deleteAssignment(id);

        return ResponseEntity.noContent().build();
    }
}