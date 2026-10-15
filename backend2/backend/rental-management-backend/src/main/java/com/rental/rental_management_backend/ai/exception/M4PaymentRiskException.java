
package com.rental.rental_management_backend.ai.exception;

public class M4PaymentRiskException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String errorCode;

    public M4PaymentRiskException(
            String errorCode,
            String message) {

        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
