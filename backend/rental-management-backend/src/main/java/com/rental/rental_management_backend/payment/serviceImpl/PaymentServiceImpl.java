
package com.rental.rental_management_backend.payment.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;
import com.rental.rental_management_backend.payment.entity.Payment;
import com.rental.rental_management_backend.payment.enums.PaymentStatus;
import com.rental.rental_management_backend.payment.repository.PaymentRepository;
import com.rental.rental_management_backend.payment.service.PaymentService;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.repository.UnitRepository;
import com.rental.rental_management_backend.rental.entity.RentInvoice;
import com.rental.rental_management_backend.rental.enums.InvoiceStatus;
import com.rental.rental_management_backend.rental.repository.RentInvoiceRepository;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentInvoiceRepository rentInvoiceRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final UnitRepository unitRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            RentInvoiceRepository rentInvoiceRepository,
            UserRepository userRepository,
            TenantRepository tenantRepository,
            UnitRepository unitRepository) {

        this.paymentRepository = paymentRepository;
        this.rentInvoiceRepository = rentInvoiceRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.unitRepository = unitRepository;
    }

    // =========================================================
    // CREATE PAYMENT
    // TENANT ONLY - OWN INVOICE
    // =========================================================

    @Override
    public PaymentResponse createPayment(
            PaymentCreateDTO request,
            String email) {

        User user = getLoggedInUser(email);

        if (user.getRole() != RoleType.TENANT) {
            throw new RuntimeException(
                    "Only tenants can create payments");
        }

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tenant profile not found for user"));

        RentInvoice invoice = rentInvoiceRepository
                .findById(request.getInvoiceId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found with ID: "
                                        + request.getInvoiceId()));

        // Tenant can pay only their own invoice
        if (!invoice.getTenantId()
                .equals(tenant.getTenantId())) {

            throw new RuntimeException(
                    "You are not authorized to make payment for this invoice");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new RuntimeException(
                    "Invoice is already fully paid");
        }

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new RuntimeException(
                    "Payment cannot be made for a cancelled invoice");
        }

        Long tenantId = invoice.getTenantId();

        BigDecimal alreadyPaid =
                getSuccessfullyPaidAmount(
                        invoice.getInvoiceId());

        BigDecimal remainingAmount =
                invoice.getTotalAmount()
                        .subtract(alreadyPaid)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP);

        BigDecimal requestedAmount =
                request.getAmount()
                        .setScale(
                                2,
                                RoundingMode.HALF_UP);

        if (requestedAmount.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Payment amount must be greater than zero");
        }

        if (requestedAmount.compareTo(
                remainingAmount) > 0) {

            throw new RuntimeException(
                    "Payment amount cannot be greater than the remaining invoice amount: "
                            + remainingAmount);
        }

        Payment payment = new Payment();

        payment.setInvoice(invoice);

        payment.setTenantId(tenantId);

        payment.setAmount(requestedAmount);

        payment.setPaymentStatus(
                PaymentStatus.PENDING);

        // Payment method selected by tenant
        payment.setPaymentMethod(
                request.getPaymentMethod());

        // Razorpay fields kept for future integration
        payment.setRazorpayOrderId(null);

        payment.setRazorpayPaymentId(null);

        payment.setPaymentDate(null);

        payment.setCreatedAt(
                LocalDateTime.now());

        payment.setUpdatedAt(
                LocalDateTime.now());

        Payment savedPayment =
                paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    // =========================================================
    // CONFIRM PAYMENT
    // TENANT ONLY - OWN PAYMENT
    // =========================================================

    @Override
    public PaymentResponse confirmPayment(
            Long paymentId,
            String email) {

        User user = getLoggedInUser(email);

        if (user.getRole() != RoleType.TENANT) {
            throw new RuntimeException(
                    "Only tenants can confirm payments");
        }

        Tenant tenant = tenantRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tenant profile not found for user"));

        Payment payment = paymentRepository
                .findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: "
                                        + paymentId));

        // Tenant can confirm only their own payment
        if (!payment.getTenantId()
                .equals(tenant.getTenantId())) {

            throw new RuntimeException(
                    "You are not authorized to confirm this payment");
        }

        if (payment.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            return mapToResponse(payment);
        }

        if (payment.getPaymentStatus()
                != PaymentStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending payments can be confirmed");
        }

        payment.setPaymentStatus(
                PaymentStatus.SUCCESS);

        payment.setPaymentDate(
                LocalDateTime.now());

        payment.setUpdatedAt(
                LocalDateTime.now());

        Payment savedPayment =
                paymentRepository.save(payment);

        updateInvoiceStatus(
                savedPayment.getInvoice());

        return mapToResponse(savedPayment);
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(
            Long paymentId,
            String email) {

        User user = getLoggedInUser(email);

        Payment payment = paymentRepository
                .findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: "
                                        + paymentId));

        validatePaymentAccess(payment, user);

        return mapToResponse(payment);
    }

    // =========================================================
    // GET PAYMENTS BY TENANT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByTenant(
            Long tenantId,
            String email) {

        User user = getLoggedInUser(email);

        List<Payment> payments =
                paymentRepository.findByTenantId(tenantId);

        // Tenant can see only their own payments
        if (user.getRole() == RoleType.TENANT) {

            Tenant tenant = tenantRepository
                    .findByUser_Id(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Tenant profile not found for user"));

            if (!tenant.getTenantId().equals(tenantId)) {

                throw new RuntimeException(
                        "You are not authorized to access these payments");
            }

            return payments
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // SUPER ADMIN can see all
        if (user.getRole() == RoleType.SUPER_ADMIN) {

            return payments
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        // OWNER / MANAGER
        for (Payment payment : payments) {
            validatePaymentAccess(payment, user);
        }

        return payments
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET PAYMENTS BY INVOICE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(
            Long invoiceId,
            String email) {

        User user = getLoggedInUser(email);

        RentInvoice invoice =
                rentInvoiceRepository
                        .findById(invoiceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invoice not found with ID: "
                                                + invoiceId));

        // Check whether logged-in user can access invoice
        validateInvoiceAccess(invoice, user);

        List<Payment> payments =
                paymentRepository
                        .findByInvoice_InvoiceId(invoiceId);

        return payments
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET LOGGED-IN USER
    // =========================================================

    private User getLoggedInUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"));
    }

    // =========================================================
    // PAYMENT ACCESS
    // =========================================================

    private void validatePaymentAccess(
            Payment payment,
            User user) {

        // SUPER ADMIN
        if (user.getRole() == RoleType.SUPER_ADMIN) {
            return;
        }

        RentInvoice invoice =
                payment.getInvoice();

        validateInvoiceAccess(
                invoice,
                user);
    }

    // =========================================================
    // INVOICE ACCESS
    // =========================================================

    private void validateInvoiceAccess(
            RentInvoice invoice,
            User user) {

        // SUPER ADMIN
        if (user.getRole() == RoleType.SUPER_ADMIN) {
            return;
        }

        // TENANT
        if (user.getRole() == RoleType.TENANT) {

            Tenant tenant = tenantRepository
                    .findByUser_Id(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Tenant profile not found for user"));

            if (!invoice.getTenantId()
                    .equals(tenant.getTenantId())) {

                throw new RuntimeException(
                        "You are not authorized to access this invoice");
            }

            return;
        }

        // Get Unit
        Unit unit = unitRepository
                .findById(invoice.getUnitId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Unit not found with ID: "
                                        + invoice.getUnitId()));

        // Unit
        // ↓
        // Floor
        // ↓
        // Building
        // ↓
        // Property

        Property property =
                unit.getFloor()
                        .getBuilding()
                        .getProperty();

        // PROPERTY OWNER
        if (user.getRole()
                == RoleType.PROPERTY_OWNER) {

            if (property.getOwner() == null
                    || !property.getOwner()
                            .getId()
                            .equals(user.getId())) {

                throw new RuntimeException(
                        "You are not authorized to access this invoice");
            }

            return;
        }

        // PROPERTY MANAGER
        if (user.getRole()
                == RoleType.PROPERTY_MANAGER) {

            if (property.getPropertyManager() == null
                    || property.getPropertyManager()
                            .getUser() == null
                    || !property.getPropertyManager()
                            .getUser()
                            .getId()
                            .equals(user.getId())) {

                throw new RuntimeException(
                        "You are not authorized to access this invoice");
            }

            return;
        }

        throw new RuntimeException(
                "You are not authorized to access this invoice");
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
                                == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add)
                .setScale(
                        2,
                        RoundingMode.HALF_UP);
    }

    // =========================================================
    // UPDATE INVOICE STATUS
    // =========================================================

    private void updateInvoiceStatus(
            RentInvoice invoice) {

        BigDecimal totalPaid =
                getSuccessfullyPaidAmount(
                        invoice.getInvoiceId());

        BigDecimal totalAmount =
                invoice.getTotalAmount();

        if (totalPaid.compareTo(totalAmount) >= 0) {

            invoice.setStatus(
                    InvoiceStatus.PAID);

        } else if (totalPaid.compareTo(
                BigDecimal.ZERO) > 0) {

            invoice.setStatus(
                    InvoiceStatus.PARTIALLY_PAID);

        } else {

            invoice.setStatus(
                    InvoiceStatus.PENDING);
        }

        rentInvoiceRepository.save(invoice);
    }

    // =========================================================
    // MAP PAYMENT TO RESPONSE
    // =========================================================

    private PaymentResponse mapToResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setPaymentId(
                payment.getPaymentId());

        response.setInvoiceId(
                payment.getInvoice()
                        .getInvoiceId());

        response.setTenantId(
                payment.getTenantId());

        response.setAmount(
                payment.getAmount());

        response.setPaymentStatus(
                payment.getPaymentStatus());

        response.setPaymentMethod(
                payment.getPaymentMethod());

        // Future Razorpay integration
        response.setRazorpayOrderId(
                payment.getRazorpayOrderId());

        response.setRazorpayPaymentId(
                payment.getRazorpayPaymentId());

        response.setPaymentDate(
                payment.getPaymentDate());

        response.setCreatedAt(
                payment.getCreatedAt());

        response.setUpdatedAt(
                payment.getUpdatedAt());

        return response;
    }
}
