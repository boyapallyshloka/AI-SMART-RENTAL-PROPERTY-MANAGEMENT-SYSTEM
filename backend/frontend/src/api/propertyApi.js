import axiosClient from './axiosClient.js'

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
 *   description -> description
 *   area -> totalArea
 *   furnishing -> furnishingStatus (canonical enums)
 *   parking -> parkingAvailable (boolean)
 *   year / yearBuilt -> yearBuilt (integer)
 *
 * Current backend-supported PropertyRequest fields:
 *   - propertyName
 *   - propertyType
 *   - description
 *   - totalArea
 *   - furnishingStatus
 *   - parkingAvailable
 *   - yearBuilt
 *
 * Strictly EXCLUDES response/status/legacy/UI-only fields:
 *   ownerId, ownerName, propertyId, id, status, createdAt, updatedAt,
 *   bedrooms, bathrooms, monthlyRent, securityDeposit,
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
    rawArea != null && rawArea !== '' && !isNaN(Number(rawArea))
      ? Number(rawArea)
      : undefined

  const rawFurnishing = data.furnishingStatus || data.furnishing
  const furnishingStatus = rawFurnishing
    ? mapFurnishingStatusToBackend(rawFurnishing)
    : undefined

  const rawParking =
    data.parkingAvailable != null ? data.parkingAvailable : data.parking
  const parkingAvailable =
    rawParking != null ? mapParkingAvailableToBackend(rawParking) : undefined

  const rawYear = data.yearBuilt != null ? data.yearBuilt : data.year
  const yearBuilt =
    rawYear != null && rawYear !== '' && !isNaN(Number(rawYear))
      ? Math.round(Number(rawYear))
      : undefined

  const payload = {
    propertyName: propertyName || undefined,
    propertyType,
    description,
    totalArea,
    furnishingStatus,
    parkingAvailable,
    yearBuilt,
  }

  // Ensure ownerId, status, id, and all legacy/UI fields are NEVER included in request payload
  delete payload.ownerId
  delete payload.ownerName
  delete payload.propertyId
  delete payload.id
  delete payload.status
  delete payload.createdAt
  delete payload.updatedAt
  delete payload.bedrooms
  delete payload.bathrooms
  delete payload.monthlyRent
  delete payload.securityDeposit
  delete payload.deposit
  delete payload.rent
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
 * GET /api/owner/properties/{id}/details
 * Retrieve complete property details (property, address, buildings, amenities, images)
 */
export const getPropertyDetails = async (id) => {
  return axiosClient.get(`/owner/properties/${id}/details`)
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

/**
 * Maps Spring Boot PropertyResponse to the shape expected by UI components
 * Backend fields:
 * - propertyId -> id, propertyId
 * - propertyName -> name, propertyName
 * - propertyType -> type, propertyType
 * - description -> description
 * - totalArea -> area, totalArea
 * - furnishingStatus -> furnishing, furnishingStatus
 * - parkingAvailable -> parking, parkingAvailable
 * - yearBuilt -> yearBuilt
 * - status -> status
 * - ownerId, ownerName, createdAt, updatedAt
 */
export const mapBackendPropertyToUi = (prop) => {
  if (!prop) return null

  const id =
    prop.propertyId != null
      ? String(prop.propertyId)
      : prop.id != null
      ? String(prop.id)
      : ''
  const name = prop.propertyName || prop.name || 'Unnamed Property'
  const type = prop.propertyType || prop.type || 'APARTMENT'

  return {
    ...prop,
    id,
    propertyId: prop.propertyId ?? prop.id,
    name,
    propertyName: prop.propertyName ?? prop.name,
    type,
    propertyType: prop.propertyType ?? prop.type,
    // Address fields: keep in current fallback/empty state until Phase 4 Address integration
    address: prop.address || '',
    city: prop.city || '',
    state: prop.state || '',
    zipCode: prop.zipCode || '',
    // Specs (legacy fields no longer returned by backend Property API)
    bedrooms: prop.bedrooms != null ? Number(prop.bedrooms) : null,
    bathrooms: prop.bathrooms != null ? Number(prop.bathrooms) : null,
    area:
      prop.totalArea != null
        ? Number(prop.totalArea)
        : prop.area != null
        ? Number(prop.area)
        : 0,
    totalArea:
      prop.totalArea != null
        ? Number(prop.totalArea)
        : prop.area != null
        ? Number(prop.area)
        : 0,
    furnishing: prop.furnishingStatus || prop.furnishing || 'UNFURNISHED',
    furnishingStatus: prop.furnishingStatus || prop.furnishing || 'UNFURNISHED',
    parking:
      prop.parkingAvailable != null
        ? prop.parkingAvailable
          ? 'Available'
          : 'None'
        : prop.parking || 'None',
    parkingAvailable:
      prop.parkingAvailable != null
        ? Boolean(prop.parkingAvailable)
        : prop.parking === 'Available' || Boolean(prop.parking),
    yearBuilt:
      prop.yearBuilt != null
        ? Number(prop.yearBuilt)
        : prop.year != null
        ? Number(prop.year)
        : null,
    // Financials (legacy fields no longer returned by backend Property API)
    monthlyRent: prop.monthlyRent != null ? Number(prop.monthlyRent) : null,
    deposit:
      prop.securityDeposit != null
        ? Number(prop.securityDeposit)
        : prop.deposit != null
        ? Number(prop.deposit)
        : null,
    securityDeposit:
      prop.securityDeposit != null
        ? Number(prop.securityDeposit)
        : prop.deposit != null
        ? Number(prop.deposit)
        : null,
    // Status & details
    status: prop.status || 'AVAILABLE',
    description: prop.description || '',
    // Units metrics (backend PropertyResponse does not have nested building/units)
    totalUnits: prop.totalUnits != null ? Number(prop.totalUnits) : 1,
    occupiedUnits:
      prop.occupiedUnits != null
        ? Number(prop.occupiedUnits)
        : prop.status === 'OCCUPIED'
        ? 1
        : 0,
    images: Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [],
    amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
    ownerId: prop.ownerId,
    ownerName: prop.ownerName,
    createdAt: prop.createdAt,
    updatedAt: prop.updatedAt,
  }
}

// ============================================================================
// Real Backend Property Fetching
// Retrieves all properties from real Spring Boot backend /api/owner/properties
// ============================================================================
export const getProperties = async () => {
  const response = await getMyProperties()
  const data = Array.isArray(response) ? response : response?.data || []
  return data.map(mapBackendPropertyToUi)
}
