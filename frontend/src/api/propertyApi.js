import axiosClient from './axiosClient.js'
import {
  getMockProperties,
  getMockPropertyById,
  addMockProperty,
  updateMockProperty,
  deleteMockProperty,
} from '../utils/ownerPropertyMockData.js'

/**
 * Property Enums matching Spring Boot backend exactly
 */
export const PROPERTY_TYPES = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  VILLA: 'VILLA',
  PG: 'PG',
  HOSTEL: 'HOSTEL',
  COMMERCIAL: 'COMMERCIAL',
}

export const FURNISHING_STATUSES = {
  UNFURNISHED: 'UNFURNISHED',
  SEMI_FURNISHED: 'SEMI_FURNISHED',
  FULLY_FURNISHED: 'FULLY_FURNISHED',
}

export const PROPERTY_STATUSES = {
  DRAFT: 'DRAFT',
  AVAILABLE: 'AVAILABLE',
  PUBLISHED: 'PUBLISHED',
  OCCUPIED: 'OCCUPIED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  INACTIVE: 'INACTIVE',
}

/**
 * Helper to map property types to canonical backend enums
 */
export const mapPropertyTypeToBackend = (type) => {
  if (!type) return 'APARTMENT'
  const upper = String(type).trim().toUpperCase().replace(/\s+/g, '_')
  switch (upper) {
    case 'APARTMENT':
    case 'CONDOMINIUM':
    case 'LOFT':
      return 'APARTMENT'
    case 'HOUSE':
    case 'TOWNHOUSE':
    case 'SINGLE_FAMILY':
    case 'SINGLE FAMILY':
      return 'HOUSE'
    case 'VILLA':
      return 'VILLA'
    case 'PG':
      return 'PG'
    case 'HOSTEL':
      return 'HOSTEL'
    case 'COMMERCIAL':
      return 'COMMERCIAL'
    default:
      return 'APARTMENT'
  }
}

/**
 * Helper to map furnishing status to canonical backend enums
 */
export const mapFurnishingStatusToBackend = (furnishing) => {
  if (!furnishing) return 'UNFURNISHED'
  const upper = String(furnishing).trim().toUpperCase().replace(/[-\s]+/g, '_')
  if (upper === 'FURNISHED' || upper === 'FULLY_FURNISHED') return 'FULLY_FURNISHED'
  if (upper === 'SEMI_FURNISHED') return 'SEMI_FURNISHED'
  if (upper === 'UNFURNISHED') return 'UNFURNISHED'
  return 'UNFURNISHED'
}

/**
 * Helper to map parking options to canonical boolean
 */
export const mapParkingAvailableToBackend = (parking) => {
  if (typeof parking === 'boolean') return parking
  if (typeof parking === 'string') {
    return parking.toLowerCase() !== 'none' && parking.trim() !== ''
  }
  return false
}

/**
 * Build clean PropertyRequest payload from UI form data.
 * Strictly converts form field names to backend names:
 *   name -> propertyName
 *   type -> propertyType (canonical enums)
 *   area -> totalArea
 *   furnishing -> furnishingStatus (canonical enums)
 *   parking -> parkingAvailable (boolean)
 *   rent -> monthlyRent
 *   deposit -> securityDeposit
 *
 * Strictly EXCLUDES response/UI-only fields:
 *   ownerId, ownerName, propertyId, status, createdAt, updatedAt,
 *   address, city, state, zipCode, amenities, buildings, units, images, etc.
 */
export const buildPropertyRequestPayload = (data = {}) => {
  const propertyName = (data.propertyName || data.name || '').trim()

  const propertyType = data.propertyType
    ? mapPropertyTypeToBackend(data.propertyType)
    : (data.type ? mapPropertyTypeToBackend(data.type) : undefined)

  const description =
    data.description != null ? String(data.description).trim() : undefined

  const rawArea = data.totalArea != null ? data.totalArea : data.area
  const totalArea =
    rawArea != null && rawArea !== '' ? Number(rawArea) : undefined

  const bedrooms =
    data.bedrooms != null && data.bedrooms !== ''
      ? Number(data.bedrooms)
      : undefined
  const bathrooms =
    data.bathrooms != null && data.bathrooms !== ''
      ? Number(data.bathrooms)
      : undefined

  const rawFurnishing = data.furnishingStatus || data.furnishing
  const furnishingStatus = rawFurnishing
    ? mapFurnishingStatusToBackend(rawFurnishing)
    : undefined

  const rawParking =
    data.parkingAvailable != null ? data.parkingAvailable : data.parking
  const parkingAvailable =
    rawParking != null ? mapParkingAvailableToBackend(rawParking) : undefined

  const rawRent = data.monthlyRent != null ? data.monthlyRent : data.rent
  const monthlyRent =
    rawRent != null && rawRent !== '' ? Number(rawRent) : undefined

  const rawDeposit =
    data.securityDeposit != null ? data.securityDeposit : data.deposit
  const securityDeposit =
    rawDeposit != null && rawDeposit !== '' ? Number(rawDeposit) : undefined

  const payload = {
    propertyName: propertyName || undefined,
    propertyType,
    description,
    totalArea,
    bedrooms,
    bathrooms,
    furnishingStatus,
    parkingAvailable,
    monthlyRent,
    securityDeposit,
  }

  // Ensure ownerId and all UI/response fields are NEVER included
  delete payload.ownerId
  delete payload.ownerName
  delete payload.propertyId
  delete payload.status
  delete payload.createdAt
  delete payload.updatedAt
  delete payload.address
  delete payload.city
  delete payload.state
  delete payload.zipCode
  delete payload.amenities
  delete payload.buildings
  delete payload.units
  delete payload.images
  delete payload.imageUrl
  delete payload.totalUnits
  delete payload.occupiedUnits

  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  )
}

/**
 * Format PropertyRequest payload matching Spring Boot DTO constraints
 * Note: ownerId is explicitly omitted (backend derives it from authenticated JWT)
 */
export const formatPropertyRequest = (data = {}) => {
  return buildPropertyRequestPayload(data)
}

/**
 * GET /api/owner/properties
 * Retrieve all properties belonging to the authenticated Property Owner
 */
export const getMyProperties = async () => {
  return axiosClient.get('/owner/properties')
}

/**
 * GET /api/owner/properties/{id}
 * Retrieve single property details by ID for authenticated Property Owner
 */
export const getPropertyById = async (id) => {
  return axiosClient.get(`/owner/properties/${id}`)
}

/**
 * POST /api/owner/properties
 * Create a new property for authenticated Property Owner
 * Payload: PropertyRequest (ownerId omitted)
 */
export const createProperty = async (propertyData) => {
  const payload = formatPropertyRequest(propertyData)
  return axiosClient.post('/owner/properties', payload)
}

/**
 * PUT /api/owner/properties/{id}
 * Update an existing property
 * Payload: PropertyRequest (ownerId omitted)
 */
export const updateProperty = async (id, propertyData) => {
  const payload = formatPropertyRequest(propertyData)
  return axiosClient.put(`/owner/properties/${id}`, payload)
}

/**
 * DELETE /api/owner/properties/{id}
 * Delete a property by ID
 */
export const deleteProperty = async (id) => {
  return axiosClient.delete(`/owner/properties/${id}`)
}

export const CANONICAL_PROPERTY_STATUSES = [
  'DRAFT',
  'AVAILABLE',
  'PUBLISHED',
  'OCCUPIED',
  'UNDER_MAINTENANCE',
  'INACTIVE',
]

/**
 * PUT /api/owner/properties/{id}/status?status={status}
 * Update property lifecycle status using canonical PropertyStatus values
 */
export const updatePropertyStatus = async (id, status) => {
  const normalizedStatus = String(status || '').trim().toUpperCase()
  if (!CANONICAL_PROPERTY_STATUSES.includes(normalizedStatus)) {
    throw new Error(
      `Invalid property status: "${status}". Canonical values are: ${CANONICAL_PROPERTY_STATUSES.join(', ')}`
    )
  }
  return axiosClient.put(`/owner/properties/${id}/status`, null, {
    params: { status: normalizedStatus },
  })
}

// ============================================================================
// Development / UI Compatibility Fallbacks
// Preserved so existing UI pages (AddBuildingPage, etc.) remain functional before Phase 3
// ============================================================================
export const getProperties = async () => {
  return getMockProperties()
}
