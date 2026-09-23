
package com.rental.rental_management_backend.ai.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.rental_management_backend.ai.client.M2RecommendationClient;
import com.rental.rental_management_backend.ai.dto.AvailableUnitResponse;
import com.rental.rental_management_backend.ai.dto.M2RecommendationItem;
import com.rental.rental_management_backend.ai.dto.M2RecommendationRequest;
import com.rental.rental_management_backend.ai.dto.M2RecommendationResponse;
import com.rental.rental_management_backend.ai.service.PropertyRecommendationService;
import com.rental.rental_management_backend.property.dto.PropertyDetailsResponse;
import com.rental.rental_management_backend.property.entity.Unit;
import com.rental.rental_management_backend.property.enums.UnitStatus;
import com.rental.rental_management_backend.property.repository.UnitRepository;
import com.rental.rental_management_backend.property.service.PropertyDetailsService;
import com.rental.rental_management_backend.tenant.repository.TenantRepository;

@Service
@Transactional(readOnly = true)
public class PropertyRecommendationServiceImpl
        implements PropertyRecommendationService {

    private final TenantRepository tenantRepository;

    private final M2RecommendationClient m2RecommendationClient;

    private final UnitRepository unitRepository;

    private final PropertyDetailsService propertyDetailsService;

    public PropertyRecommendationServiceImpl(

            TenantRepository tenantRepository,

            M2RecommendationClient m2RecommendationClient,

            UnitRepository unitRepository,

            PropertyDetailsService propertyDetailsService) {

        this.tenantRepository = tenantRepository;

        this.m2RecommendationClient = m2RecommendationClient;

        this.unitRepository = unitRepository;

        this.propertyDetailsService = propertyDetailsService;
    }

    @Override
    public M2RecommendationResponse recommendProperties(

            Long tenantId,

            Integer topN) {

        /*
         * ============================================================
         * 1. VERIFY TENANT
         * ============================================================
         */

        tenantRepository.findById(tenantId)

                .orElseThrow(() ->

                        new RuntimeException(

                                "Tenant not found with ID: "
                                        + tenantId));

        /*
         * ============================================================
         * 2. VALIDATE topN
         * ============================================================
         */

        if (topN == null || topN <= 0) {

            throw new IllegalArgumentException(

                    "topN must be greater than 0");
        }

        /*
         * ============================================================
         * 3. CREATE M2 REQUEST
         * ============================================================
         *
         * M2 continues to receive exactly the same request.
         * No AI/FastAPI changes are required.
         */

        M2RecommendationRequest request =

                new M2RecommendationRequest(

                        String.valueOf(tenantId),

                        topN
                );

        /*
         * ============================================================
         * 4. CALL M2 AI SERVICE
         * ============================================================
         */

        M2RecommendationResponse response =

                m2RecommendationClient
                        .recommendProperties(request);

        /*
         * ============================================================
         * 5. ENRICH AI RECOMMENDATIONS WITH CURRENT DATABASE DATA
         * ============================================================
         */

        if (response != null

                && response.getRecommendations() != null) {

            /*
             * Get CURRENT vacant units from PostgreSQL.
             *
             * This means availability is checked every time
             * the recommendation API is called.
             */

            List<Unit> vacantUnits =

                    unitRepository.findByStatus(
                            UnitStatus.VACANT);

            /*
             * Process every property returned by M2.
             */

            for (M2RecommendationItem recommendation

                    : response.getRecommendations()) {

                /*
                 * ----------------------------------------------------
                 * PROPERTY ID VALIDATION
                 * ----------------------------------------------------
                 */

                if (recommendation.getPropertyId() == null) {

                    recommendation.setAvailableUnits(
                            new ArrayList<>());

                    recommendation.setPropertyDetails(null);

                    continue;
                }

                Long recommendedPropertyId;

                try {

                    recommendedPropertyId =

                            Long.valueOf(
                                    recommendation.getPropertyId());

                } catch (NumberFormatException ex) {

                    recommendation.setAvailableUnits(
                            new ArrayList<>());

                    recommendation.setPropertyDetails(null);

                    continue;
                }

                /*
                 * ----------------------------------------------------
                 * CURRENT PROPERTY DETAILS
                 * ----------------------------------------------------
                 *
                 * IMPORTANT:
                 *
                 * M2 gives us only the propertyId.
                 *
                 * We now use that propertyId to fetch the
                 * CURRENT property information from PostgreSQL.
                 *
                 * This reuses your existing:
                 *
                 * PropertyDetailsService
                 *
                 * and specifically:
                 *
                 * getPublicPropertyDetails(propertyId)
                 */

                try {

                    PropertyDetailsResponse propertyDetails =

                            propertyDetailsService
                                    .getPublicPropertyDetails(
                                            recommendedPropertyId);

                    recommendation.setPropertyDetails(
                            propertyDetails);

                } catch (Exception ex) {

                    /*
                     * If the property is no longer available
                     * for tenant browsing, do not expose stale
                     * property details.
                     */

                    recommendation.setPropertyDetails(null);
                }

                /*
                 * ----------------------------------------------------
                 * CURRENT AVAILABLE UNITS
                 * ----------------------------------------------------
                 */

                List<AvailableUnitResponse> availableUnits =

                        new ArrayList<>();

                for (Unit unit : vacantUnits) {

                    /*
                     * Safety checks for property hierarchy.
                     */

                    if (unit.getFloor() == null

                            || unit.getFloor()
                                    .getBuilding() == null

                            || unit.getFloor()
                                    .getBuilding()
                                    .getProperty() == null) {

                        continue;
                    }

                    Long unitPropertyId =

                            unit.getFloor()
                                    .getBuilding()
                                    .getProperty()
                                    .getPropertyId();

                    /*
                     * Add only units belonging to the
                     * currently recommended property.
                     */

                    if (recommendedPropertyId
                            .equals(unitPropertyId)) {

                        availableUnits.add(

                                new AvailableUnitResponse(

                                        unit.getUnitId(),

                                        unit.getMonthlyRent(),

                                        unit.getBedrooms()
                                )
                        );
                    }
                }

                /*
                 * Set CURRENT available units.
                 */

                recommendation.setAvailableUnits(
                        availableUnits);
            }
        }

        /*
         * ============================================================
         * 6. RETURN FINAL RESPONSE
         * ============================================================
         */

        return response;
    }
}
