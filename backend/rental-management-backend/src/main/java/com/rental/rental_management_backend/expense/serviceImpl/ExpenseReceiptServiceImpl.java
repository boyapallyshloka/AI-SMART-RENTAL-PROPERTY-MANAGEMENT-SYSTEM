package com.rental.rental_management_backend.expense.serviceImpl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.User.Repository.UserRepository;
import com.rental.rental_management_backend.User.entity.User;
import com.rental.rental_management_backend.User.enums.RoleType;
import com.rental.rental_management_backend.expense.entity.Expense;
import com.rental.rental_management_backend.expense.entity.ExpenseReceipt;
import com.rental.rental_management_backend.expense.repository.ExpenseReceiptRepository;
import com.rental.rental_management_backend.expense.repository.ExpenseRepository;
import com.rental.rental_management_backend.expense.service.ExpensePdfService;
import com.rental.rental_management_backend.expense.service.ExpenseReceiptService;
import com.rental.rental_management_backend.property.entity.Property;
import com.rental.rental_management_backend.property.entity.PropertyManager;
import com.rental.rental_management_backend.property.repository.PropertyManagerRepository;

@Service
public class ExpenseReceiptServiceImpl
        implements ExpenseReceiptService {

    private final ExpenseRepository expenseRepository;

    private final ExpenseReceiptRepository expenseReceiptRepository;

    private final ExpensePdfService expensePdfService;

    private final UserRepository userRepository;

    private final PropertyManagerRepository propertyManagerRepository;

    private final Path receiptDirectory =
            Paths.get("uploads/expense-receipts");

    public ExpenseReceiptServiceImpl(
            ExpenseRepository expenseRepository,
            ExpenseReceiptRepository expenseReceiptRepository,
            ExpensePdfService expensePdfService,
            UserRepository userRepository,
            PropertyManagerRepository propertyManagerRepository) {

        this.expenseRepository = expenseRepository;

        this.expenseReceiptRepository =
                expenseReceiptRepository;

        this.expensePdfService =
                expensePdfService;

        this.userRepository =
                userRepository;

        this.propertyManagerRepository =
                propertyManagerRepository;
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

        // Check whether logged-in user can access
        // the property associated with this expense.
        checkPropertyAccess(expense.getProperty());

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

        // Find expense
        Expense expense =
                expenseRepository.findById(expenseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Expense not found with id: "
                                                + expenseId
                                )
                        );

        // Check property access
        checkPropertyAccess(expense.getProperty());

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

    // =========================================
    // PROPERTY ACCESS AUTHORIZATION
    // =========================================

    private void checkPropertyAccess(Property property) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        /*
         * JWT authentication stores the user's
         * email as the authentication name.
         */
        String email =
                authentication.getName();

        User loggedInUser =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"
                                )
                        );

        RoleType role =
                loggedInUser.getRole();

        // =========================================
        // SUPER ADMIN
        // =========================================

        if (role == RoleType.SUPER_ADMIN) {

            // SUPER_ADMIN can access all properties.
            return;
        }

        // =========================================
        // PROPERTY OWNER
        // =========================================

        if (role == RoleType.PROPERTY_OWNER) {

            User propertyOwner =
                    property.getOwner();

            if (propertyOwner == null ||
                    !propertyOwner.getId()
                            .equals(loggedInUser.getId())) {

                throw new RuntimeException(
                        "You do not have access to this property"
                );
            }

            return;
        }

        // =========================================
        // PROPERTY MANAGER
        // =========================================

        if (role == RoleType.PROPERTY_MANAGER) {

            PropertyManager propertyManager =
                    property.getPropertyManager();

            if (propertyManager == null) {

                throw new RuntimeException(
                        "This property is not assigned to a manager"
                );
            }

            PropertyManager loggedInManager =
                    propertyManagerRepository
                            .findByUser(loggedInUser)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Property manager record not found"
                                    )
                            );

            if (!propertyManager
                    .getPropertyManagerId()
                    .equals(
                            loggedInManager
                                    .getPropertyManagerId())) {

                throw new RuntimeException(
                        "You do not have access to this property"
                );
            }

            return;
        }

        // =========================================
        // OTHER ROLES
        // =========================================

        throw new RuntimeException(
                "You do not have permission to access expense receipts"
        );
    }
}