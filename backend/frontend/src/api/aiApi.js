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
