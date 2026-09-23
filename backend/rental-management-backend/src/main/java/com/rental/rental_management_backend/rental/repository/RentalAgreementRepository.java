package com.rental.rental_management_backend.rental.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.rental_management_backend.rental.entity.RentalAgreement;
import com.rental.rental_management_backend.rental.enums.AgreementStatus;

@Repository
public interface RentalAgreementRepository
        extends JpaRepository<RentalAgreement, Long> {

    Optional<RentalAgreement>
    findByRentalApplication_ApplicationId(Long applicationId);

    List<RentalAgreement>
    findByTenant_User_Email(String email);

    boolean
    existsByRentalApplication_ApplicationId(Long applicationId);

    boolean
    existsByUnit_UnitIdAndStatus(
            Long unitId,
            AgreementStatus status);
}