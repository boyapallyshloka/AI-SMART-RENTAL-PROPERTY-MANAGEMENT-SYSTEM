package com.rental.rental_management_backend.s3.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface S3Service {

    String uploadFile(MultipartFile file);

    String uploadFile(
            MultipartFile file,
            String folder);

    String uploadBytes(
            byte[] data,
            String fileName,
            String contentType,
            String folder);

    String generatePresignedUrl(
            String fileKey);

    Resource downloadFile(
            String fileKey);

    void deleteFile(
            String fileKey);
}