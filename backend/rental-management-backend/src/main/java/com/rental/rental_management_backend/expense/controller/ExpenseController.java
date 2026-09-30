package com.rental.rental_management_backend.expense.controller;

import com.rental.rental_management_backend.expense.dto.ExpenseCreateRequest;
import com.rental.rental_management_backend.expense.dto.ExpenseResponse;
import com.rental.rental_management_backend.expense.dto.ExpenseUpdateRequest;
import com.rental.rental_management_backend.expense.enums.ExpenseCategory;
import com.rental.rental_management_backend.expense.service.ExpenseReceiptService;
import com.rental.rental_management_backend.expense.service.ExpenseService;

import jakarta.validation.Valid;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseReceiptService receiptService;

    public ExpenseController(
            ExpenseService expenseService,
            ExpenseReceiptService receiptService) {

        this.expenseService = expenseService;
        this.receiptService = receiptService;
    }

    // =========================================================
    // 1. CREATE EXPENSE
    // =========================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ExpenseResponse> createExpense(

            @RequestParam("propertyId")
            Long propertyId,

            @RequestParam("category")
            ExpenseCategory category,

            @RequestParam(value = "description", required = false)
            String description,

            @RequestParam("amount")
            BigDecimal amount,

            @RequestParam("expenseDate")
            LocalDate expenseDate,

            // Image is optional for every category
            @RequestPart(value = "image", required = false)
            MultipartFile image) {

        ExpenseCreateRequest request =
                new ExpenseCreateRequest();

        request.setPropertyId(propertyId);
        request.setCategory(category);
        request.setDescription(description);
        request.setAmount(amount);
        request.setExpenseDate(expenseDate);

        return ResponseEntity.ok(
                expenseService.createExpense(
                        request,
                        image
                )
        );
    }

    // =========================================================
    // 2. GET EXPENSE
    // =========================================================

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpense(
            @PathVariable Long expenseId) {

        return ResponseEntity.ok(
                expenseService.getExpense(expenseId)
        );
    }

    // =========================================================
    // 3. GET EXPENSES BY PROPERTY
    // =========================================================

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByProperty(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                expenseService.getExpensesByProperty(
                        propertyId
                )
        );
    }

    // =========================================================
    // 4. UPDATE EXPENSE
    // =========================================================

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(

            @PathVariable Long expenseId,

            @Valid @RequestBody ExpenseUpdateRequest request) {

        return ResponseEntity.ok(
                expenseService.updateExpense(
                        expenseId,
                        request
                )
        );
    }

    // =========================================================
    // 5. DELETE EXPENSE
    // =========================================================

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long expenseId) {

        expenseService.deleteExpense(expenseId);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // 6. GENERATE RECEIPT
    // =========================================================

    @PostMapping("/{expenseId}/receipt")
    public ResponseEntity<String> generateReceipt(
            @PathVariable Long expenseId) {

        String pdfPath =
                receiptService.generateReceipt(
                        expenseId
                );

        return ResponseEntity.ok(pdfPath);
    }

    // =========================================================
    // 7. DOWNLOAD RECEIPT
    // =========================================================

    @GetMapping("/{expenseId}/receipt")
    public ResponseEntity<Resource> downloadReceipt(
            @PathVariable Long expenseId) {

        String pdfPath =
                receiptService.getReceiptPdfPath(
                        expenseId
                );

        Path path = Paths.get(pdfPath);

        Resource resource =
                new FileSystemResource(path);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                path.getFileName() +
                                "\""
                )
                .body(resource);
    }
}