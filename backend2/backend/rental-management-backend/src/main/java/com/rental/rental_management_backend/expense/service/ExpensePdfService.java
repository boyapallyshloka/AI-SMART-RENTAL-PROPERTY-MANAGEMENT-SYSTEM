package com.rental.rental_management_backend.expense.service;

import com.rental.rental_management_backend.expense.entity.Expense;

public interface ExpensePdfService {

    String generateExpenseReceiptPdf(Expense expense, String receiptNumber);
}