
package com.rental.rental_management_backend.ai.service;

import com.rental.rental_management_backend.ai.dto.RentalDemandPreviewRequestDTO;
import com.rental.rental_management_backend.ai.dto.RentalDemandResponseDTO;


public interface RentalDemandService {

    RentalDemandResponseDTO predictRentalDemand(
            RentalDemandPreviewRequestDTO request);
}
