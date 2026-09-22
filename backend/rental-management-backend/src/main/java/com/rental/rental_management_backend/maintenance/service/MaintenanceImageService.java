package com.rental.rental_management_backend.maintenance.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MaintenanceImageService {

    private final Path uploadDirectory =
            Paths.get("uploads/maintenance");

    public String saveImage(MultipartFile image) throws IOException {

        // If no image is uploaded
        if (image == null || image.isEmpty()) {
            return null;
        }

        // Create the upload folder if it does not exist
        Files.createDirectories(uploadDirectory);

        // Get the original file name
        String originalFileName = image.getOriginalFilename();

        // Get file extension
        String extension = "";

        if (originalFileName != null &&
                originalFileName.contains(".")) {

            extension = originalFileName.substring(
                    originalFileName.lastIndexOf("."));
        }

        // Create a unique file name
        String fileName =
                UUID.randomUUID().toString() + extension;

        // Create the complete file path
        Path filePath =
                uploadDirectory.resolve(fileName);

        // Save the uploaded image
        Files.copy(
                image.getInputStream(),
                filePath
        );

        // Return the URL that will be stored in the database
        return "/uploads/maintenance/" + fileName;
    }
}