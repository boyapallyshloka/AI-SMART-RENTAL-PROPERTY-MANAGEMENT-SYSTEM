package com.rental.rental_management_backend.payment.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import com.rental.rental_management_backend.payment.dto.PaymentCreateDTO;
import com.rental.rental_management_backend.payment.dto.PaymentResponse;
import com.rental.rental_management_backend.payment.enums.PaymentStatus;
import com.rental.rental_management_backend.payment.repository.PaymentRepository;
import com.rental.rental_management_backend.payment.service.PaymentService;

import com.rental.rental_management_backend.rental.entity.RentInvoice;
import com.rental.rental_management_backend.rental.enums.InvoiceStatus;
import com.rental.rental_management_backend.rental.repository.RentInvoiceRepository;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    private final RentInvoiceRepository rentInvoiceRepository;

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            RentInvoiceRepository rentInvoiceRepository) {

        this.paymentRepository = paymentRepository;
        this.rentInvoiceRepository = rentInvoiceRepository;

        try {

            this.razorpayClient = new RazorpayClient(
                    razorpayKeyId,
                    razorpayKeySecret
            );

        } catch (RazorpayException e) {

            throw new RuntimeException(
                    "Unable to initialize Razorpay client",
                    e
            );
        }
    }

    @Override
    public PaymentResponse createPaymentOrder(
            PaymentCreateDTO request) {

        // 1. Find invoice
        RentInvoice invoice = rentInvoiceRepository
                .findById(request.getInvoiceId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found with ID: "
                                        + request.getInvoiceId()
                        )
                );

        // 2. Check invoice status
        if (invoice.getStatus() == InvoiceStatus.PAID) {

            throw new RuntimeException(
                    "Invoice is already fully paid"
            );
        }

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {

            throw new RuntimeException(
                    "Payment cannot be made for a cancelled invoice"
            );
        }

        // 3. Get tenant ID directly from invoice
        Long tenantId = invoice.getTenantId();

        // 4. Calculate amount already successfully paid
        BigDecimal alreadyPaid =
                getSuccessfullyPaidAmount(
                        invoice.getInvoiceId()
                );

        // 5. Calculate remaining amount
        BigDecimal remainingAmount =
                invoice.getTotalAmount()
                        .subtract(alreadyPaid)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // 6. Validate requested amount
        BigDecimal requestedAmount =
                request.getAmount()
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Payment amount must be greater than zero"
            );
        }

        if (requestedAmount.compareTo(remainingAmount) > 0) {

            throw new RuntimeException(
                    "Payment amount cannot be greater than the remaining invoice amount: "
                            + remainingAmount
            );
        }

        // 7. Convert rupees to paise
        long amountInPaise =
                requestedAmount
                        .multiply(BigDecimal.valueOf(100))
                        .longValueExact();

        try {

            // 8. Create Razorpay order
            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    "INR"
            );

            orderRequest.put(
                    "receipt",
                    invoice.getInvoiceNumber()
            );

            // Each application-level partial payment
            // gets its own Razorpay order.
            orderRequest.put(
                    "partial_payment",
                    false
            );

            Order razorpayOrder =
                    razorpayClient.orders.create(
                            orderRequest
                    );

            // 9. Get Razorpay order ID
            String razorpayOrderId =
                    razorpayOrder.get("id");

            // 10. Create local payment record
            com.rental.rental_management_backend.payment.entity.Payment payment =
                    new com.rental.rental_management_backend.payment.entity.Payment();

            payment.setInvoice(invoice);

            payment.setTenantId(tenantId);

            payment.setAmount(requestedAmount);

            payment.setPaymentStatus(
                    PaymentStatus.PENDING
            );

            payment.setRazorpayOrderId(
                    razorpayOrderId
            );

            payment.setPaymentDate(null);

            payment.setCreatedAt(
                    LocalDateTime.now()
            );

            payment.setUpdatedAt(
                    LocalDateTime.now()
            );

            payment =
                    paymentRepository.save(payment);

            return mapToResponse(payment);

        } catch (RazorpayException e) {

            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + e.getMessage(),
                    e
            );
        }
    }

    @Override
    public PaymentResponse verifyPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        // 1. Find our local payment using Razorpay order ID
        com.rental.rental_management_backend.payment.entity.Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment record not found for Razorpay order: "
                                                + razorpayOrderId
                                )
                        );

        // 2. Prevent duplicate verification
        if (payment.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            return mapToResponse(payment);
        }

        try {

            // 3. Verify Razorpay signature
            JSONObject verificationData =
                    new JSONObject();

            verificationData.put(
                    "razorpay_order_id",
                    razorpayOrderId
            );

            verificationData.put(
                    "razorpay_payment_id",
                    razorpayPaymentId
            );

            verificationData.put(
                    "razorpay_signature",
                    razorpaySignature
            );

            boolean signatureValid =
                    Utils.verifyPaymentSignature(
                            verificationData,
                            razorpayKeySecret
                    );

            if (!signatureValid) {

                payment.setPaymentStatus(
                        PaymentStatus.FAILED
                );

                payment.setUpdatedAt(
                        LocalDateTime.now()
                );

                paymentRepository.save(payment);

                throw new RuntimeException(
                        "Invalid Razorpay payment signature"
                );
            }

            // 4. Fetch payment details from Razorpay
            Payment razorpayPayment =
                    razorpayClient.payments.fetch(
                            razorpayPaymentId
                    );

            // 5. Check that payment belongs to our order
            String fetchedOrderId =
                    razorpayPayment.get("order_id");

            if (fetchedOrderId == null
                    || !razorpayOrderId.equals(
                            fetchedOrderId)) {

                throw new RuntimeException(
                        "Razorpay payment does not belong to the requested order"
                );
            }

            // 6. Check Razorpay payment amount
            Integer razorpayAmount =
                    razorpayPayment.get("amount");

            BigDecimal paidAmount =
                    BigDecimal.valueOf(
                            razorpayAmount
                    ).divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );

            if (paidAmount.compareTo(
                    payment.getAmount()) != 0) {

                throw new RuntimeException(
                        "Razorpay payment amount does not match the payment record"
                );
            }

            // 7. Check payment status
            String razorpayStatus =
                    razorpayPayment.get("status");

            if (!"captured".equalsIgnoreCase(
                    razorpayStatus)) {

                throw new RuntimeException(
                        "Razorpay payment is not captured. Current status: "
                                + razorpayStatus
                );
            }

            // 8. Store Razorpay payment ID
            payment.setRazorpayPaymentId(
                    razorpayPaymentId
            );

            // 9. Get payment method from Razorpay
            String method =
                    razorpayPayment.get("method");

            payment.setPaymentMethod(
                    convertPaymentMethod(method)
            );

            // 10. Mark local payment successful
            payment.setPaymentStatus(
                    PaymentStatus.SUCCESS
            );

            payment.setPaymentDate(
                    LocalDateTime.now()
            );

            payment.setUpdatedAt(
                    LocalDateTime.now()
            );

            payment =
                    paymentRepository.save(payment);

            // 11. Update invoice status
            updateInvoiceStatus(
                    payment.getInvoice()
            );

            return mapToResponse(payment);

        } catch (RazorpayException e) {

            throw new RuntimeException(
                    "Unable to verify Razorpay payment: "
                            + e.getMessage(),
                    e
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(
            Long paymentId) {

        com.rental.rental_management_backend.payment.entity.Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found with ID: "
                                                + paymentId
                                )
                        );

        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByTenant(
            Long tenantId) {

        return paymentRepository
                .findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(
            Long invoiceId) {

        return paymentRepository
                .findByInvoice_InvoiceId(invoiceId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ---------------------------------------------------------
    // Calculate successful payments for an invoice
    // ---------------------------------------------------------

    private BigDecimal getSuccessfullyPaidAmount(
            Long invoiceId) {

        return paymentRepository
                .findByInvoice_InvoiceId(invoiceId)
                .stream()
                .filter(payment ->
                        payment.getPaymentStatus()
                                == PaymentStatus.SUCCESS
                )
                .map(payment -> payment.getAmount())
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                )
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    // ---------------------------------------------------------
    // Update invoice status after successful payment
    // ---------------------------------------------------------

    private void updateInvoiceStatus(
            RentInvoice invoice) {

        BigDecimal totalPaid =
                getSuccessfullyPaidAmount(
                        invoice.getInvoiceId()
                );

        BigDecimal totalAmount =
                invoice.getTotalAmount();

        if (totalPaid.compareTo(
                totalAmount) >= 0) {

            invoice.setStatus(
                    InvoiceStatus.PAID
            );

        } else if (totalPaid.compareTo(
                BigDecimal.ZERO) > 0) {

            invoice.setStatus(
                    InvoiceStatus.PARTIALLY_PAID
            );

        } else {

            invoice.setStatus(
                    InvoiceStatus.PENDING
            );
        }

        rentInvoiceRepository.save(invoice);
    }

    // ---------------------------------------------------------
    // Convert Razorpay payment method
    // ---------------------------------------------------------

    private com.rental.rental_management_backend.payment.enums.PaymentMethod
    convertPaymentMethod(String method) {

        if (method == null) {
            return null;
        }

        return switch (method.toLowerCase()) {

            case "upi" ->
                    com.rental.rental_management_backend.payment.enums.PaymentMethod.UPI;

            case "card" ->
                    com.rental.rental_management_backend.payment.enums.PaymentMethod.CARD;

            case "netbanking" ->
                    com.rental.rental_management_backend.payment.enums.PaymentMethod.NET_BANKING;

            case "wallet" ->
                    com.rental.rental_management_backend.payment.enums.PaymentMethod.WALLET;

            default ->
                    null;
        };
    }

    // ---------------------------------------------------------
    // Convert Payment entity to response
    // ---------------------------------------------------------

    private PaymentResponse mapToResponse(
            com.rental.rental_management_backend.payment.entity.Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setPaymentId(
                payment.getPaymentId()
        );

        response.setInvoiceId(
                payment.getInvoice()
                        .getInvoiceId()
        );

        response.setTenantId(
                payment.getTenantId()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setPaymentStatus(
                payment.getPaymentStatus()
        );

        response.setPaymentMethod(
                payment.getPaymentMethod()
        );

        response.setRazorpayOrderId(
                payment.getRazorpayOrderId()
        );

        response.setRazorpayPaymentId(
                payment.getRazorpayPaymentId()
        );

        response.setPaymentDate(
                payment.getPaymentDate()
        );

        response.setCreatedAt(
                payment.getCreatedAt()
        );

        response.setUpdatedAt(
                payment.getUpdatedAt()
        );

        return response;
    }
}