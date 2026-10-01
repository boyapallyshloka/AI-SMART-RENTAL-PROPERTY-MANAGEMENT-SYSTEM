package com.rental.rental_management_backend.rental.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.payment.enums.PaymentStatus;
import com.rental.rental_management_backend.payment.repository.PaymentRepository;
import com.rental.rental_management_backend.rental.dto.RentInvoiceRequest;
import com.rental.rental_management_backend.rental.dto.RentInvoiceResponse;
import com.rental.rental_management_backend.rental.entity.RentInvoice;
import com.rental.rental_management_backend.rental.entity.RentalAgreement;
import com.rental.rental_management_backend.rental.enums.AgreementStatus;
import com.rental.rental_management_backend.rental.enums.InvoiceStatus;
import com.rental.rental_management_backend.rental.repository.RentInvoiceRepository;
import com.rental.rental_management_backend.rental.repository.RentalAgreementRepository;
import com.rental.rental_management_backend.rental.service.RentInvoicePdfService;
import com.rental.rental_management_backend.rental.service.RentInvoiceService;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
public class RentInvoiceServiceImpl implements RentInvoiceService {


private final RentInvoiceRepository rentInvoiceRepository;

private final RentalAgreementRepository rentalAgreementRepository;

private final UserRepository userRepository;

private final RentInvoicePdfService rentInvoicePdfService;

private final TenantRepository tenantRepository;

private final PaymentRepository paymentRepository;


public RentInvoiceServiceImpl(
        RentInvoiceRepository rentInvoiceRepository,
        RentalAgreementRepository rentalAgreementRepository,
        UserRepository userRepository,
        RentInvoicePdfService rentInvoicePdfService,
        TenantRepository tenantRepository,
        PaymentRepository paymentRepository) {

    this.rentInvoiceRepository = rentInvoiceRepository;
    this.rentalAgreementRepository = rentalAgreementRepository;
    this.userRepository = userRepository;
    this.rentInvoicePdfService = rentInvoicePdfService;
    this.tenantRepository = tenantRepository;
    this.paymentRepository = paymentRepository;
}


// =========================================================
// CREATE INVOICE
// =========================================================

@Override
public RentInvoiceResponse createInvoice(
        RentInvoiceRequest request) {

    // -----------------------------------------------------
    // 1. Find rental agreement
    // -----------------------------------------------------

    RentalAgreement agreement =
            rentalAgreementRepository
                    .findById(request.getAgreementId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Rental agreement not found"
                            )
                    );


    // -----------------------------------------------------
    // 2. Agreement must be ACTIVE
    // -----------------------------------------------------

    if (agreement.getStatus()
            != AgreementStatus.ACTIVE) {

        throw new RuntimeException(
                "Invoice can only be created for an ACTIVE rental agreement"
        );
    }


    // -----------------------------------------------------
    // 3. Determine next billing month
    // -----------------------------------------------------

    LocalDate billingDate =
            getNextBillingDate(agreement);

    int billingMonth =
            billingDate.getMonthValue();

    int billingYear =
            billingDate.getYear();


    // -----------------------------------------------------
    // 4. Prevent duplicate invoice
    // -----------------------------------------------------

    if (rentInvoiceRepository
            .findByRentalAgreement_AgreementIdAndBillingMonthAndBillingYear(
                    agreement.getAgreementId(),
                    billingMonth,
                    billingYear
            )
            .isPresent()) {

        throw new RuntimeException(
                "Invoice already exists for "
                        + billingMonth
                        + "/"
                        + billingYear
        );
    }


    // -----------------------------------------------------
    // 5. Create invoice entity
    // -----------------------------------------------------

    RentInvoice invoice =
            new RentInvoice();

    invoice.setRentalAgreement(
            agreement
    );

    invoice.setTenantId(
            agreement
                    .getTenant()
                    .getTenantId()
    );

    invoice.setUnitId(
            agreement
                    .getUnit()
                    .getUnitId()
    );

    invoice.setBillingMonth(
            billingMonth
    );

    invoice.setBillingYear(
            billingYear
    );

    invoice.setInvoiceDate(
            LocalDate.now()
    );


    // -----------------------------------------------------
    // 6. Calculate due date
    // -----------------------------------------------------

    int dueDay =
            agreement.getDueDay();

    LocalDate dueDate;

    int lastDayOfMonth =
            billingDate.lengthOfMonth();

    if (dueDay > lastDayOfMonth) {

        dueDay = lastDayOfMonth;
    }

    dueDate =
            LocalDate.of(
                    billingYear,
                    billingMonth,
                    dueDay
            );

    invoice.setDueDate(
            dueDate
    );


    // -----------------------------------------------------
    // 7. Rent amount
    // -----------------------------------------------------

    BigDecimal rentAmount =
            agreement.getMonthlyRent();

    invoice.setRentAmount(
            rentAmount
    );


    // -----------------------------------------------------
    // 8. Initial late fee
    // -----------------------------------------------------

    invoice.setLateFee(
            BigDecimal.ZERO
    );


    // -----------------------------------------------------
    // 9. Total amount
    // -----------------------------------------------------

    invoice.setTotalAmount(
            rentAmount.add(
                    BigDecimal.ZERO
            )
    );


    // -----------------------------------------------------
    // 10. Invoice status
    // -----------------------------------------------------

    invoice.setStatus(
            InvoiceStatus.PENDING
    );


    // -----------------------------------------------------
    // 11. Temporary invoice number
    // -----------------------------------------------------

    invoice.setInvoiceNumber(
            "TEMP-"
                    + System.currentTimeMillis()
    );


    // -----------------------------------------------------
    // 12. Save invoice first
    //     This generates invoiceId
    // -----------------------------------------------------

    invoice =
            rentInvoiceRepository.save(
                    invoice
            );


    // -----------------------------------------------------
    // 13. Generate final invoice number
    // -----------------------------------------------------

    invoice.setInvoiceNumber(
            String.format(
                    "INV-%d-%05d",
                    billingYear,
                    invoice.getInvoiceId()
            )
    );


    // -----------------------------------------------------
    // 14. Generate PDF
    // -----------------------------------------------------

    String invoiceDocument =
            rentInvoicePdfService
                    .generateInvoicePdf(
                            invoice
                    );

    invoice.setInvoiceDocument(
            invoiceDocument
    );


    // -----------------------------------------------------
    // 15. Save final invoice
    // -----------------------------------------------------

    invoice =
            rentInvoiceRepository.save(
                    invoice
            );


    // -----------------------------------------------------
    // 16. Return response
    // -----------------------------------------------------

    return mapToResponse(
            invoice
    );
}


// =========================================================
// GET INVOICE BY ID
// =========================================================

@Override
public RentInvoiceResponse getInvoiceById(
        Long invoiceId) {

    RentInvoice invoice =
            rentInvoiceRepository
                    .findById(invoiceId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Invoice not found"
                            )
                    );

    return mapToResponse(
            invoice
    );
}


// =========================================================
// GET ALL INVOICES
// =========================================================

@Override
public List<RentInvoiceResponse> getAllInvoices() {

    return rentInvoiceRepository
            .findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();
}


// =========================================================
// GET LOGGED-IN TENANT INVOICES
// =========================================================

@Override
public List<RentInvoiceResponse> getMyInvoices() {

    // -----------------------------------------------------
    // 1. Get authentication information from JWT
    // -----------------------------------------------------

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    String email =
            authentication.getName();


    // -----------------------------------------------------
    // 2. Find logged-in User
    // -----------------------------------------------------

    User user =
            userRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Logged-in user not found"
                            )
                    );


    // -----------------------------------------------------
    // 3. Find Tenant using User
    // -----------------------------------------------------

    Tenant tenant =
            tenantRepository
                    .findByUser(user)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Tenant profile not found for logged-in user"
                            )
                    );


    // -----------------------------------------------------
    // 4. Get tenant ID
    // -----------------------------------------------------

    Long tenantId =
            tenant.getTenantId();


    // -----------------------------------------------------
    // 5. Find invoices belonging to this tenant
    // -----------------------------------------------------

    return rentInvoiceRepository
            .findByTenantId(tenantId)
            .stream()
            .map(this::mapToResponse)
            .toList();
}


// =========================================================
// FIND NEXT BILLING DATE
// =========================================================

private LocalDate getNextBillingDate(
        RentalAgreement agreement) {

    // -----------------------------------------------------
    // Start with agreement start date
    // -----------------------------------------------------

    LocalDate billingDate =
            agreement
                    .getStartDate()
                    .withDayOfMonth(1);


    // -----------------------------------------------------
    // Find latest invoice for this agreement
    // -----------------------------------------------------

    List<RentInvoice> existingInvoices =
            rentInvoiceRepository
                    .findAll()
                    .stream()
                    .filter(invoice ->
                            invoice
                                    .getRentalAgreement()
                                    .getAgreementId()
                                    .equals(
                                            agreement
                                                    .getAgreementId()
                                    )
                    )
                    .toList();


    // -----------------------------------------------------
    // If invoices already exist, move to next month
    // -----------------------------------------------------

    if (!existingInvoices.isEmpty()) {

        RentInvoice latestInvoice =
                existingInvoices
                        .stream()
                        .max((a, b) -> {

                            LocalDate dateA =
                                    LocalDate.of(
                                            a.getBillingYear(),
                                            a.getBillingMonth(),
                                            1
                                    );

                            LocalDate dateB =
                                    LocalDate.of(
                                            b.getBillingYear(),
                                            b.getBillingMonth(),
                                            1
                                    );

                            return dateA.compareTo(
                                    dateB
                            );
                        })
                        .orElseThrow();

        billingDate =
                LocalDate.of(
                        latestInvoice.getBillingYear(),
                        latestInvoice.getBillingMonth(),
                        1
                )
                .plusMonths(1);
    }


    return billingDate;
}


// =========================================================
// CALCULATE SUCCESSFULLY PAID AMOUNT
// =========================================================

private BigDecimal getSuccessfullyPaidAmount(
        Long invoiceId) {

    return paymentRepository
            .findByInvoice_InvoiceId(invoiceId)
            .stream()
            .filter(payment ->
                    payment.getPaymentStatus()
                            == PaymentStatus.SUCCESS
            )
            .map(payment ->
                    payment.getAmount()
            )
            .reduce(
                    BigDecimal.ZERO,
                    BigDecimal::add
            )
            .setScale(
                    2,
                    RoundingMode.HALF_UP
            );
}


// =========================================================
// MAP ENTITY TO RESPONSE
// =========================================================

private RentInvoiceResponse mapToResponse(
        RentInvoice invoice) {

    RentInvoiceResponse response =
            new RentInvoiceResponse();


    response.setInvoiceId(
            invoice.getInvoiceId()
    );

    response.setInvoiceNumber(
            invoice.getInvoiceNumber()
    );

    response.setAgreementId(
            invoice
                    .getRentalAgreement()
                    .getAgreementId()
    );

    response.setTenantId(
            invoice.getTenantId()
    );

    response.setUnitId(
            invoice.getUnitId()
    );

    response.setBillingMonth(
            invoice.getBillingMonth()
    );

    response.setBillingYear(
            invoice.getBillingYear()
    );

    response.setInvoiceDate(
            invoice.getInvoiceDate()
    );

    response.setDueDate(
            invoice.getDueDate()
    );

    response.setRentAmount(
            invoice.getRentAmount()
    );

    response.setLateFee(
            invoice.getLateFee()
    );

    response.setTotalAmount(
            invoice.getTotalAmount()
    );


    // -----------------------------------------------------
    // Calculate total successfully paid
    // -----------------------------------------------------

    BigDecimal totalPaid =
            getSuccessfullyPaidAmount(
                    invoice.getInvoiceId()
            );

    response.setTotalPaid(
            totalPaid
    );


    // -----------------------------------------------------
    // Calculate remaining amount
    // -----------------------------------------------------

    BigDecimal remainingAmount =
            invoice.getTotalAmount()
                    .subtract(totalPaid)
                    .max(BigDecimal.ZERO)
                    .setScale(
                            2,
                            RoundingMode.HALF_UP
                    );

    response.setRemainingAmount(
            remainingAmount
    );


    response.setInvoiceDocument(
            invoice.getInvoiceDocument()
    );

    response.setStatus(
            invoice.getStatus()
    );

    response.setCreatedAt(
            invoice.getCreatedAt()
    );

    response.setUpdatedAt(
            invoice.getUpdatedAt()
    );


    return response;
}


}

