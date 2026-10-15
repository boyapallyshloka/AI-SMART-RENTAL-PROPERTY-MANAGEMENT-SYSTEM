package com.rental.rental_management_backend.expense.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.expense.entity.ExpenseReceipt;

public interface ExpenseReceiptRepository
        extends JpaRepository<ExpenseReceipt, Long> {

    Optional<ExpenseReceipt> findByExpense_ExpenseId(Long expenseId);

    Optional<ExpenseReceipt> findByReceiptNumber(String receiptNumber);
}