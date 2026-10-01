package com.rental.rental_management_backend.expense.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.rental_management_backend.expense.entity.Expense;
import com.rental.rental_management_backend.expense.enums.ExpenseCategory;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByProperty_PropertyId(Long propertyId);

    List<Expense> findByProperty_PropertyIdAndCategory(
            Long propertyId,
            ExpenseCategory category
    );

    List<Expense> findByProperty_PropertyIdAndExpenseDateBetween(
            Long propertyId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Expense> findByProperty_PropertyIdAndCategoryAndExpenseDateBetween(
            Long propertyId,
            ExpenseCategory category,
            LocalDate startDate,
            LocalDate endDate
    );
}