package com.rental.rental_management_backend.rental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RentInvoiceRequest {

    @NotNull(message = "Agreement ID is required")
    private Long agreementId;

	public Long getAgreementId() {
		return agreementId;
	}

	public void setAgreementId(Long agreementId) {
		this.agreementId = agreementId;
	}
    
}