import axiosClient from './axiosClient.js'
import {
  getMockUnits,
  getMockUnitById,
  getMockUnitsByFloorId,
  getMockUnitsByBuildingId,
  addMockUnit,
  updateMockUnit,
  deleteMockUnit,
  getAvailableUnits as mockGetAvailableUnits,
  getAvailableProperties as mockGetAvailableProperties,
} from '../utils/buildingUnitMockData.js'

/**
 * Unit API Service Layer (Spring Boot Integration)
 * Controller: UnitController (/api/units)
 * Role: PROPERTY_OWNER
 */

export const ALLOWED_UNIT_FIELDS = [
  'unitNumber',
  'unitType',
  'area',
  'bedrooms',
  'bathrooms',
  'monthlyRent',
  'securityDeposit',
  'status',
  'description',
  'floorId',
]

/**
 * Canonical Unit Enums matching backend UnitType & UnitStatus.
 * Defined as iterable arrays with named properties for backward compatibility
 * with existing UI components calling .map() while supporting object key access.
 */
export const UNIT_TYPES = Object.assign(['APARTMENT', 'ROOM'], {
  APARTMENT: 'APARTMENT',
  ROOM: 'ROOM',
})

export const UNIT_STATUSES = Object.assign(
  ['VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
  {
    VACANT: 'VACANT',
    OCCUPIED: 'OCCUPIED',
    RESERVED: 'RESERVED',
    MAINTENANCE: 'MAINTENANCE',
  }
)

export const CANONICAL_UNIT_TYPES = {
  APARTMENT: 'APARTMENT',
  ROOM: 'ROOM',
}

export const CANONICAL_UNIT_STATUSES = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE',
}

/**
 * Formats and sanitizes UnitRequest payload matching Spring Boot DTO constraints:
 * - unitNumber: String (@NotBlank)
 * - unitType: UnitType (@NotNull: APARTMENT | ROOM)
 * - area: Double (@PositiveOrZero)
 * - bedrooms: Integer (@PositiveOrZero)
 * - bathrooms: Integer (@PositiveOrZero)
 * - monthlyRent: BigDecimal (@NotNull, @DecimalMin(0.0))
 * - securityDeposit: BigDecimal (@NotNull, @DecimalMin(0.0))
 * - status: UnitStatus (VACANT | OCCUPIED | RESERVED | MAINTENANCE)
 * - description: String
 * - floorId: Long (@NotNull)
 *
 * Strictly ensures:
 * - Normalizes frontend field aliases (number -> unitNumber, type -> unitType, rent -> monthlyRent, deposit -> securityDeposit)
 * - Normalizes nested floor data (floor.id / floor.floorId -> floorId)
 * - Ensures numeric values for area, bedrooms, bathrooms, monthlyRent, securityDeposit, floorId (preserving valid 0)
 * - Does NOT convert invalid numbers into NaN
 * - Strictly strips response and UI fields (unitId, id, floor, floorName, floorNumber, building, buildingId, buildingName, property, propertyId, propertyName, ownerId, createdAt, updatedAt, etc.)
 */
export const formatUnitRequest = (data = {}) => {
  const rawUnitNumber =
    data.unitNumber !== undefined ? data.unitNumber : data.number
  const unitNumber =
    rawUnitNumber != null && String(rawUnitNumber).trim() !== ''
      ? String(rawUnitNumber).trim()
      : undefined

  const rawUnitType =
    data.unitType !== undefined ? data.unitType : data.type
  const unitType =
    rawUnitType != null && String(rawUnitType).trim() !== ''
      ? String(rawUnitType).trim().toUpperCase()
      : undefined

  let area = undefined
  if (data.area !== undefined && data.area !== null && data.area !== '') {
    const num = Number(data.area)
    if (!Number.isNaN(num)) {
      area = num
    }
  }

  let bedrooms = undefined
  if (data.bedrooms !== undefined && data.bedrooms !== null && data.bedrooms !== '') {
    const num = Number(data.bedrooms)
    if (!Number.isNaN(num)) {
      bedrooms = num
    }
  }

  let bathrooms = undefined
  if (data.bathrooms !== undefined && data.bathrooms !== null && data.bathrooms !== '') {
    const num = Number(data.bathrooms)
    if (!Number.isNaN(num)) {
      bathrooms = num
    }
  }

  let monthlyRent = undefined
  const rawRent =
    data.monthlyRent !== undefined ? data.monthlyRent : data.rent
  if (rawRent !== undefined && rawRent !== null && rawRent !== '') {
    const num = Number(rawRent)
    if (!Number.isNaN(num)) {
      monthlyRent = num
    }
  }

  let securityDeposit = undefined
  const rawDeposit =
    data.securityDeposit !== undefined ? data.securityDeposit : data.deposit
  if (rawDeposit !== undefined && rawDeposit !== null && rawDeposit !== '') {
    const num = Number(rawDeposit)
    if (!Number.isNaN(num)) {
      securityDeposit = num
    }
  }

  const rawStatus = data.status
  const status =
    rawStatus != null && String(rawStatus).trim() !== ''
      ? String(rawStatus).trim().toUpperCase()
      : undefined

  const description =
    data.description !== undefined && data.description !== null
      ? String(data.description).trim()
      : undefined

  let floorId = undefined
  const rawFloorId =
    data.floorId !== undefined
      ? data.floorId
      : data.floor?.id !== undefined
      ? data.floor.id
      : data.floor?.floorId !== undefined
      ? data.floor.floorId
      : undefined
  if (rawFloorId !== undefined && rawFloorId !== null && rawFloorId !== '') {
    const num = Number(rawFloorId)
    if (!Number.isNaN(num)) {
      floorId = num
    }
  }

  const payload = {
    unitNumber,
    unitType,
    area,
    bedrooms,
    bathrooms,
    monthlyRent,
    securityDeposit,
    status,
    description,
    floorId,
  }

  // Explicitly remove forbidden response, entity, and UI fields
  delete payload.unitId
  delete payload.id
  delete payload.floor
  delete payload.floorName
  delete payload.floorNumber
  delete payload.building
  delete payload.buildingId
  delete payload.buildingName
  delete payload.property
  delete payload.propertyId
  delete payload.propertyName
  delete payload.ownerId
  delete payload.createdAt
  delete payload.updatedAt

  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  )
}

// POST /api/units
export const createUnit = async (unitData) => {
  const payload = formatUnitRequest(unitData)
  return axiosClient.post('/units', payload)
}

// GET /api/units/floor/{floorId}
export const getUnitsByFloor = async (floorId) => {
  return axiosClient.get(`/units/floor/${floorId}`)
}

// GET /api/units/{unitId}
export const getUnitById = async (unitId) => {
  return axiosClient.get(`/units/${unitId}`)
}

// PUT /api/units/{unitId}
export const updateUnit = async (unitId, unitData) => {
  const payload = formatUnitRequest(unitData)
  return axiosClient.put(`/units/${unitId}`, payload)
}

// DELETE /api/units/{unitId}
export const deleteUnit = async (unitId) => {
  return axiosClient.delete(`/units/${unitId}`)
}

// ============================================================================
// UI Compatibility Helpers (Preserved for Discovery/Manager/Tenant Views)
// ============================================================================

export const getUnitsByBuilding = async (buildingId) => {
  return getMockUnitsByBuildingId(buildingId)
}

export const getAllUnits = async () => {
  return getMockUnits()
}

export const getUnitsForManager = async (floorId) => {
  return getMockUnitsByFloorId(floorId)
}

export const getUnitByIdForManager = async (unitId) => {
  return getMockUnitById(unitId)
}

export const getUnitsForTenant = async (floorId) => {
  return getMockUnitsByFloorId(floorId)
}

export const getUnitByIdForTenant = async (unitId) => {
  return getMockUnitById(unitId)
}

export const getAvailableUnits = async (user) => {
  return mockGetAvailableUnits(user)
}

export const getAvailableProperties = async (user) => {
  return mockGetAvailableProperties(user)
}
