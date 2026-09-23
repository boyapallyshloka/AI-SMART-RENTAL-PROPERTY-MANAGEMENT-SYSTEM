package com.rental.rental_management_backend.maintenanceAssignment.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.maintenanceAssignment.entity.MaintenanceAssignment;
import com.rental.rental_management_backend.maintenanceAssignment.repository.MaintenanceAssignmentRepository;

@Service
public class MaintenanceAssignmentServiceImpl
        implements MaintenanceAssignmentService {

    private final MaintenanceAssignmentRepository assignmentRepository;

    private final UserRepository userRepository;

    public MaintenanceAssignmentServiceImpl(
            MaintenanceAssignmentRepository assignmentRepository,
            UserRepository userRepository) {

        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE ASSIGNMENT
    //
    // assignedBy is automatically taken from the
    // currently logged-in user's ID.
    // =========================================================

    @Override
    public MaintenanceAssignment createAssignment(
            MaintenanceAssignment assignment) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof UserDetails)) {

            throw new AccessDeniedException(
                    "Unable to identify logged-in user");
        }

        UserDetails userDetails =
                (UserDetails) principal;

        // JWT username is the user's email
        String email =
                userDetails.getUsername();

        // Find the actual User from database
        User loggedInUser =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Logged-in user not found"));

        // Automatically set assignedBy
        //
        // Do NOT trust assignedBy sent from Swagger.
        assignment.setAssignedBy(
                loggedInUser.getId());

        return assignmentRepository.save(assignment);
    }

    // =========================================================
    // GET ALL ASSIGNMENTS
    // =========================================================

    @Override
    public List<MaintenanceAssignment> getAllAssignments() {

        return assignmentRepository.findAll();
    }

    // =========================================================
    // GET ASSIGNMENT BY ID
    // =========================================================

    @Override
    public MaintenanceAssignment getAssignmentById(
            Long id) {

        return assignmentRepository
                .findAssignmentWithDetails(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Maintenance Assignment not found with id: "
                                        + id));
    }

    // =========================================================
    // UPDATE ASSIGNMENT
    //
    // assignedBy is NOT changed.
    //
    // It remains the ID of the user who originally
    // created the assignment.
    // =========================================================

    @Override
    public MaintenanceAssignment updateAssignment(
            Long id,
            MaintenanceAssignment assignment) {

        MaintenanceAssignment existingAssignment =
                assignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Maintenance Assignment not found with id: "
                                                + id));

        existingAssignment.setMaintenanceRequest(
                assignment.getMaintenanceRequest());

        existingAssignment.setWorker(
                assignment.getWorker());

        // Do NOT update assignedBy from the request.
        // The original assignedBy value is preserved.

        existingAssignment.setAssignedAt(
                assignment.getAssignedAt());

        existingAssignment.setEstimatedCompletionDate(
                assignment.getEstimatedCompletionDate());

        existingAssignment.setActualCompletionDate(
                assignment.getActualCompletionDate());

        existingAssignment.setStatus(
                assignment.getStatus());

        existingAssignment.setNotes(
                assignment.getNotes());

        return assignmentRepository.save(
                existingAssignment);
    }

    // =========================================================
    // DELETE ASSIGNMENT
    // =========================================================

    @Override
    public void deleteAssignment(Long id) {

        MaintenanceAssignment assignment =
                assignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Maintenance Assignment not found with id: "
                                                + id));

        assignmentRepository.delete(assignment);
    }
}