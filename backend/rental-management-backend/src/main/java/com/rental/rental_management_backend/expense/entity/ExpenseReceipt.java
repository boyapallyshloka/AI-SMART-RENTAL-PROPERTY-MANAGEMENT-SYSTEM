package com.rental.rental_management_backend.expense.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "expense_receipts")
public class ExpenseReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_id", nullable = false, unique = true)
    private Expense expense;

    @Column(name = "receipt_number", nullable = false, unique = true)
    private String receiptNumber;

    @Column(name = "pdf_path", nullable = false)
    private String pdfPath;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }

    public Long getReceiptId() {
        return receiptId;
    }

    public Expense getExpense() {
        return expense;
    }

    public void setExpense(Expense expense) {
        this.expense = expense;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getPdfPath() {
        return pdfPath;
    }

    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
}