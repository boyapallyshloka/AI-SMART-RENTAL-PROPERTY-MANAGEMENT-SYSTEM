
package com.rental.rental_management_backend.rental.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.rental.entity.RentInvoice;

@Repository
public interface RentInvoiceRepository extends JpaRepository<RentInvoice, Long> {

    Optional<RentInvoice> findByRentalAgreement_AgreementIdAndBillingMonthAndBillingYear(
            Long agreementId,
            Integer billingMonth,
            Integer billingYear
    );

    List<RentInvoice> findByTenantId(Long tenantId);
}
