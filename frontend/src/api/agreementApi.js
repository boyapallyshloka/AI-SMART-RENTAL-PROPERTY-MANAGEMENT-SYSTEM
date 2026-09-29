import axiosClient from './axiosClient'

/**
 * Rental Agreements API Service (Spring Boot Integration)
 * Base Controller: RentalAgreementController (/api/rental-agreements)
 */

/**
 * Canonical agreement statuses matching backend AgreementStatus enum
 */
export const AGREEMENT_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
}

/**
 * Retrieve all rental agreements accessible to the authenticated user
 * - SUPER_ADMIN: all agreements
 * - PROPERTY_OWNER: agreements for owned properties
 * - PROPERTY_MANAGER: agreements for assigned properties
 * Endpoint: GET /api/rental-agreements
 *
 * @returns {Promise<Array<Object>>} List of RentalAgreementResponse
 */
export const getAgreements = async () => {
  return await axiosClient.get('/rental-agreements')
}

/**
 * Retrieve a single rental agreement by ID
 * Endpoint: GET /api/rental-agreements/{agreementId}
 *
 * @param {number|string} agreementId
 * @returns {Promise<Object>} RentalAgreementResponse
 */
export const getAgreementById = async (agreementId) => {
  return await axiosClient.get(`/rental-agreements/${agreementId}`)
}

/**
 * TENANT - Retrieve rental agreements belonging to the authenticated tenant
 * Endpoint: GET /api/rental-agreements/my
 *
 * @returns {Promise<Array<Object>>} List of RentalAgreementResponse
 */
export const getMyAgreements = async () => {
  return await axiosClient.get('/rental-agreements/my')
}

/**
 * Create a new rental agreement from an APPROVED rental application
 * Endpoint: POST /api/rental-agreements
 *
 * Payload contract matching RentalAgreementRequest:
 * {
 *   applicationId: Long (required),
 *   startDate: LocalDate (YYYY-MM-DD, required),
 *   endDate: LocalDate (YYYY-MM-DD, required),
 *   monthlyRent: BigDecimal (number, required),
 *   securityDeposit: BigDecimal (number, optional),
 *   dueDay: Integer (1-31, optional),
 *   noticePeriodDays: Integer (>= 0, optional),
 *   moveInDate: LocalDate (YYYY-MM-DD, optional),
 *   termsAndConditions: String (optional),
 *   agreementDocument: String (optional)
 * }
 *
 * @param {Object} payload
 * @returns {Promise<Object>} RentalAgreementResponse
 */
export const createAgreement = async (payload) => {
  const requestBody = {
    applicationId: Number(payload.applicationId),
    startDate: payload.startDate,
    endDate: payload.endDate,
    monthlyRent: Number(payload.monthlyRent),
    securityDeposit:
      payload.securityDeposit != null && payload.securityDeposit !== ''
        ? Number(payload.securityDeposit)
        : undefined,
    dueDay:
      payload.dueDay != null && payload.dueDay !== ''
        ? Number(payload.dueDay)
        : undefined,
    noticePeriodDays:
      payload.noticePeriodDays != null && payload.noticePeriodDays !== ''
        ? Number(payload.noticePeriodDays)
        : undefined,
    moveInDate: payload.moveInDate || undefined,
    termsAndConditions:
      payload.termsAndConditions && payload.termsAndConditions.trim()
        ? payload.termsAndConditions.trim()
        : undefined,
    agreementDocument:
      payload.agreementDocument && payload.agreementDocument.trim()
        ? payload.agreementDocument.trim()
        : undefined,
  }

  return await axiosClient.post('/rental-agreements', requestBody)
}

/**
 * Update the status of an existing rental agreement
 * Endpoint: PATCH /api/rental-agreements/{agreementId}/status?status={status}
 *
 * @param {number|string} agreementId
 * @param {'DRAFT'|'ACTIVE'|'EXPIRED'|'TERMINATED'} status
 * @returns {Promise<Object>} RentalAgreementResponse
 */
export const updateAgreementStatus = async (agreementId, status) => {
  return await axiosClient.patch(
    `/rental-agreements/${agreementId}/status`,
    null,
    {
      params: { status },
    }
  )
}

/**
 * Update the move-out date of an existing rental agreement
 * Endpoint: PATCH /api/rental-agreements/{agreementId}/move-out?moveOutDate={moveOutDate}
 *
 * @param {number|string} agreementId
 * @param {string} moveOutDate YYYY-MM-DD
 * @returns {Promise<Object>} RentalAgreementResponse
 */
export const updateAgreementMoveOut = async (agreementId, moveOutDate) => {
  return await axiosClient.patch(
    `/rental-agreements/${agreementId}/move-out`,
    null,
    {
      params: { moveOutDate },
    }
  )
}

/**
 * Upload a document (PDF) for an existing rental agreement
 * Endpoint: POST /api/rental-agreements/{agreementId}/document
 *
 * @param {number|string} agreementId
 * @param {File} file
 * @returns {Promise<Object>} RentalAgreementResponse
 */
export const uploadAgreementDocument = async (agreementId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return await axiosClient.post(
    `/rental-agreements/${agreementId}/document`,
    formData
  )
}

/**
 * Download or view the PDF document for an existing rental agreement
 * Endpoint: GET /api/rental-agreements/{agreementId}/document
 *
 * @param {number|string} agreementId
 * @returns {Promise<Blob>}
 */
export const getAgreementDocument = async (agreementId) => {
  return await axiosClient.get(`/rental-agreements/${agreementId}/document`, {
    responseType: 'blob',
  })
}
