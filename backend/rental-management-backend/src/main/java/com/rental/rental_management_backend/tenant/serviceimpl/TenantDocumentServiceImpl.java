package com.rental.rental_management_backend.tenant.serviceimpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.tenant.dto.TenantDocumentResponse;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.entity.TenantDocument;
import com.rental.rental_management_backend.tenant.enums.DocumentVerificationStatus;
import com.rental.rental_management_backend.tenant.enums.TenantDocumentType;
import com.rental.rental_management_backend.tenant.repository.TenantDocumentRepository;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;
import com.rental.rental_management_backend.tenant.service.TenantDocumentService;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TenantDocumentServiceImpl implements TenantDocumentService {

    private final TenantDocumentRepository tenantDocumentRepository;

    private final TenantRepository tenantRepository;

    private final UserRepository userRepository;

    @Value("${app.tenant-document.upload-dir:uploads/tenant-documents}")
    private String uploadDir;

    public TenantDocumentServiceImpl(
            TenantDocumentRepository tenantDocumentRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository) {

        this.tenantDocumentRepository =
                tenantDocumentRepository;

        this.tenantRepository =
                tenantRepository;

        this.userRepository =
                userRepository;
    }

    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    @Override
    public TenantDocumentResponse uploadDocument(
            String email,
            MultipartFile file,
            TenantDocumentType documentType) {

        validateFile(file);

        if (documentType == null) {
            throw new RuntimeException(
                    "Document type is required");
        }

        User user =
                getAuthenticatedTenantUser(email);

        Tenant tenant =
                tenantRepository
                        .findByUser(user)
                        .orElseGet(() ->
                                createEmptyTenantProfile(user));

        /*
         * Save physical file.
         */
        String documentUrl =
                saveFile(
                        file,
                        tenant.getTenantId());

        TenantDocument document =
                new TenantDocument();

        document.setTenant(tenant);

        document.setDocumentType(
                documentType);

        /*
         * Original uploaded file name.
         */
        document.setFileName(
                file.getOriginalFilename());

        /*
         * Store relative URL only.
         */
        document.setDocumentUrl(
                documentUrl);

        /*
         * New documents always start as PENDING.
         */
        document.setVerificationStatus(
                DocumentVerificationStatus.PENDING);

        /*
         * Explicitly set timestamps.
         *
         * This fixes the PostgreSQL error:
         * null value in column "uploaded_at"
         */
        LocalDateTime now =
                LocalDateTime.now();

        document.setUploadedAt(now);
        document.setUpdatedAt(now);

        /*
         * Save document.
         */
        TenantDocument savedDocument =
                tenantDocumentRepository.save(document);

        return mapToResponse(savedDocument);
    }

    // =========================================================
    // GET MY DOCUMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TenantDocumentResponse> getMyDocuments(
            String email) {

        User user =
                getAuthenticatedTenantUser(email);

        Tenant tenant =
                tenantRepository
                        .findByUser(user)
                        .orElseGet(() ->
                                createEmptyTenantProfile(user));

        return tenantDocumentRepository
                .findByTenant(tenant)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET MY DOCUMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public TenantDocumentResponse getMyDocument(
            String email,
            Long documentId) {

        User user =
                getAuthenticatedTenantUser(email);

        Tenant tenant =
                tenantRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant profile not found"));

        TenantDocument document =
                tenantDocumentRepository
                        .findByDocumentIdAndTenant(
                                documentId,
                                tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Document not found or you are not authorized"));

        return mapToResponse(document);
    }

    // =========================================================
    // DELETE MY DOCUMENT
    // =========================================================

    @Override
    public void deleteMyDocument(
            String email,
            Long documentId) {

        User user =
                getAuthenticatedTenantUser(email);

        Tenant tenant =
                tenantRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant profile not found"));

        TenantDocument document =
                tenantDocumentRepository
                        .findByDocumentIdAndTenant(
                                documentId,
                                tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Document not found or you are not authorized"));

        /*
         * Delete physical file.
         */
        deletePhysicalFile(
                document.getDocumentUrl());

        /*
         * Delete database record.
         */
        tenantDocumentRepository.delete(document);
    }

    // =========================================================
    // SUPER ADMIN - GET TENANT DOCUMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TenantDocumentResponse> getTenantDocuments(
            Long tenantId) {

        Tenant tenant =
                tenantRepository
                        .findById(tenantId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant not found with ID: "
                                                + tenantId));

        return tenantDocumentRepository
                .findByTenant(tenant)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // SUPER ADMIN - VERIFY / REJECT
    // =========================================================

    @Override
    public TenantDocumentResponse updateVerificationStatus(
            Long tenantId,
            Long documentId,
            DocumentVerificationStatus status) {

        if (status == null) {
            throw new RuntimeException(
                    "Verification status is required");
        }

        Tenant tenant =
                tenantRepository
                        .findById(tenantId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tenant not found with ID: "
                                                + tenantId));

        TenantDocument document =
                tenantDocumentRepository
                        .findByDocumentIdAndTenant(
                                documentId,
                                tenant)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Document not found for this tenant"));

        document.setVerificationStatus(status);

        /*
         * Explicitly update timestamp.
         */
        document.setUpdatedAt(
                LocalDateTime.now());

        TenantDocument updatedDocument =
                tenantDocumentRepository.save(document);

        return mapToResponse(updatedDocument);
    }

    // =========================================================
    // SAVE FILE
    // =========================================================

    private String saveFile(
            MultipartFile file,
            Long tenantId) {

        try {

            String originalFilename =
                    file.getOriginalFilename();

            String extension = "";

            if (originalFilename != null
                    && originalFilename.contains(".")) {

                extension =
                        originalFilename.substring(
                                originalFilename.lastIndexOf("."));
            }

            String uniqueFilename =
                    UUID.randomUUID()
                            + extension;

            /*
             * Physical folder:
             *
             * uploads/
             *     tenant-documents/
             *         tenantId/
             *             uuid.png
             */
            Path tenantDirectory =
                    Paths.get(uploadDir)
                            .toAbsolutePath()
                            .normalize()
                            .resolve(
                                    String.valueOf(tenantId));

            Files.createDirectories(
                    tenantDirectory);

            Path targetLocation =
                    tenantDirectory
                            .resolve(uniqueFilename);

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING);

            /*
             * Store relative path in PostgreSQL.
             */
            return "/uploads/tenant-documents/"
                    + tenantId
                    + "/"
                    + uniqueFilename;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to store tenant document file",
                    e);
        }
    }

    // =========================================================
    // DELETE PHYSICAL FILE
    // =========================================================

    private void deletePhysicalFile(
            String documentUrl) {

        if (documentUrl == null
                || documentUrl.isBlank()) {

            return;
        }

        try {

            String prefix =
                    "/uploads/tenant-documents/";

            if (!documentUrl.startsWith(prefix)) {
                return;
            }

            String relativePath =
                    documentUrl.substring(1);

            Path filePath =
                    Paths.get(relativePath)
                            .toAbsolutePath()
                            .normalize();

            Files.deleteIfExists(filePath);

        } catch (IOException e) {

            System.err.println(
                    "Could not delete tenant document file: "
                            + e.getMessage());
        }
    }

    // =========================================================
    // VALIDATE FILE
    // =========================================================

    private void validateFile(
            MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Please select a document file");
        }

        /*
         * Maximum 10 MB.
         */
        long maxSize =
                10 * 1024 * 1024;

        if (file.getSize() > maxSize) {

            throw new RuntimeException(
                    "Document size must not exceed 10 MB");
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !(contentType.equalsIgnoreCase(
                            "application/pdf")
                || contentType.equalsIgnoreCase(
                            "image/jpeg")
                || contentType.equalsIgnoreCase(
                            "image/png"))) {

            throw new RuntimeException(
                    "Only PDF, JPG, JPEG and PNG documents are allowed");
        }

        String originalFilename =
                file.getOriginalFilename();

        if (originalFilename == null
                || !hasAllowedExtension(
                        originalFilename)) {

            throw new RuntimeException(
                    "Only PDF, JPG, JPEG and PNG documents are allowed");
        }
    }

    // =========================================================
    // FILE EXTENSION VALIDATION
    // =========================================================

    private boolean hasAllowedExtension(
            String filename) {

        String lowerCaseFilename =
                filename.toLowerCase();

        return lowerCaseFilename.endsWith(".pdf")
                || lowerCaseFilename.endsWith(".jpg")
                || lowerCaseFilename.endsWith(".jpeg")
                || lowerCaseFilename.endsWith(".png");
    }

    // =========================================================
    // GET AUTHENTICATED TENANT
    // =========================================================

    private User getAuthenticatedTenantUser(
            String email) {

        if (email == null
                || email.isBlank()) {

            throw new RuntimeException(
                    "Authenticated user email not found");
        }

        User user =
                userRepository
                        .findByEmail(
                                email.trim().toLowerCase())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Authenticated user not found"));

        if (user.getRole() != RoleType.TENANT) {

            throw new RuntimeException(
                    "Only TENANT users can access their documents");
        }

        return user;
    }

    // =========================================================
    // CREATE EMPTY TENANT PROFILE
    // =========================================================

    private Tenant createEmptyTenantProfile(
            User user) {

        Tenant tenant =
                new Tenant();

        tenant.setUser(user);

        return tenantRepository.save(tenant);
    }

    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private TenantDocumentResponse mapToResponse(
            TenantDocument document) {

        Tenant tenant =
                document.getTenant();

        TenantDocumentResponse response =
                new TenantDocumentResponse();

        response.setDocumentId(
                document.getDocumentId());

        response.setTenantId(
                tenant.getTenantId());

        response.setUserId(
                tenant.getUser().getId());

        response.setDocumentType(
                document.getDocumentType());

        response.setFileName(
                document.getFileName());

        response.setDocumentUrl(
                document.getDocumentUrl());

        response.setVerificationStatus(
                document.getVerificationStatus());

        response.setUploadedAt(
                document.getUploadedAt());

        response.setUpdatedAt(
                document.getUpdatedAt());

        return response;
    }
}