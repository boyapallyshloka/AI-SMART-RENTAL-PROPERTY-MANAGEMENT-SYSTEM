package com.rental.rental_management_backend.rental.service;

import com.rental.rental_management_backend.rental.entity.RentalAgreement;

public interface RentalAgreementPdfService {

    String generateAgreementPdf(RentalAgreement agreement);
}