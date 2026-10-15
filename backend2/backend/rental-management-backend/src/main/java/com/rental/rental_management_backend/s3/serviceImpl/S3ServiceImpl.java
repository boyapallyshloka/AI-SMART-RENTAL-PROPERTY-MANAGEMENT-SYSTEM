package com.rental.rental_management_backend.s3.serviceImpl;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import org.springframework.core.io.Resource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.s3.service.S3Service;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public S3ServiceImpl(
            S3Client s3Client,
            S3Presigner s3Presigner) {

        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    @Override
    public String uploadFile(MultipartFile file) {

        return uploadFile(file, "images");
    }

    @Override
    public String uploadFile(
            MultipartFile file,
            String folder) {

        try {

            String fileName =
                    UUID.randomUUID()
                            + "_"
                            + file.getOriginalFilename();

            String fileKey =
                    folder + "/" + fileName;

            PutObjectRequest putObjectRequest =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileKey)
                            .contentType(file.getContentType())
                            .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromBytes(file.getBytes())
            );

            return fileKey;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload file to S3",
                    e
            );
        }
    }

    @Override
    public String uploadBytes(
            byte[] data,
            String fileName,
            String contentType,
            String folder) {

        String uniqueFileName =
                UUID.randomUUID()
                        + "_"
                        + fileName;

        String fileKey =
                folder + "/" + uniqueFileName;

        PutObjectRequest putObjectRequest =
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .contentType(contentType)
                        .build();

        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromBytes(data)
        );

        return fileKey;
    }

    @Override
    public String generatePresignedUrl(
            String fileKey) {

        GetObjectRequest getObjectRequest =
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(
                                Duration.ofMinutes(10)
                        )
                        .getObjectRequest(getObjectRequest)
                        .build();

        return s3Presigner
                .presignGetObject(presignRequest)
                .url()
                .toString();
    }

    @Override
    public void deleteFile(String fileKey) {

        DeleteObjectRequest deleteObjectRequest =
                DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .build();

        s3Client.deleteObject(deleteObjectRequest);
    }
    @Override
    public Resource downloadFile(String fileKey) {

        if (fileKey == null || fileKey.isBlank()) {
            throw new IllegalArgumentException(
                    "S3 file key is required");
        }

        try {

            GetObjectRequest getObjectRequest =
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileKey)
                            .build();

            ResponseBytes<GetObjectResponse> objectBytes =
                    s3Client.getObjectAsBytes(
                            getObjectRequest);

            return new ByteArrayResource(
                    objectBytes.asByteArray());

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to download file from S3",
                    e);
        }
    }
}