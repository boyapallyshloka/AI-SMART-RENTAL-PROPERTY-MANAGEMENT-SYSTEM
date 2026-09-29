import axiosClient from './axiosClient.js'

/**
 * Tenant Profile API Service (Spring Boot Integration)
 * Base Controller: TenantController (/api/tenants)
 */

/**
 * Retrieve profile information for the authenticated Tenant
 * Endpoint: GET /api/tenants/me
 * Role: TENANT
 * @returns {Promise<Object>} TenantResponse { tenantId, userId, firstName, lastName, email, ... }
 */
export const getMyTenantProfile = async () => {
  return axiosClient.get('/tenants/me')
}

/**
 * Update profile information for the authenticated Tenant
 * Endpoint: PUT /api/tenants/me
 * Role: TENANT
 * @param {Object} profileData
 * @returns {Promise<Object>} TenantResponse
 */
export const updateMyTenantProfile = async (profileData) => {
  return axiosClient.put('/tenants/me', profileData)
}
