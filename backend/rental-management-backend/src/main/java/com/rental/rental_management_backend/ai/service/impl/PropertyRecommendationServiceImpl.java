package com.rental.rental_management_backend.ai.service.impl;

import org.springframework.stereotype.Service;

import com.rental.rental_management_backend.ai.client.M2RecommendationClient;
import com.rental.rental_management_backend.ai.dto.M2RecommendationRequest;
import com.rental.rental_management_backend.ai.dto.M2RecommendationResponse;
import com.rental.rental_management_backend.ai.service.PropertyRecommendationService;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
public class PropertyRecommendationServiceImpl
        implements PropertyRecommendationService {

    private final TenantRepository tenantRepository;
    private final M2RecommendationClient m2RecommendationClient;

    public PropertyRecommendationServiceImpl(
            TenantRepository tenantRepository,
            M2RecommendationClient m2RecommendationClient) {

        this.tenantRepository = tenantRepository;
        this.m2RecommendationClient = m2RecommendationClient;
    }

    @Override
    public M2RecommendationResponse recommendProperties(
            Long tenantId,
            Integer topN) {

        // Verify that the tenant exists
        tenantRepository.findById(tenantId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tenant not found with ID: " + tenantId));

        // Validate topN
        if (topN == null || topN <= 0) {
            throw new IllegalArgumentException(
                    "topN must be greater than 0");
        }

        // M2 expects tenantId as String
        M2RecommendationRequest request =
                new M2RecommendationRequest(
                        String.valueOf(tenantId),
                        topN
                );

        // Call M2 AI recommendation service
        return m2RecommendationClient.recommendProperties(request);
    }
}