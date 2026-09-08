import {
  getMockProperties,
  getMockPropertyById,
  addMockProperty,
  updateMockProperty,
  deleteMockProperty,
} from '../utils/ownerPropertyMockData.js'

/**
 * Property API Service Layer
 * 
 * Note: Endpoints to be confirmed by backend team.
 * Currently backed by frontend mock data without making unconfirmed Axios calls.
 */

export const getProperties = async () => {
  return getMockProperties()
}

export const getPropertyById = async (id) => {
  return getMockPropertyById(id)
}

export const createProperty = async (propertyData) => {
  return addMockProperty(propertyData)
}

export const updateProperty = async (id, propertyData) => {
  return updateMockProperty(id, propertyData)
}

export const deleteProperty = async (id) => {
  return deleteMockProperty(id)
}
