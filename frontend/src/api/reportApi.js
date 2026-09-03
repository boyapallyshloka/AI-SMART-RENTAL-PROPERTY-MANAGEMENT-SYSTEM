import axiosClient from './axiosClient'

/**
 * Financial Reports & Analytics API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot financial summary endpoint (e.g. GET /reports/summary)
export const getFinancialSummary = async () => {
  // return axiosClient.get('/reports/summary')
  throw new Error('TODO: Connect to Spring Boot backend /reports/summary')
}

// TODO: Replace with Spring Boot monthly income trend endpoint (e.g. GET /reports/income-trend)
export const getIncomeTrend = async (months = 6) => {
  // return axiosClient.get('/reports/income-trend', { params: { months } })
  throw new Error('TODO: Connect to Spring Boot backend /reports/income-trend')
}

// TODO: Replace with Spring Boot occupancy trend endpoint (e.g. GET /reports/occupancy-trend)
export const getOccupancyTrend = async (months = 6) => {
  // return axiosClient.get('/reports/occupancy-trend', { params: { months } })
  throw new Error('TODO: Connect to Spring Boot backend /reports/occupancy-trend')
}

// TODO: Replace with Spring Boot property performance endpoint (e.g. GET /reports/property-performance)
export const getPropertyPerformance = async () => {
  // return axiosClient.get('/reports/property-performance')
  throw new Error('TODO: Connect to Spring Boot backend /reports/property-performance')
}
