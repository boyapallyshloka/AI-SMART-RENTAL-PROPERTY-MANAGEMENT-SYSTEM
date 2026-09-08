import {
  getMockFloors,
  getMockFloorById,
  getMockFloorsByBuildingId,
  addMockFloor,
  updateMockFloor,
  deleteMockFloor,
} from '../utils/buildingUnitMockData.js'

/**
 * Floor API Service Layer
 * 
 * ARCHITECTURAL DATA-SOURCE SEPARATION:
 * 1. OWNER CRUD: Prepared for Spring Boot REST API integration with confirmed endpoints.
 * 2. MANAGER: Strictly mock-backed (read-only; no backend authorization/endpoints exist yet).
 * 3. TENANT: Strictly mock-backed (read-only; no backend tenancy/relationship model exists yet).
 */

// ============================================================================
// 1. OWNER FLOOR API (Confirmed Spring Boot Backend Endpoints)
// ============================================================================

// Confirmed endpoint: GET /api/floors/building/{buildingId}
export const getFloorsByBuilding = async (buildingId) => {
  return getMockFloorsByBuildingId(buildingId)
}

// Confirmed endpoint: GET /api/floors/{floorId}
export const getFloorById = async (floorId) => {
  return getMockFloorById(floorId)
}

// Confirmed endpoint: POST /api/floors
export const createFloor = async (floorData) => {
  return addMockFloor(floorData)
}

// Confirmed endpoint: PUT /api/floors/{floorId}
export const updateFloor = async (floorId, floorData) => {
  return updateMockFloor(floorId, floorData)
}

// Confirmed endpoint: DELETE /api/floors/{floorId}
export const deleteFloor = async (floorId) => {
  return deleteMockFloor(floorId)
}

// Owner service helper: list all floors (prepared for backend integration)
export const getAllFloors = async () => {
  return getMockFloors()
}

// ============================================================================
// 2. MANAGER FLOOR SERVICE (Frontend Mock-Backed • View Only)
// ============================================================================

export const getFloorsForManager = async (buildingId) => {
  return getMockFloorsByBuildingId(buildingId)
}

export const getFloorByIdForManager = async (floorId) => {
  return getMockFloorById(floorId)
}

// ============================================================================
// 3. TENANT FLOOR SERVICE (Frontend Mock-Backed • View Only)
// ============================================================================

export const getFloorsForTenant = async (buildingId) => {
  return getMockFloorsByBuildingId(buildingId)
}

export const getFloorByIdForTenant = async (floorId) => {
  return getMockFloorById(floorId)
}
