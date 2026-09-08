import axiosClient from './axiosClient.js'
import {
  getMockBuildings,
  getMockBuildingById,
  getMockBuildingsByPropertyId,
  getMockBuildingsForTenant,
  getMyRentalProperty,
  addMockBuilding,
  updateMockBuilding,
  deleteMockBuilding,
} from '../utils/buildingUnitMockData.js'

/**
 * Building API Service Layer (Spring Boot Integration)
 * Controller: BuildingController (/api/buildings)
 * Role: PROPERTY_OWNER
 */

export const ALLOWED_BUILDING_FIELDS = [
  'buildingName',
  'totalFloors',
  'totalUnits',
  'description',
  'propertyId',
]

/**
 * Formats and sanitizes BuildingRequest payload matching Spring Boot DTO constraints:
 * - buildingName: String (@NotBlank)
 * - totalFloors: Integer (@PositiveOrZero, optional)
 * - totalUnits: Integer (@PositiveOrZero, optional)
 * - description: String (optional)
 * - propertyId: Long (@NotNull)
 *
 * Strictly ensures:
 * - propertyId remains a flat number (never a nested property object)
 * - buildingId is strictly omitted from request bodies
 * - response and UI metadata (propertyName, createdAt, updatedAt, ownerId, etc.) are omitted
 * - numeric fields preserve actual numeric values without inventing arbitrary defaults
 */
export const formatBuildingRequest = (data = {}) => {
  const buildingName =
    data.buildingName != null
      ? String(data.buildingName).trim()
      : data.name != null
      ? String(data.name).trim()
      : undefined

  const rawFloors = data.totalFloors !== undefined ? data.totalFloors : data.floors
  const totalFloors =
    rawFloors !== undefined && rawFloors !== null && rawFloors !== ''
      ? Number(rawFloors)
      : undefined

  const rawUnits = data.totalUnits !== undefined ? data.totalUnits : data.units
  const totalUnits =
    rawUnits !== undefined && rawUnits !== null && rawUnits !== ''
      ? Number(rawUnits)
      : undefined

  const description =
    data.description != null && String(data.description).trim() !== ''
      ? String(data.description).trim()
      : undefined

  const rawPropertyId =
    data.propertyId !== undefined
      ? data.propertyId
      : data.property?.id !== undefined
      ? data.property.id
      : data.property?.propertyId !== undefined
      ? data.property.propertyId
      : undefined

  const propertyId =
    rawPropertyId !== undefined && rawPropertyId !== null && rawPropertyId !== ''
      ? Number(rawPropertyId)
      : undefined

  const payload = {
    buildingName: buildingName || undefined,
    totalFloors,
    totalUnits,
    description,
    propertyId,
  }

  // Strictly exclude UI and response-only fields
  delete payload.buildingId
  delete payload.id
  delete payload.propertyName
  delete payload.createdAt
  delete payload.updatedAt
  delete payload.ownerId
  delete payload.property

  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  )
}

/**
 * Default implementation preserves mock data for page stability until Phase 5 UI migration.
 * Can be toggled for real Spring Boot REST API integration.
 */
let useMockFallback = false

export const setUseMockBuildings = (enabled) => {
  useMockFallback = Boolean(enabled)
}

export const isUsingMockBuildings = () => useMockFallback

// POST /api/buildings
export const createBuilding = async (buildingData) => {
  const payload = formatBuildingRequest(buildingData)
  if (useMockFallback) {
    return addMockBuilding(buildingData)
  }
  return axiosClient.post('/buildings', payload)
}

// GET /api/buildings/property/{propertyId}
export const getBuildingsByProperty = async (propertyId) => {
  if (useMockFallback) {
    return getMockBuildingsByPropertyId(propertyId)
  }
  return axiosClient.get(`/buildings/property/${propertyId}`)
}

// GET /api/buildings/{buildingId}
export const getBuildingById = async (buildingId) => {
  if (useMockFallback) {
    return getMockBuildingById(buildingId)
  }
  return axiosClient.get(`/buildings/${buildingId}`)
}

// PUT /api/buildings/{buildingId}
export const updateBuilding = async (buildingId, buildingData) => {
  const payload = formatBuildingRequest(buildingData)
  if (useMockFallback) {
    return updateMockBuilding(buildingId, buildingData)
  }
  return axiosClient.put(`/buildings/${buildingId}`, payload)
}

// DELETE /api/buildings/{buildingId}
export const deleteBuilding = async (buildingId) => {
  if (useMockFallback) {
    return deleteMockBuilding(buildingId)
  }
  return axiosClient.delete(`/buildings/${buildingId}`)
}

// ============================================================================
// UI Compatibility Helpers (Preserved for Manager/Tenant Views)
// ============================================================================

export const getAllBuildings = async () => {
  return getMockBuildings()
}

export const getBuildingsForManager = async () => {
  return getMockBuildings()
}

export const getBuildingByIdForManager = async (buildingId) => {
  return getMockBuildingById(buildingId)
}

export const getBuildingsForTenant = async (user) => {
  return getMockBuildingsForTenant(user)
}

export const getTenantRentalContext = async (user) => {
  return getMyRentalProperty(user)
}

export const getBuildingByIdForTenant = async (buildingId) => {
  return getMockBuildingById(buildingId)
}
