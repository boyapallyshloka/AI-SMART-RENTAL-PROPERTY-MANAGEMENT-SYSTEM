package com.rental.rental_management_backend.expense.serviceImpl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.expense.entity.Expense;
import com.rental.rental_management_backend.expense.entity.ExpenseReceipt;
import com.rental.rental_management_backend.expense.repository.ExpenseReceiptRepository;
import com.rental.rental_management_backend.expense.repository.ExpenseRepository;
import com.rental.rental_management_backend.expense.service.ExpensePdfService;
import com.rental.rental_management_backend.expense.service.ExpenseReceiptService;

@Service
public class ExpenseReceiptServiceImpl
        implements ExpenseReceiptService {

    private final ExpenseRepository expenseRepository;

    private final ExpenseReceiptRepository expenseReceiptRepository;

    private final ExpensePdfService expensePdfService;

    private final Path receiptDirectory =
            Paths.get("uploads/expense-receipts");

    public ExpenseReceiptServiceImpl(
            ExpenseRepository expenseRepository,
            ExpenseReceiptRepository expenseReceiptRepository,
            ExpensePdfService expensePdfService) {

        this.expenseRepository = expenseRepository;
        this.expenseReceiptRepository =
                expenseReceiptRepository;
        this.expensePdfService = expensePdfService;
    }

    // =========================================
    // GENERATE PDF RECEIPT
    // =========================================

    @Override
    @Transactional
    public String generateReceipt(Long expenseId) {

        // Find the expense
        Expense expense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Expense not found with id: "
                                                + expenseId
                                )
                        );

        // Receipt number
        String receiptNumber =
                "EXP-" + expense.getExpenseId();

        // PDF file name
        String fileName =
                "expense-receipt-"
                        + expense.getExpenseId()
                        + ".pdf";

        // PDF path
        Path receiptPath =
                receiptDirectory.resolve(fileName);

        // Generate PDF
        String pdfPath =
                expensePdfService.generateExpenseReceiptPdf(
                        expense,
                        receiptNumber
                );

        /*
         * =========================================
         * SAVE RECEIPT INFORMATION IN DATABASE
         * =========================================
         */

        // Check whether receipt already exists
        ExpenseReceipt receipt =
                expenseReceiptRepository
                        .findByExpense_ExpenseId(expenseId)
                        .orElse(null);

        if (receipt == null) {

            // Create new receipt
            receipt = new ExpenseReceipt();

            receipt.setExpense(expense);

            receipt.setReceiptNumber(
                    receiptNumber
            );

        } else {

            // Update existing receipt
            receipt.setReceiptNumber(
                    receiptNumber
            );
        }

        receipt.setPdfPath(pdfPath);

        /*
         * Save the receipt into
         * expense_receipts table.
         */
        expenseReceiptRepository.save(receipt);

        return pdfPath;
    }

    // =========================================
    // GET PDF RECEIPT PATH
    // =========================================

    @Override
    public String getReceiptPdfPath(Long expenseId) {

        // Check expense exists
        expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense not found with id: "
                                        + expenseId
                        )
                );

        /*
         * Get receipt information from database.
         */
        ExpenseReceipt receipt =
                expenseReceiptRepository
                        .findByExpense_ExpenseId(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receipt not found for expense id: "
                                                + expenseId
                                )
                        );

        String pdfPath =
                receipt.getPdfPath();

        Path receiptPath =
                Paths.get(pdfPath);

        /*
         * Check whether PDF file actually exists.
         */
        if (!Files.exists(receiptPath)) {

            throw new RuntimeException(
                    "Receipt PDF file not found for expense id: "
                            + expenseId
            );
        }

        return receiptPath.toString();
    }
}