import axiosClient from './axiosClient'

/**
 * Property Management API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot properties list endpoint (e.g. GET /properties)
export const getProperties = async (params) => {
  // return axiosClient.get('/properties', { params })
  throw new Error('TODO: Connect to Spring Boot backend /properties')
}

// TODO: Replace with Spring Boot property details endpoint (e.g. GET /properties/{id})
export const getPropertyById = async (id) => {
  // return axiosClient.get(`/properties/${id}`)
  throw new Error(`TODO: Connect to Spring Boot backend /properties/${id}`)
}

// TODO: Replace with Spring Boot property creation endpoint (e.g. POST /properties)
export const createProperty = async (propertyData) => {
  // return axiosClient.post('/properties', propertyData)
  throw new Error('TODO: Connect to Spring Boot backend /properties')
}

// TODO: Replace with Spring Boot property update endpoint (e.g. PUT /properties/{id})
export const updateProperty = async (id, propertyData) => {
  // return axiosClient.put(`/properties/${id}`, propertyData)
  throw new Error(`TODO: Connect to Spring Boot backend /properties/${id}`)
}

// TODO: Replace with Spring Boot property delete endpoint (e.g. DELETE /properties/{id})
export const deleteProperty = async (id) => {
  // return axiosClient.delete(`/properties/${id}`)
  throw new Error(`TODO: Connect to Spring Boot backend /properties/${id}`)
}
