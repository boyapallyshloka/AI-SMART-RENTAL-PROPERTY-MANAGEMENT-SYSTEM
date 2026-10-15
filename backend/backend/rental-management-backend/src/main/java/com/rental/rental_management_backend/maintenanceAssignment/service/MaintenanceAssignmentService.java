package com.rental.rental_management_backend.maintenanceAssignment.service;

import java.util.List;

import com.rental.rental_management_backend.maintenanceAssignment.entity.MaintenanceAssignment;

public interface MaintenanceAssignmentService {

    MaintenanceAssignment createAssignment(
            MaintenanceAssignment assignment);

    List<MaintenanceAssignment> getAllAssignments();

    MaintenanceAssignment getAssignmentById(Long id);

    MaintenanceAssignment updateAssignment(
            Long id,
            MaintenanceAssignment assignment);

    void deleteAssignment(Long id);
}