import axiosClient from './axiosClient'

/**
 * Platform Reports & Analytics API Service
 *
 * Current Backend Status:
 * The Spring Boot backend currently supports raw transaction records via:
 * - RentInvoiceController: GET /api/rent-invoices (getAllInvoices)
 *
 * However, aggregated analytical reporting endpoints (/api/reports/*)
 * have not been implemented in Spring Boot.
 *
 * The signatures below document the exact endpoints and contracts required.
 * To adhere to strict data integrity rules, no mock data or synthetic
 * fallback metrics are returned.
 */

/**
 * Expected Endpoint: GET /api/reports/summary
 * Role: SUPER_ADMIN, PROPERTY_OWNER
 */
export const getFinancialSummary = async () => {
  throw new Error(
    'Backend endpoint GET /api/reports/summary is not implemented in Spring Boot.'
  )
}

/**
 * Expected Endpoint: GET /api/reports/income-trend?months=6
 * Role: SUPER_ADMIN, PROPERTY_OWNER
 */
export const getIncomeTrend = async (months = 6) => {
  throw new Error(
    `Backend endpoint GET /api/reports/income-trend?months=${months} is not implemented in Spring Boot.`
  )
}

/**
 * Expected Endpoint: GET /api/reports/occupancy-trend?months=6
 * Role: SUPER_ADMIN, PROPERTY_OWNER
 */
export const getOccupancyTrend = async (months = 6) => {
  throw new Error(
    `Backend endpoint GET /api/reports/occupancy-trend?months=${months} is not implemented in Spring Boot.`
  )
}

/**
 * Expected Endpoint: GET /api/reports/property-performance
 * Role: SUPER_ADMIN, PROPERTY_OWNER
 */
export const getPropertyPerformance = async () => {
  throw new Error(
    'Backend endpoint GET /api/reports/property-performance is not implemented in Spring Boot.'
  )
}

/**
 * Expected Endpoint: POST /api/reports/export
 * Role: SUPER_ADMIN
 */
export const exportPlatformReport = async (exportConfig = {}) => {
  throw new Error(
    'Backend endpoint POST /api/reports/export is not implemented in Spring Boot.'
  )
}
