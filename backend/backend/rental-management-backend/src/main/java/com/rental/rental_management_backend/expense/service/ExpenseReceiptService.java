package com.rental.rental_management_backend.expense.service;

public interface ExpenseReceiptService {

    String generateReceipt(Long expenseId);
    String getReceiptPdfPath(Long expenseId);
}