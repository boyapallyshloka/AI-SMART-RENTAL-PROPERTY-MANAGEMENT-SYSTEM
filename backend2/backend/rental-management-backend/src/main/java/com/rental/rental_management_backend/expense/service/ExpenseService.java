package com.rental.rental_management_backend.expense.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.expense.dto.ExpenseCreateRequest;
import com.rental.rental_management_backend.expense.dto.ExpenseResponse;
import com.rental.rental_management_backend.expense.dto.ExpenseUpdateRequest;

public interface ExpenseService {

    ExpenseResponse createExpense(
            ExpenseCreateRequest request,
            MultipartFile image
    );

    ExpenseResponse getExpense(Long expenseId);

    List<ExpenseResponse> getExpensesByProperty(Long propertyId);

    ExpenseResponse updateExpense(
            Long expenseId,
            ExpenseUpdateRequest request
    );

    void deleteExpense(Long expenseId);
}