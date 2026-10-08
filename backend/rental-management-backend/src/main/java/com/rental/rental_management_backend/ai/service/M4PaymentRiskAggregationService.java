
package com.rental.rental_management_backend.ai.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.ai.dto.M4PaymentRiskRequest;
import com.rental.rental_management_backend.payment.entity.Payment;
import com.rental.rental_management_backend.payment.enums.PaymentStatus;
import com.rental.rental_management_backend.payment.repository.PaymentRepository;
import com.rental.rental_management_backend.rental.entity.RentInvoice;
import com.rental.rental_management_backend.rental.repository.RentInvoiceRepository;
import com.rental.rental_management_backend.tenant.entity.Tenant;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
public class M4PaymentRiskAggregationService {

    private final PaymentRepository paymentRepository;

    private final RentInvoiceRepository rentInvoiceRepository;

    private final TenantRepository tenantRepository;

    public M4PaymentRiskAggregationService(

            PaymentRepository paymentRepository,

            RentInvoiceRepository rentInvoiceRepository,

            TenantRepository tenantRepository) {

        this.paymentRepository =
                paymentRepository;

        this.rentInvoiceRepository =
                rentInvoiceRepository;

        this.tenantRepository =
                tenantRepository;
    }

    // =========================================================
    // MAIN AGGREGATION METHOD
    // =========================================================

    @Transactional(readOnly = true)
    public M4PaymentRiskRequest aggregateFeatures(
            Long tenantId) {

        Tenant tenant =
                tenantRepository.findById(tenantId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Tenant not found: "
                                                + tenantId));

        if (tenant.getMonthlyIncome() == null
                || tenant.getMonthlyIncome()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Tenant monthly income is required for payment-risk prediction");
        }

        List<RentInvoice> invoices =
                rentInvoiceRepository
                        .findByTenantId(tenantId)
                        .stream()
                        .filter(invoice ->
                                invoice.getBillingYear() != null
                                        && invoice.getBillingMonth() != null)
                        .filter(invoice ->
                                invoice.getStatus() != null
                                        && !invoice.getStatus()
                                                .name()
                                                .equals("CANCELLED"))
                        .sorted(
                                Comparator.comparing(
                                        this::getInvoiceMonth))
                        .toList();

        List<Payment> payments =
                paymentRepository
                        .findByTenantId(tenantId)
                        .stream()
                        .filter(payment ->
                                payment.getPaymentStatus()
                                        == PaymentStatus.SUCCESS)
                        .filter(payment ->
                                payment.getPaymentDate() != null)
                        .sorted(
                                Comparator.comparing(
                                        Payment::getPaymentDate))
                        .toList();

        if (invoices.isEmpty()) {

            throw new IllegalArgumentException(
                    "Insufficient payment history for payment-risk prediction");
        }

        /*
         * Create one historical snapshot for every month between
         * the first invoice month and the latest real activity month.
         *
         * The latest activity month is based on the latest invoice
         * billing month or the latest successful payment month.
         *
         * This prevents artificial snapshots being created after
         * the tenant's latest real invoice/payment activity.
         */

        YearMonth firstMonth =
                invoices.stream()
                        .map(this::getInvoiceMonth)
                        .min(Comparator.naturalOrder())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Insufficient payment history for payment-risk prediction"));

        YearMonth latestInvoiceMonth =
                invoices.stream()
                        .map(this::getInvoiceMonth)
                        .max(Comparator.naturalOrder())
                        .orElse(firstMonth);

        YearMonth latestPaymentMonth =
                payments.stream()
                        .map(payment ->
                                payment.getPaymentDate()
                                        .toLocalDate())
                        .map(YearMonth::from)
                        .max(Comparator.naturalOrder())
                        .orElse(firstMonth);

        YearMonth currentMonth =
                latestInvoiceMonth.isAfter(latestPaymentMonth)
                        ? latestInvoiceMonth
                        : latestPaymentMonth;

        List<MonthlySnapshot> snapshots =
                new ArrayList<>();

        YearMonth month =
                firstMonth;

        while (!month.isAfter(currentMonth)) {

            LocalDate snapshotEnd =
                    month.atEndOfMonth();

            snapshots.add(
                    buildSnapshot(
                            month,
                            snapshotEnd,
                            invoices,
                            payments,
                            tenant));

            month =
                    month.plusMonths(1);
        }

        if (snapshots.isEmpty()) {

            throw new IllegalArgumentException(
                    "Insufficient payment history for payment-risk prediction");
        }

        /*
         * The M4 Python feature_engineering.py uses:
         *
         * late_payment_count_delta
         * missed_payment_count_delta
         *
         * and then rolling windows of 3 and 6 snapshots.
         */

        for (int i = 0; i < snapshots.size(); i++) {

            MonthlySnapshot current =
                    snapshots.get(i);

            MonthlySnapshot previous =
                    i == 0
                            ? null
                            : snapshots.get(i - 1);

            if (previous == null) {

                current.latePaymentCountDelta =
                        current.latePaymentCount;

                current.missedPaymentCountDelta =
                        current.missedPaymentCount;

                current.latePaymentTrend =
                        0.0;

                current.missedPaymentTrend =
                        0.0;

                current.paymentCompletionTrend =
                        0.0;

            } else {

                current.latePaymentCountDelta =
                        Math.max(
                                0.0,
                                current.latePaymentCount
                                        - previous.latePaymentCount);

                current.missedPaymentCountDelta =
                        Math.max(
                                0.0,
                                current.missedPaymentCount
                                        - previous.missedPaymentCount);

                current.latePaymentTrend =
                        current.latePaymentCount
                                - previous.latePaymentCount;

                current.missedPaymentTrend =
                        current.missedPaymentCount
                                - previous.missedPaymentCount;

                current.paymentCompletionTrend =
                        current.paymentCompletionRatio
                                - previous.paymentCompletionRatio;
            }
        }

        MonthlySnapshot latest =
                snapshots.get(
                        snapshots.size() - 1);

        /*
         * Exact M4 rolling behavior:
         *
         * 3M:
         *   rolling sum of late delta
         *   rolling sum of missed delta
         *   rolling mean of avg days late
         *   rolling mean of completion ratio
         *
         * 6M:
         *   same logic with six snapshots.
         */

        latest.recentLatePaymentCount3m =
                rollingLateCount(
                        snapshots,
                        3);

        latest.recentMissedPaymentCount3m =
                rollingMissedCount(
                        snapshots,
                        3);

        latest.recentAvgDaysLate3m =
                rollingAverageDaysLate(
                        snapshots,
                        3);

        latest.recentPaymentCompletionRatio3m =
                rollingAverageCompletion(
                        snapshots,
                        3);

        latest.recentLatePaymentCount6m =
                rollingLateCount(
                        snapshots,
                        6);

        latest.recentMissedPaymentCount6m =
                rollingMissedCount(
                        snapshots,
                        6);

        latest.recentAvgDaysLate6m =
                rollingAverageDaysLate(
                        snapshots,
                        6);

        latest.recentPaymentCompletionRatio6m =
                rollingAverageCompletion(
                        snapshots,
                        6);

        /*
         * Build the exact 20-feature request.
         *
         * tenantId is deliberately NOT included.
         */

        M4PaymentRiskRequest request =
                new M4PaymentRiskRequest();

        request.setMonthlyIncome(
                tenant.getMonthlyIncome()
                        .doubleValue());

        request.setHistoricalInvoiceCount(
                latest.historicalInvoiceCount);

        /*
         * MonthlySnapshot stores latePaymentCount as int,
         * while M4PaymentRiskRequest expects Double.
         *
         * Convert int -> double here.
         */

        request.setLatePaymentCount(
                (double) latest.latePaymentCount);

        request.setMissedPaymentCount(
                latest.missedPaymentCount);

        request.setAvgDaysLate(
                latest.avgDaysLate);

        request.setMaxDaysLate(
                latest.maxDaysLate);

        request.setHistoricalOutstanding(
                latest.historicalOutstanding);

        request.setRentToIncomeRatio(
                latest.rentToIncomeRatio);

        request.setPaymentCompletionRatio(
                latest.paymentCompletionRatio);

        request.setRecentLatePaymentCount3m(
                latest.recentLatePaymentCount3m);

        request.setRecentMissedPaymentCount3m(
                latest.recentMissedPaymentCount3m);

        request.setRecentAvgDaysLate3m(
                latest.recentAvgDaysLate3m);

        request.setRecentPaymentCompletionRatio3m(
                latest.recentPaymentCompletionRatio3m);

        request.setRecentLatePaymentCount6m(
                latest.recentLatePaymentCount6m);

        request.setRecentMissedPaymentCount6m(
                latest.recentMissedPaymentCount6m);

        request.setRecentAvgDaysLate6m(
                latest.recentAvgDaysLate6m);

        request.setRecentPaymentCompletionRatio6m(
                latest.recentPaymentCompletionRatio6m);

        request.setLatePaymentTrend(
                latest.latePaymentTrend);

        request.setMissedPaymentTrend(
                latest.missedPaymentTrend);

        request.setPaymentCompletionTrend(
                latest.paymentCompletionTrend);

        validateRequest(request);

        return request;
    }

    // =========================================================
    // BUILD MONTHLY SNAPSHOT
    // =========================================================

    private MonthlySnapshot buildSnapshot(

            YearMonth snapshotMonth,

            LocalDate snapshotEnd,

            List<RentInvoice> invoices,

            List<Payment> payments,

            Tenant tenant) {

        List<RentInvoice> historicalInvoices =
                invoices.stream()
                        .filter(invoice ->
                                !getInvoiceMonth(invoice)
                                        .isAfter(snapshotMonth))
                        .toList();

        double historicalInvoiceCount =
                historicalInvoices.size();

        int latePaymentCount = 0;

        int missedPaymentCount = 0;

        double historicalOutstanding = 0.0;

        List<Long> lateDays =
                new ArrayList<>();

        BigDecimal monthlyIncome =
                tenant.getMonthlyIncome();

        double rentToIncomeRatio =
                0.0;

        for (RentInvoice invoice :
                historicalInvoices) {

            List<Payment> invoicePayments =
                    payments.stream()
                            .filter(payment ->
                                    payment.getInvoice() != null
                                            && payment.getInvoice()
                                                    .getInvoiceId()
                                                    .equals(
                                                            invoice.getInvoiceId()))
                            .filter(payment ->
                                    !payment.getPaymentDate()
                                            .toLocalDate()
                                            .isAfter(snapshotEnd))
                            .sorted(
                                    Comparator.comparing(
                                            Payment::getPaymentDate))
                            .toList();

            BigDecimal paidAmount =
                    invoicePayments.stream()
                            .map(Payment::getAmount)
                            .filter(amount ->
                                    amount != null)
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add);

            BigDecimal totalAmount =
                    invoice.getTotalAmount() == null
                            ? BigDecimal.ZERO
                            : invoice.getTotalAmount();

            BigDecimal outstanding =
                    totalAmount
                            .subtract(paidAmount);

            if (outstanding.compareTo(
                    BigDecimal.ZERO) < 0) {

                outstanding =
                        BigDecimal.ZERO;
            }

            historicalOutstanding +=
                    outstanding.doubleValue();

            /*
             * An invoice is considered missed when its due date
             * has passed and the invoice was not fully paid by the
             * due date.
             *
             * This is cumulative: once an invoice has missed its
             * due date, it remains part of historical missed
             * payment behavior.
             */

            if (!invoice.getDueDate()
                    .isAfter(snapshotEnd)) {

                BigDecimal paidByDueDate =
                        payments.stream()
                                .filter(payment ->
                                        payment.getInvoice() != null
                                                && payment.getInvoice()
                                                        .getInvoiceId()
                                                        .equals(
                                                                invoice.getInvoiceId()))
                                .filter(payment ->
                                        payment.getPaymentDate() != null)
                                .filter(payment ->
                                        !payment.getPaymentDate()
                                                .toLocalDate()
                                                .isAfter(
                                                        invoice.getDueDate()))
                                .map(Payment::getAmount)
                                .filter(amount ->
                                        amount != null)
                                .reduce(
                                        BigDecimal.ZERO,
                                        BigDecimal::add);

                if (paidByDueDate.compareTo(
                        totalAmount) < 0) {

                    missedPaymentCount++;
                }
            }

            /*
             * Find the date on which the invoice became fully paid.
             */

            LocalDateTime completionDate =
                    findCompletionDate(
                            invoice,
                            invoicePayments);

            if (completionDate != null
                    && !completionDate.toLocalDate()
                            .isAfter(snapshotEnd)
                    && completionDate.toLocalDate()
                            .isAfter(invoice.getDueDate())) {

                long daysLate =
                        ChronoUnit.DAYS.between(
                                invoice.getDueDate(),
                                completionDate.toLocalDate());

                if (daysLate > 0) {

                    latePaymentCount++;

                    lateDays.add(daysLate);
                }
            }

            /*
             * Use the rental agreement's monthly rent for the
             * rent-to-income feature.
             */

            if (invoice.getRentalAgreement() != null
                    && invoice.getRentalAgreement()
                            .getMonthlyRent() != null) {

                BigDecimal monthlyRent =
                        invoice.getRentalAgreement()
                                .getMonthlyRent();

                if (monthlyIncome.compareTo(
                        BigDecimal.ZERO) > 0) {

                    rentToIncomeRatio =
                            monthlyRent
                                    .divide(
                                            monthlyIncome,
                                            10,
                                            RoundingMode.HALF_UP)
                                    .doubleValue();
                }
            }
        }

        double avgDaysLate =
                lateDays.stream()
                        .mapToLong(Long::longValue)
                        .average()
                        .orElse(0.0);

        int maxDaysLate =
                (int) lateDays.stream()
                        .mapToLong(Long::longValue)
                        .max()
                        .orElse(0L);

        /*
         * Exact relationship used by the M4 dataset:
         *
         * payment_completion_ratio =
         *     (historical invoices - missed invoices)
         *     / historical invoices
         */

        double paymentCompletionRatio =
                historicalInvoiceCount == 0
                        ? 0.0
                        : (
                            historicalInvoiceCount
                                - missedPaymentCount
                          )
                          / historicalInvoiceCount;

        MonthlySnapshot snapshot =
                new MonthlySnapshot();

        snapshot.month =
                snapshotMonth;

        snapshot.historicalInvoiceCount =
                historicalInvoiceCount;

        snapshot.latePaymentCount =
                latePaymentCount;

        snapshot.missedPaymentCount =
                missedPaymentCount;

        snapshot.avgDaysLate =
                avgDaysLate;

        snapshot.maxDaysLate =
                maxDaysLate;

        snapshot.historicalOutstanding =
                historicalOutstanding;

        snapshot.rentToIncomeRatio =
                rentToIncomeRatio;

        snapshot.paymentCompletionRatio =
                Math.max(
                        0.0,
                        Math.min(
                                1.0,
                                paymentCompletionRatio));

        return snapshot;
    }

    // =========================================================
    // FIND FULL PAYMENT COMPLETION DATE
    // =========================================================

    private LocalDateTime findCompletionDate(

            RentInvoice invoice,

            List<Payment> payments) {

        BigDecimal totalAmount =
                invoice.getTotalAmount() == null
                        ? BigDecimal.ZERO
                        : invoice.getTotalAmount();

        if (totalAmount.compareTo(
                BigDecimal.ZERO) <= 0) {

            return invoice.getInvoiceDate()
                    .atStartOfDay();
        }

        BigDecimal runningTotal =
                BigDecimal.ZERO;

        for (Payment payment : payments) {

            if (payment.getAmount() == null
                    || payment.getPaymentDate() == null) {

                continue;
            }

            runningTotal =
                    runningTotal.add(
                            payment.getAmount());

            if (runningTotal.compareTo(
                    totalAmount) >= 0) {

                return payment.getPaymentDate();
            }
        }

        return null;
    }

    // =========================================================
    // ROLLING LATE COUNT
    // =========================================================

    private double rollingLateCount(

            List<MonthlySnapshot> snapshots,

            int window) {

        int start =
                Math.max(
                        0,
                        snapshots.size() - window);

        double total = 0.0;

        for (int i = start;
                i < snapshots.size();
                i++) {

            total +=
                    snapshots.get(i)
                            .latePaymentCountDelta;
        }

        return total;
    }

    // =========================================================
    // ROLLING MISSED COUNT
    // =========================================================

    private double rollingMissedCount(

            List<MonthlySnapshot> snapshots,

            int window) {

        int start =
                Math.max(
                        0,
                        snapshots.size() - window);

        double total = 0.0;

        for (int i = start;
                i < snapshots.size();
                i++) {

            total +=
                    snapshots.get(i)
                            .missedPaymentCountDelta;
        }

        return total;
    }

    // =========================================================
    // ROLLING AVG DAYS LATE
    // =========================================================

    private double rollingAverageDaysLate(

            List<MonthlySnapshot> snapshots,

            int window) {

        int start =
                Math.max(
                        0,
                        snapshots.size() - window);

        double total = 0.0;

        int count = 0;

        for (int i = start;
                i < snapshots.size();
                i++) {

            total +=
                    snapshots.get(i)
                            .avgDaysLate;

            count++;
        }

        return count == 0
                ? 0.0
                : total / count;
    }

    // =========================================================
    // ROLLING COMPLETION RATIO
    // =========================================================

    private double rollingAverageCompletion(

            List<MonthlySnapshot> snapshots,

            int window) {

        int start =
                Math.max(
                        0,
                        snapshots.size() - window);

        double total = 0.0;

        int count = 0;

        for (int i = start;
                i < snapshots.size();
                i++) {

            total +=
                    snapshots.get(i)
                            .paymentCompletionRatio;

            count++;
        }

        return count == 0
                ? 0.0
                : total / count;
    }

    // =========================================================
    // INVOICE MONTH
    // =========================================================

    private YearMonth getInvoiceMonth(
            RentInvoice invoice) {

        return YearMonth.of(
                invoice.getBillingYear(),
                invoice.getBillingMonth());
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    private void validateRequest(
            M4PaymentRiskRequest request) {

        if (request.getMonthlyIncome() == null
                || request.getMonthlyIncome() < 0) {

            throw new IllegalArgumentException(
                    "monthly_income must be non-negative");
        }

        if (request.getHistoricalInvoiceCount() == null
                || request.getHistoricalInvoiceCount() < 0) {

            throw new IllegalArgumentException(
                    "historical_invoice_count must be non-negative");
        }

        if (request.getLatePaymentCount() == null
                || request.getLatePaymentCount() < 0) {

            throw new IllegalArgumentException(
                    "late_payment_count must be non-negative");
        }

        if (request.getMissedPaymentCount() == null
                || request.getMissedPaymentCount() < 0) {

            throw new IllegalArgumentException(
                    "missed_payment_count must be non-negative");
        }

        if (request.getAvgDaysLate() == null
                || request.getAvgDaysLate() < 0) {

            throw new IllegalArgumentException(
                    "avg_days_late must be non-negative");
        }

        if (request.getMaxDaysLate() == null
                || request.getMaxDaysLate() < 0) {

            throw new IllegalArgumentException(
                    "max_days_late must be non-negative");
        }

        if (request.getHistoricalOutstanding() == null
                || request.getHistoricalOutstanding() < 0) {

            throw new IllegalArgumentException(
                    "historical_outstanding must be non-negative");
        }

        if (request.getRentToIncomeRatio() == null
                || request.getRentToIncomeRatio() < 0) {

            throw new IllegalArgumentException(
                    "rent_to_income_ratio must be non-negative");
        }

        validateRatio(
                request.getPaymentCompletionRatio(),
                "payment_completion_ratio");

        validateRatio(
                request.getRecentPaymentCompletionRatio3m(),
                "recent_payment_completion_ratio_3m");

        validateRatio(
                request.getRecentPaymentCompletionRatio6m(),
                "recent_payment_completion_ratio_6m");
    }

    private void validateRatio(

            Double value,

            String fieldName) {

        if (value == null
                || value < 0
                || value > 1) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be between 0 and 1");
        }
    }

    // =========================================================
    // INTERNAL MONTHLY SNAPSHOT
    // =========================================================

    private static class MonthlySnapshot {

        private YearMonth month;

        private double historicalInvoiceCount;

        private int latePaymentCount;

        private int missedPaymentCount;

        private double avgDaysLate;

        private int maxDaysLate;

        private double historicalOutstanding;

        private double rentToIncomeRatio;

        private double paymentCompletionRatio;

        private double latePaymentCountDelta;

        private double missedPaymentCountDelta;

        private double recentLatePaymentCount3m;

        private double recentMissedPaymentCount3m;

        private double recentAvgDaysLate3m;

        private double recentPaymentCompletionRatio3m;

        private double recentLatePaymentCount6m;

        private double recentMissedPaymentCount6m;

        private double recentAvgDaysLate6m;

        private double recentPaymentCompletionRatio6m;

        private double latePaymentTrend;

        private double missedPaymentTrend;

        private double paymentCompletionTrend;
    }
}
