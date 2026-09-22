import axiosClient from './axiosClient'

/**
 * Rental Applications API Service (Spring Boot Integration)
 * Base Controller: RentalApplicationController (/api/rental-applications)
 */

/**
 * Canonical application statuses matching backend RentalApplicationStatus enum
 */
export const APPLICATION_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  CANCELLED: 'CANCELLED',
}

/**
 * TENANT - Create a new rental application
 * Endpoint: POST /api/rental-applications
 * Payload contract: { unitId: Long (required), preferredMoveInDate: LocalDate (YYYY-MM-DD), message: String }
 *
 * @param {Object} applicationData
 * @param {number|string} applicationData.unitId
 * @param {string} [applicationData.preferredMoveInDate]
 * @param {string} [applicationData.message]
 * @returns {Promise<Object>} RentalApplicationResponse
 */
export const createApplication = async ({ unitId, preferredMoveInDate, message }) => {
  const payload = {
    unitId: Number(unitId),
    preferredMoveInDate: preferredMoveInDate || null,
    message: message && message.trim() ? message.trim() : null,
  }
  return await axiosClient.post('/rental-applications', payload)
}

// Alias for createApplication for backward compatibility
export const submitApplication = createApplication

/**
 * TENANT - Retrieve rental applications submitted by the currently authenticated tenant
 * Endpoint: GET /api/rental-applications/me
 *
 * @returns {Promise<Array<Object>>} List of RentalApplicationResponse
 */
export const getMyApplications = async () => {
  return await axiosClient.get('/rental-applications/me')
}

// Alias for getMyApplications for backward compatibility
export const getApplications = getMyApplications

/**
 * Retrieve a specific rental application by ID
 * Endpoint: GET /api/rental-applications/{applicationId}
 *
 * @param {number|string} applicationId
 * @returns {Promise<Object>} RentalApplicationResponse
 */
export const getApplicationById = async (applicationId) => {
  return await axiosClient.get(`/rental-applications/${applicationId}`)
}

/**
 * TENANT - Withdraw a pending rental application
 * Endpoint: PATCH /api/rental-applications/{applicationId}/withdraw
 *
 * @param {number|string} applicationId
 * @returns {Promise<void>} 204 No Content
 */
export const withdrawApplication = async (applicationId) => {
  return await axiosClient.patch(`/rental-applications/${applicationId}/withdraw`)
}

/**
 * OWNER / MANAGER - Retrieve applications for a specific unit
 * Endpoint: GET /api/rental-applications/unit/{unitId}
 *
 * @param {number|string} unitId
 * @returns {Promise<Array<Object>>} List of RentalApplicationResponse
 */
export const getApplicationsForUnit = async (unitId) => {
  return await axiosClient.get(`/rental-applications/unit/${unitId}`)
}

/**
 * OWNER / MANAGER - Review an application (Approve or Reject)
 * Endpoint: PUT /api/rental-applications/{applicationId}/review
 *
 * @param {number|string} applicationId
 * @param {Object} reviewData
 * @param {'APPROVED'|'REJECTED'} reviewData.status
 * @param {string} [reviewData.rejectionReason]
 * @returns {Promise<Object>} RentalApplicationResponse
 */
export const reviewApplication = async (applicationId, { status, rejectionReason }) => {
  const payload = {
    status,
  }
  if (status === APPLICATION_STATUSES.REJECTED && rejectionReason && rejectionReason.trim()) {
    payload.rejectionReason = rejectionReason.trim()
  }
  return await axiosClient.put(`/rental-applications/${applicationId}/review`, payload)
}

// Alias for updateApplicationStatus
export const updateApplicationStatus = async (applicationId, status, rejectionReason) => {
  return await reviewApplication(applicationId, { status, rejectionReason })
}

/**
 * OWNER / MANAGER / ADMIN - Retrieve applications for a specific property
 * Endpoint: GET /api/rental-applications/property/{propertyId}
 *
 * @param {number|string} propertyId
 * @returns {Promise<Array<Object>>} List of RentalApplicationResponse
 */
export const getApplicationsForProperty = async (propertyId) => {
  return await axiosClient.get(`/rental-applications/property/${propertyId}`)
}
