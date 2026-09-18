import axiosClient from './axiosClient'

/**
 * Rental Applications API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot rental applications list endpoint (e.g. GET /applications)
export const getApplications = async (params) => {
  // return axiosClient.get('/applications', { params })
  throw new Error('TODO: Connect to Spring Boot backend /applications')
}

// TODO: Replace with Spring Boot application details endpoint (e.g. GET /applications/{id})
export const getApplicationById = async (id) => {
  // return axiosClient.get(`/applications/${id}`)
  throw new Error(`TODO: Connect to Spring Boot backend /applications/${id}`)
}

// TODO: Replace with Spring Boot submit application endpoint (e.g. POST /applications)
export const submitApplication = async (applicationData) => {
  // return axiosClient.post('/applications', applicationData)
  throw new Error('TODO: Connect to Spring Boot backend /applications')
}

// TODO: Replace with Spring Boot decision/status endpoint (e.g. PATCH /applications/{id}/status)
export const updateApplicationStatus = async (id, status) => {
  // return axiosClient.patch(`/applications/${id}/status`, { status })
  throw new Error(`TODO: Connect to Spring Boot backend /applications/${id}/status`)
}

// TODO: Replace with Spring Boot document upload endpoint (e.g. POST /applications/{id}/documents)
export const uploadApplicationDocument = async (id, formData) => {
  // return axiosClient.post(`/applications/${id}/documents`, formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // })
  throw new Error(`TODO: Connect to Spring Boot backend /applications/${id}/documents`)
}
