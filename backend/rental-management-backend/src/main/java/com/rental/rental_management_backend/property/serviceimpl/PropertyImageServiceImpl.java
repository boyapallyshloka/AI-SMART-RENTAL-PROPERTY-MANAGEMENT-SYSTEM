package com.rental.rental_management_backend.property.serviceimpl;



import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
import com.rental.rental_management_backend.property.dto.PropertyImageResponse;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyImage;
import com.rental.rental_management_backend.property.repository.PropertyImageRepository;
import com.rental.rental_management_backend.property.repository.PropertyRepository;
import com.rental.rental_management_backend.property.service.PropertyImageService;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PropertyImageServiceImpl implements PropertyImageService {

    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads/property-images}")
    private String uploadDir;

    public PropertyImageServiceImpl(
            PropertyImageRepository propertyImageRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.propertyImageRepository = propertyImageRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // ADD IMAGE
    // =========================================================

    @Override
    public PropertyImageResponse addImage(
            Long propertyId,
            MultipartFile file,
            String imageType,
            Boolean isPrimary) {

        validateFile(file);

        User owner = getAuthenticatedUser();

        Property property = propertyRepository
                .findByPropertyIdAndOwner(propertyId, owner)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found or you are not the owner"));

        String imageUrl = saveFile(file, propertyId);

        /*
         * If this image is primary,
         * remove primary status from existing images.
         */
        if (Boolean.TRUE.equals(isPrimary)) {

            List<PropertyImage> existingImages =
                    propertyImageRepository.findByProperty(property);

            for (PropertyImage image : existingImages) {
                image.setIsPrimary(false);
            }

            propertyImageRepository.saveAll(existingImages);
        }

        PropertyImage image = new PropertyImage();

        image.setImageUrl(imageUrl);
        image.setImageType(imageType);
        image.setIsPrimary(
                Boolean.TRUE.equals(isPrimary)
        );
        image.setProperty(property);

        PropertyImage savedImage =
                propertyImageRepository.save(image);

        return mapToResponse(savedImage);
    }

    // =========================================================
    // GET ALL IMAGES FOR PROPERTY
    // =========================================================

    @Override
    public List<PropertyImageResponse> getImagesByProperty(
            Long propertyId) {

        User owner = getAuthenticatedUser();

        Property property = propertyRepository
                .findByPropertyIdAndOwner(propertyId, owner)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found or you are not the owner"));

        return propertyImageRepository
                .findByProperty(property)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET IMAGE BY ID
    // =========================================================

    @Override
    public PropertyImageResponse getImageById(Long imageId) {

        User owner = getAuthenticatedUser();

        PropertyImage image = propertyImageRepository
                .findById(imageId)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        validateOwnership(image.getProperty(), owner);

        return mapToResponse(image);
    }

    // =========================================================
    // UPDATE IMAGE
    // =========================================================

    @Override
    public PropertyImageResponse updateImage(
            Long imageId,
            MultipartFile file,
            String imageType,
            Boolean isPrimary) {

        User owner = getAuthenticatedUser();

        PropertyImage image = propertyImageRepository
                .findById(imageId)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        Property property = image.getProperty();

        validateOwnership(property, owner);

        /*
         * Replace existing file if a new file is provided.
         */
        if (file != null && !file.isEmpty()) {

            validateFile(file);

            deletePhysicalFile(image.getImageUrl());

            String newImageUrl =
                    saveFile(file, property.getPropertyId());

            image.setImageUrl(newImageUrl);
        }

        if (imageType != null && !imageType.isBlank()) {
            image.setImageType(imageType);
        }

        /*
         * Make this image primary.
         */
        if (Boolean.TRUE.equals(isPrimary)) {

            List<PropertyImage> existingImages =
                    propertyImageRepository.findByProperty(property);

            for (PropertyImage existingImage : existingImages) {
                existingImage.setIsPrimary(false);
            }

            propertyImageRepository.saveAll(existingImages);

            image.setIsPrimary(true);

        } else if (Boolean.FALSE.equals(isPrimary)) {

            image.setIsPrimary(false);
        }

        PropertyImage updatedImage =
                propertyImageRepository.save(image);

        return mapToResponse(updatedImage);
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

    @Override
    public void deleteImage(Long imageId) {

        User owner = getAuthenticatedUser();

        PropertyImage image = propertyImageRepository
                .findById(imageId)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        validateOwnership(image.getProperty(), owner);

        deletePhysicalFile(image.getImageUrl());

        propertyImageRepository.delete(image);
    }

    // =========================================================
    // SAVE FILE
    // =========================================================

    private String saveFile(
            MultipartFile file,
            Long propertyId) {

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
                    UUID.randomUUID() + extension;

            Path propertyDirectory =
                    Paths.get(uploadDir)
                            .toAbsolutePath()
                            .normalize()
                            .resolve(String.valueOf(propertyId));

            Files.createDirectories(propertyDirectory);

            Path targetLocation =
                    propertyDirectory.resolve(uniqueFilename);

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING);

            /*
             * This value is stored in PostgreSQL.
             */
            return "/uploads/property-images/"
                    + propertyId
                    + "/"
                    + uniqueFilename;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to store image file", e);
        }
    }

    // =========================================================
    // DELETE PHYSICAL FILE
    // =========================================================

    private void deletePhysicalFile(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        try {

            String prefix =
                    "/uploads/property-images/";

            if (!imageUrl.startsWith(prefix)) {
                return;
            }

            String relativePath =
                    imageUrl.substring(1);

            Path filePath =
                    Paths.get(relativePath)
                            .toAbsolutePath()
                            .normalize();

            Files.deleteIfExists(filePath);

        } catch (IOException e) {

            System.err.println(
                    "Could not delete image file: "
                            + e.getMessage());
        }
    }

    // =========================================================
    // VALIDATE FILE
    // =========================================================

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Please select an image file");
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !(contentType.equalsIgnoreCase("image/jpeg")
                || contentType.equalsIgnoreCase("image/png")
                || contentType.equalsIgnoreCase("image/jpg")
                || contentType.equalsIgnoreCase("image/webp"))) {

            throw new RuntimeException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed");
        }

        /*
         * Maximum 5 MB.
         */
        long maxSize =
                5 * 1024 * 1024;

        if (file.getSize() > maxSize) {

            throw new RuntimeException(
                    "Image size must not exceed 5 MB");
        }
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));
    }

    // =========================================================
    // OWNERSHIP VALIDATION
    // =========================================================

    private void validateOwnership(
            Property property,
            User owner) {

        if (property == null
                || property.getOwner() == null
                || !property.getOwner()
                        .getId()
                        .equals(owner.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this image");
        }
    }

    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private PropertyImageResponse mapToResponse(
            PropertyImage image) {

        Property property =
                image.getProperty();

        PropertyImageResponse response =
                new PropertyImageResponse();

        response.setImageId(
                image.getImageId());

        response.setImageUrl(
                image.getImageUrl());

        response.setImageType(
                image.getImageType());

        response.setIsPrimary(
                image.getIsPrimary());

        response.setPropertyId(
                property.getPropertyId());

        response.setPropertyName(
                property.getPropertyName());

        response.setCreatedAt(
                image.getCreatedAt());

        response.setUpdatedAt(
                image.getUpdatedAt());

        return response;
    }
    @Override
    @Transactional(readOnly = true)
    public List<PropertyImageResponse> getPublicImagesByProperty(
            Long propertyId) {

        Property property = propertyRepository
                .findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Property not found with ID: "
                                        + propertyId));

        return propertyImageRepository
                .findByProperty(property)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}