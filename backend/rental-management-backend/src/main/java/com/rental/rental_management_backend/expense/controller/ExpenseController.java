package com.rental.rental_management_backend.expense.controller;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rental.rental_management_backend.expense.dto.ExpenseCreateRequest;
import com.rental.rental_management_backend.expense.dto.ExpenseResponse;
import com.rental.rental_management_backend.expense.dto.ExpenseUpdateRequest;
import com.rental.rental_management_backend.expense.enums.ExpenseCategory;
import com.rental.rental_management_backend.expense.service.ExpenseReceiptService;
import com.rental.rental_management_backend.expense.service.ExpenseService;

import jakarta.validation.Valid;

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
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
    public ResponseEntity<ExpenseResponse> createExpense(

            @RequestParam("propertyId")
            Long propertyId,

            @RequestParam("category")
            ExpenseCategory category,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            @RequestParam("amount")
            BigDecimal amount,

            @RequestParam("expenseDate")
            LocalDate expenseDate,

            @RequestPart(
                    value = "image",
                    required = false
            )
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
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
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
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
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
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
    public ResponseEntity<ExpenseResponse> updateExpense(

            @PathVariable Long expenseId,

            @Valid
            @RequestBody
            ExpenseUpdateRequest request) {

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
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
    public ResponseEntity<Void> deleteExpense(

            @PathVariable Long expenseId) {

        expenseService.deleteExpense(expenseId);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // 6. GENERATE RECEIPT
    // =========================================================

    @PostMapping("/{expenseId}/receipt")
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
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
    @PreAuthorize(
            "hasAnyRole('SUPER_ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER')"
    )
    public ResponseEntity<Resource> downloadReceipt(

            @PathVariable Long expenseId) {

        String pdfPath =
                receiptService.getReceiptPdfPath(
                        expenseId
                );

        Path path =
                Paths.get(pdfPath);

        Resource resource =
                new FileSystemResource(path);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + path.getFileName()
                                + "\""
                )
                .body(resource);
    }
}