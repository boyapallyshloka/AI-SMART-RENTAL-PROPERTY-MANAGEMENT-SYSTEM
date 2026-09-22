package com.rental.rental_management_backend.ai.service;

import com.rental.rental_management_backend.ai.dto.M2RecommendationResponse;

public interface PropertyRecommendationService {

    M2RecommendationResponse recommendProperties(
            Long tenantId,
            Integer topN
    );
}
