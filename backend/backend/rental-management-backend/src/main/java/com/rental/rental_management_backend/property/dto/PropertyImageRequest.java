package com.rental.rental_management_backend.property.dto;




import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;

public class PropertyImageRequest {

    @NotNull(message = "Image file is required")
    private MultipartFile file;

    private String imageType;

    private Boolean isPrimary;

    public PropertyImageRequest() {
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
}