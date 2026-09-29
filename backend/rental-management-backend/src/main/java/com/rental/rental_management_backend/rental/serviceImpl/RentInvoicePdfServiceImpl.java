package com.rental.rental_management_backend.rental.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.rental.entity.RentInvoice;
import com.rental.rental_management_backend.rental.service.RentInvoicePdfService;

@Service
public class RentInvoicePdfServiceImpl implements RentInvoicePdfService {

    private static final String UPLOAD_DIR =
            "uploads/invoices/";

    @Override
    public String generateInvoicePdf(RentInvoice invoice) {

        try {

            // Create invoice directory if it does not exist
            Path uploadPath = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique PDF file name
            String fileName =
                    "invoice_"
                    + invoice.getInvoiceId()
                    + "_"
                    + UUID.randomUUID()
                    + ".pdf";

            Path filePath = uploadPath.resolve(fileName);

            // Create PDF document
            try (PDDocument document = new PDDocument()) {

                PDPage page = new PDPage();

                document.addPage(page);

                try (PDPageContentStream contentStream =
                        new PDPageContentStream(document, page)) {

                    float y = 750;

                    // Title
                    contentStream.beginText();

                    contentStream.setFont(
                            new PDType1Font(
                                    Standard14Fonts.FontName.HELVETICA_BOLD
                            ),
                            20
                    );

                    contentStream.newLineAtOffset(200, y);

                    contentStream.showText("RENT INVOICE");

                    contentStream.endText();

                    y -= 50;

                    // Invoice Number
                    writeLine(
                            contentStream,
                            "Invoice Number: "
                                    + invoice.getInvoiceNumber(),
                            y
                    );

                    y -= 25;

                    // Billing Period
                    writeLine(
                            contentStream,
                            "Billing Period: "
                                    + invoice.getBillingMonth()
                                    + "/"
                                    + invoice.getBillingYear(),
                            y
                    );

                    y -= 25;

                    // Invoice Date
                    writeLine(
                            contentStream,
                            "Invoice Date: "
                                    + invoice.getInvoiceDate(),
                            y
                    );

                    y -= 25;

                    // Due Date
                    writeLine(
                            contentStream,
                            "Due Date: "
                                    + invoice.getDueDate(),
                            y
                    );

                    y -= 40;

                    // Tenant
                    writeLine(
                            contentStream,
                            "Tenant ID: "
                                    + invoice.getTenantId(),
                            y
                    );

                    y -= 25;

                    // Unit
                    writeLine(
                            contentStream,
                            "Unit ID: "
                                    + invoice.getUnitId(),
                            y
                    );

                    y -= 40;

                    // Rent
                    writeLine(
                            contentStream,
                            "Rent Amount: INR "
                                    + invoice.getRentAmount(),
                            y
                    );

                    y -= 25;

                    // Late Fee
                    writeLine(
                            contentStream,
                            "Late Fee: INR "
                                    + invoice.getLateFee(),
                            y
                    );

                    y -= 25;

                    // Total
                    writeLine(
                            contentStream,
                            "Total Amount: INR "
                                    + invoice.getTotalAmount(),
                            y
                    );

                    y -= 25;

                    // Status
                    writeLine(
                            contentStream,
                            "Status: "
                                    + invoice.getStatus(),
                            y
                    );
                }

                document.save(filePath.toFile());
            }

            // Path stored in database
            return "/uploads/invoices/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to generate invoice PDF",
                    e
            );
        }
    }

    private void writeLine(
            PDPageContentStream contentStream,
            String text,
            float y) throws IOException {

        contentStream.beginText();

        contentStream.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA
                ),
                12
        );

        contentStream.newLineAtOffset(70, y);

        contentStream.showText(text);

        contentStream.endText();
    }
}