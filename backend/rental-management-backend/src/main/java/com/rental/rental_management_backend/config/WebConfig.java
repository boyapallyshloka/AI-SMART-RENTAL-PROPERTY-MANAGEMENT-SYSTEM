package com.rental.rental_management_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/property-images}")
    private String propertyImageUploadDir;

    @Value("${app.tenant-document.upload-dir:uploads/tenant-documents}")
    private String tenantDocumentUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // =========================================================
        // PROPERTY IMAGES
        // =========================================================

        String propertyImagePath =
                propertyImageUploadDir
                        .replace("\\", "/");

        if (!propertyImagePath.endsWith("/")) {
            propertyImagePath += "/";
        }

        registry.addResourceHandler(
                "/uploads/property-images/**"
        ).addResourceLocations(
                "file:" + propertyImagePath
        );

        // =========================================================
        // TENANT DOCUMENTS
        // =========================================================

        String tenantDocumentPath =
                tenantDocumentUploadDir
                        .replace("\\", "/");

        if (!tenantDocumentPath.endsWith("/")) {
            tenantDocumentPath += "/";
        }

        registry.addResourceHandler(
                "/uploads/tenant-documents/**"
        ).addResourceLocations(
                "file:" + tenantDocumentPath
        );
    }
}