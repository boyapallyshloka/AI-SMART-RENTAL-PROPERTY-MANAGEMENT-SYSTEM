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
 * Request: GET /ai/recommendations?tenantId={tenantId}&topN={topN}&currentLatitude=...&currentLongitude=...&currentAddress=...
 *
 * @param {number|string} tenantId - Authenticated tenant ID (Long)
 * @param {number} [topN=5] - Number of recommendations to retrieve
 * @param {Object} [locationContext={}] - Optional tenant location context
 * @param {number} [locationContext.currentLatitude] - Optional latitude
 * @param {number} [locationContext.currentLongitude] - Optional longitude
 * @param {string} [locationContext.currentAddress] - Optional address
 * @returns {Promise<Object>} M2RecommendationResponse { success, tenantId, recommendations, count, modelVersion }
 */
export const getPropertyRecommendations = async (
  tenantId,
  topN = 5,
  locationContext = {}
) => {
  if (!tenantId) {
    throw new Error('A valid tenantId is required to retrieve property recommendations.')
  }

  const params = {
    tenantId,
    topN,
  }

  if (locationContext?.currentLatitude != null && !isNaN(Number(locationContext.currentLatitude))) {
    params.currentLatitude = Number(locationContext.currentLatitude)
  }

  if (locationContext?.currentLongitude != null && !isNaN(Number(locationContext.currentLongitude))) {
    params.currentLongitude = Number(locationContext.currentLongitude)
  }

  if (
    typeof locationContext?.currentAddress === 'string' &&
    locationContext.currentAddress.trim() !== ''
  ) {
    params.currentAddress = locationContext.currentAddress.trim()
  }

  return await axiosClient.get('/ai/recommendations', {
    params,
    timeout: 60000,
  })
}

/**
 * AI Rent Prediction Module (M1)
 * Spring Boot Endpoint: POST /api/ai/rent-prediction/predict-unit
 *
 * Request body:
 * {
 *   floorId: number,
 *   area: number,
 *   bedrooms: number,
 *   bathrooms: number
 * }
 *
 * Note: Amenities are NOT sent from the frontend because Spring Boot automatically
 * loads and enriches them from the saved property in the database.
 * For the M1 model schema, area, bedrooms, and bathrooms must be strictly greater than 0.
 *
 * @param {Object} data
 * @param {number} data.floorId - Associated floor ID (Long, positive)
 * @param {number} data.area - Unit area in sqft (Double, strictly > 0)
 * @param {number} data.bedrooms - Number of bedrooms (Integer, strictly > 0)
 * @param {number} data.bathrooms - Number of bathrooms (Integer/Double, strictly > 0)
 * @returns {Promise<Object>} { predictedRent: number }
 */
export const predictUnitRent = async ({ floorId, area, bedrooms, bathrooms }) => {
  return await axiosClient.post('/ai/rent-prediction/predict-unit', {
    floorId: Number(floorId),
    area: Number(area),
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
  })
}

export const predictRent = predictUnitRent


