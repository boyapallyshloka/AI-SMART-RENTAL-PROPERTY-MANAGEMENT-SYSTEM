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
 * Unit API Service Layer
 * 
 * ARCHITECTURAL DATA-SOURCE SEPARATION:
 * 1. OWNER CRUD: Prepared for Spring Boot REST API integration with confirmed endpoints.
 * 2. MANAGER: Strictly mock-backed (read-only; no backend authorization/endpoints exist yet).
 * 3. TENANT: Strictly mock-backed (read-only; no backend tenancy/relationship model exists yet).
 */

// ============================================================================
// 1. OWNER UNIT API (Confirmed Spring Boot Backend Endpoints)
// ============================================================================

// Confirmed endpoint: GET /api/units/floor/{floorId}
export const getUnitsByFloor = async (floorId) => {
  return getMockUnitsByFloorId(floorId)
}

// Confirmed endpoint: GET /api/units/{unitId}
export const getUnitById = async (unitId) => {
  return getMockUnitById(unitId)
}

// Confirmed endpoint: POST /api/units
export const createUnit = async (unitData) => {
  return addMockUnit(unitData)
}

// Confirmed endpoint: PUT /api/units/{unitId}
export const updateUnit = async (unitId, unitData) => {
  return updateMockUnit(unitId, unitData)
}

// Confirmed endpoint: DELETE /api/units/{unitId}
export const deleteUnit = async (unitId) => {
  return deleteMockUnit(unitId)
}

// Owner service helper: list units in building (mock-backed until backend provides endpoint)
export const getUnitsByBuilding = async (buildingId) => {
  return getMockUnitsByBuildingId(buildingId)
}

// Owner service helper: list all units (mock-backed)
export const getAllUnits = async () => {
  return getMockUnits()
}

// ============================================================================
// 2. MANAGER UNIT SERVICE (Frontend Mock-Backed • View Only)
// ============================================================================

export const getUnitsForManager = async (floorId) => {
  return getMockUnitsByFloorId(floorId)
}

export const getUnitByIdForManager = async (unitId) => {
  return getMockUnitById(unitId)
}

// ============================================================================
// 3. TENANT UNIT SERVICE (Frontend Mock-Backed • View Only)
// ============================================================================

// Scoped units lookup for tenant rental/community view (mock-backed)
export const getUnitsForTenant = async (floorId) => {
  return getMockUnitsByFloorId(floorId)
}

// Unit detail lookup for tenant (mock-backed)
export const getUnitByIdForTenant = async (unitId) => {
  return getMockUnitById(unitId)
}

// Tenant Discovery: VACANT units available for discovery (mock-backed)
export const getAvailableUnits = async (user) => {
  return mockGetAvailableUnits(user)
}

// Tenant Discovery: Available properties with vacant counts (mock-backed)
export const getAvailableProperties = async (user) => {
  return mockGetAvailableProperties(user)
}

// Re-export entity constants
export { UNIT_TYPES, UNIT_STATUSES } from '../utils/buildingUnitMockData.js'
