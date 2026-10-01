package com.rental.rental_management_backend.s3.service;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {

    String uploadFile(MultipartFile file);

    String generatePresignedUrl(String fileKey);
}