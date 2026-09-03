import axiosClient from './axiosClient'

/**
 * Maintenance Requests API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot maintenance list endpoint (e.g. GET /maintenance)
export const getMaintenanceRequests = async (params) => {
  // return axiosClient.get('/maintenance', { params })
  throw new Error('TODO: Connect to Spring Boot backend /maintenance')
}

// TODO: Replace with Spring Boot ticket details endpoint (e.g. GET /maintenance/{id})
export const getMaintenanceRequestById = async (id) => {
  // return axiosClient.get(`/maintenance/${id}`)
  throw new Error(`TODO: Connect to Spring Boot backend /maintenance/${id}`)
}

// TODO: Replace with Spring Boot create ticket endpoint (e.g. POST /maintenance)
export const createMaintenanceRequest = async (requestData) => {
  // return axiosClient.post('/maintenance', requestData)
  throw new Error('TODO: Connect to Spring Boot backend /maintenance')
}

// TODO: Replace with Spring Boot update status endpoint (e.g. PATCH /maintenance/{id}/status)
export const updateMaintenanceStatus = async (id, status) => {
  // return axiosClient.patch(`/maintenance/${id}/status`, { status })
  throw new Error(`TODO: Connect to Spring Boot backend /maintenance/${id}/status`)
}

// TODO: Replace with Spring Boot assign worker endpoint (e.g. POST /maintenance/{id}/assign)
export const assignWorker = async (id, workerData) => {
  // return axiosClient.post(`/maintenance/${id}/assign`, workerData)
  throw new Error(`TODO: Connect to Spring Boot backend /maintenance/${id}/assign`)
}
