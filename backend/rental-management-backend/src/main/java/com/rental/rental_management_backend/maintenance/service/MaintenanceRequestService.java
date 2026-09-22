
package com.rental.rental_management_backend.maintenance.service;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestRequest;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceRequestResponse;
import com.rental.rental_management_backend.maintenance.dto.MaintenanceStatusUpdateRequest;

public interface MaintenanceRequestService {

    // Create maintenance request + optional image
    MaintenanceRequestResponse createRequest(
            MaintenanceRequestRequest request,
            MultipartFile image) throws IOException;

    // Get all maintenance requests
    List<MaintenanceRequestResponse> getAllRequests();

    // Get maintenance request by ID
    MaintenanceRequestResponse getRequestById(
            Long requestId);

    // Update maintenance request + optional image
    MaintenanceRequestResponse updateRequest(
            Long requestId,
            MaintenanceRequestRequest request,
            MultipartFile image) throws IOException;

    // Delete maintenance request
    void deleteRequest(Long requestId);

    // Update only maintenance ticket status
    MaintenanceRequestResponse updateStatus(
            Long ticketId,
            MaintenanceStatusUpdateRequest request);
}

