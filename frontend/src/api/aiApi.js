import axiosClient from './axiosClient'

/**
 * AI Decision-Support & Predictive Analytics API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot AI insights list endpoint (e.g. GET /ai/insights)
export const getAIInsights = async () => {
  // return axiosClient.get('/ai/insights')
  throw new Error('TODO: Connect to Spring Boot backend /ai/insights')
}

// TODO: Replace with Spring Boot refresh telemetry endpoint (e.g. POST /ai/insights/refresh)
export const refreshAIInsights = async () => {
  // return axiosClient.post('/ai/insights/refresh')
  throw new Error('TODO: Connect to Spring Boot backend /ai/insights/refresh')
}

// TODO: Replace with Spring Boot rent recommendation endpoint (e.g. GET /ai/properties/{id}/rent-recommendation)
export const getRentRecommendation = async (propertyId) => {
  // return axiosClient.get(`/ai/properties/${propertyId}/rent-recommendation`)
  throw new Error(`TODO: Connect to Spring Boot backend /ai/properties/${propertyId}/rent-recommendation`)
}

// TODO: Replace with Spring Boot predictive maintenance endpoint (e.g. GET /ai/maintenance/predictive-alerts)
export const getPredictiveMaintenanceAlerts = async () => {
  // return axiosClient.get('/ai/maintenance/predictive-alerts')
  throw new Error('TODO: Connect to Spring Boot backend /ai/maintenance/predictive-alerts')
}

/**
 * AI Property Recommendation Module (M2)
 * Spring Boot Endpoint: GET /api/ai/recommendations
 *
 * Communicates ONLY with Spring Boot (which orchestrates with the AI/ML service).
 * Request: GET /ai/recommendations?tenantId={tenantId}&topN={topN}
 *
 * @param {number|string} tenantId - Authenticated tenant ID (Long)
 * @param {number} [topN=5] - Number of recommendations to retrieve
 * @returns {Promise<Object>} M2RecommendationResponse { success, tenantId, recommendations, count, modelVersion }
 */
export const getPropertyRecommendations = async (tenantId, topN = 5) => {
  if (!tenantId) {
    throw new Error('A valid tenantId is required to retrieve property recommendations.')
  }
  return await axiosClient.get('/ai/recommendations', {
    params: {
      tenantId,
      topN,
    },
  })
}
