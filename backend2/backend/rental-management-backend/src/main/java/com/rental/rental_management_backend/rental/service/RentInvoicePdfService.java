package com.rental.rental_management_backend.rental.service;

import com.rental.rental_management_backend.rental.entity.RentInvoice;

public interface RentInvoicePdfService {

    String generateInvoicePdf(RentInvoice invoice);
}