package com.rental.rental_management_backend.expense.repository;

import com.rental.rental_management_backend.expense.entity.ExpenseReceipt;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExpenseReceiptRepository
        extends JpaRepository<ExpenseReceipt, Long> {

    Optional<ExpenseReceipt> findByExpense_ExpenseId(Long expenseId);

    Optional<ExpenseReceipt> findByReceiptNumber(String receiptNumber);
}