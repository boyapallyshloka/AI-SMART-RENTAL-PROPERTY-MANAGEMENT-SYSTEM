package com.rental.rental_management_backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class M4PaymentRiskRequest {

    @JsonProperty("monthly_income")
    private Double monthlyIncome;

    @JsonProperty("historical_invoice_count")
    private Double historicalInvoiceCount;

    @JsonProperty("late_payment_count")
    private Double latePaymentCount;

    @JsonProperty("missed_payment_count")
    private Integer missedPaymentCount;

    @JsonProperty("avg_days_late")
    private Double avgDaysLate;

    @JsonProperty("max_days_late")
    private Integer maxDaysLate;

    @JsonProperty("historical_outstanding")
    private Double historicalOutstanding;

    @JsonProperty("rent_to_income_ratio")
    private Double rentToIncomeRatio;

    @JsonProperty("payment_completion_ratio")
    private Double paymentCompletionRatio;

    @JsonProperty("recent_late_payment_count_3m")
    private Double recentLatePaymentCount3m;

    @JsonProperty("recent_missed_payment_count_3m")
    private Double recentMissedPaymentCount3m;

    @JsonProperty("recent_avg_days_late_3m")
    private Double recentAvgDaysLate3m;

    @JsonProperty("recent_payment_completion_ratio_3m")
    private Double recentPaymentCompletionRatio3m;

    @JsonProperty("recent_late_payment_count_6m")
    private Double recentLatePaymentCount6m;

    @JsonProperty("recent_missed_payment_count_6m")
    private Double recentMissedPaymentCount6m;

    @JsonProperty("recent_avg_days_late_6m")
    private Double recentAvgDaysLate6m;

    @JsonProperty("recent_payment_completion_ratio_6m")
    private Double recentPaymentCompletionRatio6m;

    @JsonProperty("late_payment_trend")
    private Double latePaymentTrend;

    @JsonProperty("missed_payment_trend")
    private Double missedPaymentTrend;

    @JsonProperty("payment_completion_trend")
    private Double paymentCompletionTrend;

    public M4PaymentRiskRequest() {
    }

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public Double getHistoricalInvoiceCount() {
        return historicalInvoiceCount;
    }

    public void setHistoricalInvoiceCount(Double historicalInvoiceCount) {
        this.historicalInvoiceCount = historicalInvoiceCount;
    }

    public Double getLatePaymentCount() {
        return latePaymentCount;
    }

    public void setLatePaymentCount(Double latePaymentCount) {
        this.latePaymentCount = latePaymentCount;
    }

    public Integer getMissedPaymentCount() {
        return missedPaymentCount;
    }

    public void setMissedPaymentCount(Integer missedPaymentCount) {
        this.missedPaymentCount = missedPaymentCount;
    }

    public Double getAvgDaysLate() {
        return avgDaysLate;
    }

    public void setAvgDaysLate(Double avgDaysLate) {
        this.avgDaysLate = avgDaysLate;
    }

    public Integer getMaxDaysLate() {
        return maxDaysLate;
    }

    public void setMaxDaysLate(Integer maxDaysLate) {
        this.maxDaysLate = maxDaysLate;
    }

    public Double getHistoricalOutstanding() {
        return historicalOutstanding;
    }

    public void setHistoricalOutstanding(Double historicalOutstanding) {
        this.historicalOutstanding = historicalOutstanding;
    }

    public Double getRentToIncomeRatio() {
        return rentToIncomeRatio;
    }

    public void setRentToIncomeRatio(Double rentToIncomeRatio) {
        this.rentToIncomeRatio = rentToIncomeRatio;
    }

    public Double getPaymentCompletionRatio() {
        return paymentCompletionRatio;
    }

    public void setPaymentCompletionRatio(Double paymentCompletionRatio) {
        this.paymentCompletionRatio = paymentCompletionRatio;
    }

    public Double getRecentLatePaymentCount3m() {
        return recentLatePaymentCount3m;
    }

    public void setRecentLatePaymentCount3m(Double recentLatePaymentCount3m) {
        this.recentLatePaymentCount3m = recentLatePaymentCount3m;
    }

    public Double getRecentMissedPaymentCount3m() {
        return recentMissedPaymentCount3m;
    }

    public void setRecentMissedPaymentCount3m(Double recentMissedPaymentCount3m) {
        this.recentMissedPaymentCount3m = recentMissedPaymentCount3m;
    }

    public Double getRecentAvgDaysLate3m() {
        return recentAvgDaysLate3m;
    }

    public void setRecentAvgDaysLate3m(Double recentAvgDaysLate3m) {
        this.recentAvgDaysLate3m = recentAvgDaysLate3m;
    }

    public Double getRecentPaymentCompletionRatio3m() {
        return recentPaymentCompletionRatio3m;
    }

    public void setRecentPaymentCompletionRatio3m(
            Double recentPaymentCompletionRatio3m) {
        this.recentPaymentCompletionRatio3m =
                recentPaymentCompletionRatio3m;
    }

    public Double getRecentLatePaymentCount6m() {
        return recentLatePaymentCount6m;
    }

    public void setRecentLatePaymentCount6m(
            Double recentLatePaymentCount6m) {
        this.recentLatePaymentCount6m =
                recentLatePaymentCount6m;
    }

    public Double getRecentMissedPaymentCount6m() {
        return recentMissedPaymentCount6m;
    }

    public void setRecentMissedPaymentCount6m(
            Double recentMissedPaymentCount6m) {
        this.recentMissedPaymentCount6m =
                recentMissedPaymentCount6m;
    }

    public Double getRecentAvgDaysLate6m() {
        return recentAvgDaysLate6m;
    }

    public void setRecentAvgDaysLate6m(
            Double recentAvgDaysLate6m) {
        this.recentAvgDaysLate6m =
                recentAvgDaysLate6m;
    }

    public Double getRecentPaymentCompletionRatio6m() {
        return recentPaymentCompletionRatio6m;
    }

    public void setRecentPaymentCompletionRatio6m(
            Double recentPaymentCompletionRatio6m) {
        this.recentPaymentCompletionRatio6m =
                recentPaymentCompletionRatio6m;
    }

    public Double getLatePaymentTrend() {
        return latePaymentTrend;
    }

    public void setLatePaymentTrend(Double latePaymentTrend) {
        this.latePaymentTrend = latePaymentTrend;
    }

    public Double getMissedPaymentTrend() {
        return missedPaymentTrend;
    }

    public void setMissedPaymentTrend(Double missedPaymentTrend) {
        this.missedPaymentTrend = missedPaymentTrend;
    }

    public Double getPaymentCompletionTrend() {
        return paymentCompletionTrend;
    }

    public void setPaymentCompletionTrend(
            Double paymentCompletionTrend) {
        this.paymentCompletionTrend =
                paymentCompletionTrend;
    }
}