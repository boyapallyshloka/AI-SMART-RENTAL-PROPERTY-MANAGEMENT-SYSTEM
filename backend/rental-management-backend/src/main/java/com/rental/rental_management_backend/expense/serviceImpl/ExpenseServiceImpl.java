package com.rental.rental_management_backend.expense.serviceImpl;

import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.repository.PropertyRepository;

import com.rental.rental_management_backend.expense.dto.ExpenseCreateRequest;
import com.rental.rental_management_backend.expense.dto.ExpenseResponse;
import com.rental.rental_management_backend.expense.dto.ExpenseUpdateRequest;
import com.rental.rental_management_backend.expense.entity.Expense;
import com.rental.rental_management_backend.expense.repository.ExpenseRepository;
import com.rental.rental_management_backend.expense.service.ExpenseService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    private final PropertyRepository propertyRepository;

    private static final String IMAGE_DIRECTORY =
            "uploads/expense-images/";

    public ExpenseServiceImpl(
            ExpenseRepository expenseRepository,
            PropertyRepository propertyRepository) {

        this.expenseRepository = expenseRepository;
        this.propertyRepository = propertyRepository;
    }

    // =========================
    // CREATE EXPENSE
    // =========================

    @Override
    @Transactional
    public ExpenseResponse createExpense(
            ExpenseCreateRequest request,
            MultipartFile image) {

        Property property =
                propertyRepository.findById(
                        request.getPropertyId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Property not found"
                        )
                );

        Expense expense = new Expense();

        expense.setProperty(property);

        expense.setCategory(
                request.getCategory()
        );

        expense.setDescription(
                request.getDescription()
        );

        expense.setAmount(
                request.getAmount()
        );

        expense.setExpenseDate(
                request.getExpenseDate()
        );

        // =========================
        // IMAGE IS OPTIONAL
        // =========================

        if (image != null && !image.isEmpty()) {

            String imagePath = saveImage(image);

            expense.setImagePath(imagePath);

        } else {

            // No image uploaded.
            // Expense will still be created.

            expense.setImagePath(null);
        }

        Expense savedExpense =
                expenseRepository.save(expense);

        return mapToResponse(savedExpense);
    }

    // =========================
    // GET EXPENSE BY ID
    // =========================

    @Override
    public ExpenseResponse getExpense(Long expenseId) {

        Expense expense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Expense not found"
                                )
                        );

        return mapToResponse(expense);
    }

    // =========================
    // GET EXPENSES BY PROPERTY
    // =========================

    @Override
    public List<ExpenseResponse> getExpensesByProperty(
            Long propertyId) {

        return expenseRepository
                .findByProperty_PropertyId(propertyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // UPDATE EXPENSE
    // =========================

    @Override
    @Transactional
    public ExpenseResponse updateExpense(
            Long expenseId,
            ExpenseUpdateRequest request) {

        Expense expense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Expense not found"
                                )
                        );

        // =========================
        // UPDATE PROPERTY
        // =========================

        if (request.getPropertyId() != null) {

            Property property =
                    propertyRepository.findById(
                            request.getPropertyId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Property not found"
                            )
                    );

            expense.setProperty(property);
        }

        // =========================
        // UPDATE CATEGORY
        // =========================

        if (request.getCategory() != null) {

            expense.setCategory(
                    request.getCategory()
            );
        }

        // =========================
        // UPDATE DESCRIPTION
        // =========================

        if (request.getDescription() != null) {

            expense.setDescription(
                    request.getDescription()
            );
        }

        // =========================
        // UPDATE AMOUNT
        // =========================

        if (request.getAmount() != null) {

            expense.setAmount(
                    request.getAmount()
            );
        }

        // =========================
        // UPDATE EXPENSE DATE
        // =========================

        if (request.getExpenseDate() != null) {

            expense.setExpenseDate(
                    request.getExpenseDate()
            );
        }

        Expense updated =
                expenseRepository.save(expense);

        return mapToResponse(updated);
    }

    // =========================
    // DELETE EXPENSE
    // =========================

    @Override
    @Transactional
    public void deleteExpense(Long expenseId) {

        Expense expense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Expense not found"
                                )
                        );

        expenseRepository.delete(expense);
    }

    // =========================
    // SAVE IMAGE
    // =========================

    private String saveImage(
            MultipartFile image) {

        try {

            Path directory =
                    Paths.get(IMAGE_DIRECTORY);

            if (!Files.exists(directory)) {

                Files.createDirectories(directory);
            }

            String originalName =
                    image.getOriginalFilename();

            String extension = "";

            if (originalName != null
                    && originalName.contains(".")) {

                extension =
                        originalName.substring(
                                originalName.lastIndexOf(".")
                        );
            }

            String fileName =
                    UUID.randomUUID()
                            + extension;

            Path filePath =
                    directory.resolve(fileName);

            Files.copy(
                    image.getInputStream(),
                    filePath
            );

            return filePath.toString();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save expense image",
                    e
            );
        }
    }

    // =========================
    // MAP ENTITY TO RESPONSE
    // =========================

    private ExpenseResponse mapToResponse(
            Expense expense) {

        ExpenseResponse response =
                new ExpenseResponse();

        response.setExpenseId(
                expense.getExpenseId()
        );

        response.setPropertyId(
                expense.getProperty()
                        .getPropertyId()
        );

        response.setCategory(
                expense.getCategory()
        );

        response.setDescription(
                expense.getDescription()
        );

        response.setAmount(
                expense.getAmount()
        );

        response.setExpenseDate(
                expense.getExpenseDate()
        );

        response.setImagePath(
                expense.getImagePath()
        );

        response.setCreatedAt(
                expense.getCreatedAt()
        );

        return response;
    }
}