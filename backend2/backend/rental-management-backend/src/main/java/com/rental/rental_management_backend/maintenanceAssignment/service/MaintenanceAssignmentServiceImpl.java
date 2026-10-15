
package com.rental.rental_management_backend.maintenanceAssignment.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;

import com.rental.rental_management_backend.maintenance.entity.MaintenanceRequest;
import com.rental.rental_management_backend.maintenance.repository.MaintenanceRequestRepository;

import com.rental.rental_management_backend.maintenanceAssignment.entity.MaintenanceAssignment;
import com.rental.rental_management_backend.maintenanceAssignment.repository.MaintenanceAssignmentRepository;

import com.rental.rental_management_backend.notification.enums.NotificationPriority;
import com.rental.rental_management_backend.notification.enums.NotificationType;
import com.rental.rental_management_backend.notification.service.NotificationService;

@Service
@Transactional
public class MaintenanceAssignmentServiceImpl
        implements MaintenanceAssignmentService {

    // =========================================================
    // REPOSITORIES / SERVICES
    // =========================================================

    private final MaintenanceAssignmentRepository assignmentRepository;

    private final MaintenanceRequestRepository maintenanceRequestRepository;

    private final UserRepository userRepository;

    private final NotificationService notificationService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public MaintenanceAssignmentServiceImpl(
            MaintenanceAssignmentRepository assignmentRepository,
            MaintenanceRequestRepository maintenanceRequestRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.assignmentRepository = assignmentRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE ASSIGNMENT
    // =========================================================

    @Override
    public MaintenanceAssignment createAssignment(
            MaintenanceAssignment assignment) {

        // -----------------------------------------------------
        // GET AUTHENTICATION
        // -----------------------------------------------------

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "User is not authenticated");
        }

        // -----------------------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------------------

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof UserDetails)) {

            throw new AccessDeniedException(
                    "Unable to identify logged-in user");
        }

        UserDetails userDetails =
                (UserDetails) principal;

        String email =
                userDetails.getUsername();

        // -----------------------------------------------------
        // FIND USER FROM DATABASE
        // -----------------------------------------------------

        User loggedInUser =
                userRepository
                        .findByEmail(
                                email.toLowerCase().trim())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Logged-in user not found"));

        // -----------------------------------------------------
        // AUTOMATICALLY SET ASSIGNED BY
        // -----------------------------------------------------

        // Do NOT trust assignedBy sent from Swagger.
        assignment.setAssignedBy(
                loggedInUser.getId());

        // -----------------------------------------------------
        // SAVE ASSIGNMENT
        // -----------------------------------------------------

        MaintenanceAssignment savedAssignment =
                assignmentRepository.save(assignment);

        System.out.println(
                "==================================================");

        System.out.println(
                "MAINTENANCE ASSIGNMENT CREATED");

        System.out.println(
                "Assignment ID: "
                        + savedAssignment.getId());

        System.out.println(
                "Assigned By User ID: "
                        + savedAssignment.getAssignedBy());

        System.out.println(
                "==================================================");

        // -----------------------------------------------------
        // SEND NOTIFICATION TO TENANT
        // -----------------------------------------------------

        notifyTenantAboutMaintenanceAssignment(
                savedAssignment);

        return savedAssignment;
    }

    // =========================================================
    // GET ALL ASSIGNMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceAssignment> getAllAssignments() {

        return assignmentRepository.findAll();
    }

    // =========================================================
    // GET ASSIGNMENT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
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
    // =========================================================

    @Override
    public MaintenanceAssignment updateAssignment(
            Long id,
            MaintenanceAssignment assignment) {

        // -----------------------------------------------------
        // FIND EXISTING ASSIGNMENT
        // -----------------------------------------------------

        MaintenanceAssignment existingAssignment =
                assignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Maintenance Assignment not found with id: "
                                                + id));

        // -----------------------------------------------------
        // CHECK WHETHER WORKER CHANGED
        // -----------------------------------------------------

        boolean workerChanged =
                existingAssignment.getWorker() == null
                        && assignment.getWorker() != null;

        if (existingAssignment.getWorker() != null
                && assignment.getWorker() != null) {

            Long oldWorkerId =
                    existingAssignment
                            .getWorker()
                            .getWorkerId();

            Long newWorkerId =
                    assignment
                            .getWorker()
                            .getWorkerId();

            workerChanged =
                    oldWorkerId == null
                            ? newWorkerId != null
                            : !oldWorkerId.equals(newWorkerId);
        }

        // -----------------------------------------------------
        // UPDATE ASSIGNMENT DETAILS
        // -----------------------------------------------------

        existingAssignment.setMaintenanceRequest(
                assignment.getMaintenanceRequest());

        existingAssignment.setWorker(
                assignment.getWorker());

        // DO NOT UPDATE assignedBy.
        // Original assignedBy is preserved.

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

        // -----------------------------------------------------
        // SAVE UPDATED ASSIGNMENT
        // -----------------------------------------------------

        MaintenanceAssignment updatedAssignment =
                assignmentRepository.save(
                        existingAssignment);

        // -----------------------------------------------------
        // NOTIFY TENANT IF WORKER WAS CHANGED
        // -----------------------------------------------------

        if (workerChanged) {

            notifyTenantAboutMaintenanceAssignment(
                    updatedAssignment);
        }

        return updatedAssignment;
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

    // =========================================================
    // NOTIFICATION
    // MAINTENANCE ASSIGNED
    //
    // RECIPIENT:
    // TENANT
    // =========================================================

    private void notifyTenantAboutMaintenanceAssignment(
            MaintenanceAssignment assignment) {

        System.out.println();
        System.out.println(
                "==================================================");
        System.out.println(
                "MAINTENANCE ASSIGNMENT NOTIFICATION DEBUG");
        System.out.println(
                "==================================================");

        // -----------------------------------------------------
        // VALIDATE ASSIGNMENT
        // -----------------------------------------------------

        if (assignment == null) {

            System.out.println(
                    "DEBUG: assignment = NULL");

            return;
        }

        System.out.println(
                "DEBUG: assignment ID = "
                        + assignment.getId());

        // -----------------------------------------------------
        // GET MAINTENANCE REQUEST ID
        // -----------------------------------------------------

        if (assignment.getMaintenanceRequest() == null) {

            System.out.println(
                    "DEBUG: assignment.getMaintenanceRequest() = NULL");

            return;
        }

        Long requestId =
                assignment
                        .getMaintenanceRequest()
                        .getRequestId();

        System.out.println(
                "DEBUG: maintenanceRequest ID = "
                        + requestId);

        if (requestId == null) {

            System.out.println(
                    "DEBUG: maintenanceRequest ID = NULL");

            return;
        }

        // -----------------------------------------------------
        // EXPLICITLY LOAD MAINTENANCE REQUEST FROM DATABASE
        // -----------------------------------------------------

        MaintenanceRequest maintenanceRequest =
                maintenanceRequestRepository
                        .findById(requestId)
                        .orElse(null);

        if (maintenanceRequest == null) {

            System.out.println(
                    "DEBUG: MaintenanceRequest NOT FOUND");

            return;
        }

        System.out.println(
                "DEBUG: MaintenanceRequest loaded successfully");

        // -----------------------------------------------------
        // GET TENANT
        // -----------------------------------------------------

        if (maintenanceRequest.getTenant() == null) {

            System.out.println(
                    "DEBUG: tenant = NULL");

            return;
        }

        Long tenantId =
                maintenanceRequest
                        .getTenant()
                        .getTenantId();

        System.out.println(
                "DEBUG: tenant ID = "
                        + tenantId);

        // -----------------------------------------------------
        // GET TENANT USER
        // -----------------------------------------------------

        if (maintenanceRequest.getTenant().getUser() == null) {

            System.out.println(
                    "DEBUG: tenant.user = NULL");

            return;
        }

        Long tenantUserId =
                maintenanceRequest
                        .getTenant()
                        .getUser()
                        .getId();

        System.out.println(
                "DEBUG: tenant user ID = "
                        + tenantUserId);

        System.out.println(
                "DEBUG: tenant user email = "
                        + maintenanceRequest
                                .getTenant()
                                .getUser()
                                .getEmail());

        // -----------------------------------------------------
        // VALIDATE TENANT USER ID
        // -----------------------------------------------------

        if (tenantUserId == null) {

            System.out.println(
                    "DEBUG: tenantUserId = NULL");

            return;
        }

        // -----------------------------------------------------
        // SEND NOTIFICATION
        // -----------------------------------------------------

        System.out.println(
                "DEBUG: Sending MAINTENANCE_ASSIGNED "
                        + "notification to user ID = "
                        + tenantUserId);

        notificationService.notifyUser(
                tenantUserId,
                NotificationType.MAINTENANCE_ASSIGNED,
                NotificationPriority.MEDIUM,
                "Maintenance Assigned",
                "A maintenance worker has been assigned "
                        + "to your maintenance request.",
                requestId,
                "MAINTENANCE"
        );

        System.out.println(
                "DEBUG: MAINTENANCE_ASSIGNED notification "
                        + "sent successfully to user ID = "
                        + tenantUserId);

        System.out.println(
                "==================================================");
    }
}

