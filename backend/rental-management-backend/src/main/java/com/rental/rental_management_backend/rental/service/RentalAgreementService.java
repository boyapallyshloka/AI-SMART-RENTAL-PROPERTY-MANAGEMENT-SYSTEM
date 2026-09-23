package com.rental.rental_management_backend.rental.service;

import java.time.LocalDate;
import java.util.List;

import com.rental.rental_management_backend.rental.dto.RentalAgreementRequest;
import com.rental.rental_management_backend.rental.dto.RentalAgreementResponse;
import com.rental.rental_management_backend.rental.enums.AgreementStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

public interface RentalAgreementService {

    RentalAgreementResponse createAgreement(
            RentalAgreementRequest request,
            String email);

    RentalAgreementResponse getAgreement(
            Long agreementId,
            String email);

    List<RentalAgreementResponse> getMyAgreements(
            String email);

    List<RentalAgreementResponse> getAllAgreements(
            String email);

    RentalAgreementResponse updateStatus(
            Long agreementId,
            AgreementStatus status,
            String email);

    RentalAgreementResponse updateMoveOutDate(
            Long agreementId,
            LocalDate moveOutDate,
            String email);
    RentalAgreementResponse uploadAgreementDocument(
            Long agreementId,
            MultipartFile file,
            String email);
    Resource getAgreementDocument(
            Long agreementId,
            String email);
}