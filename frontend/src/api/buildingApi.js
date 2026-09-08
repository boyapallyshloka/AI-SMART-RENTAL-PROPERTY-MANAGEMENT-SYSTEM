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
 * Building API Service Layer
 * 
 * ARCHITECTURAL DATA-SOURCE SEPARATION:
 * 1. OWNER CRUD: Prepared for Spring Boot REST API integration with confirmed endpoints.
 * 2. MANAGER: Strictly mock-backed (read-only; no backend authorization/endpoints exist yet).
 * 3. TENANT: Strictly mock-backed (read-only; no backend tenancy/relationship model exists yet).
 */

// ============================================================================
// 1. OWNER BUILDING API (Confirmed Spring Boot Backend Endpoints)
// ============================================================================

// Confirmed endpoint: GET /api/buildings/property/{propertyId}
export const getBuildingsByProperty = async (propertyId) => {
  return getMockBuildingsByPropertyId(propertyId)
}

// Confirmed endpoint: GET /api/buildings/{buildingId}
export const getBuildingById = async (buildingId) => {
  return getMockBuildingById(buildingId)
}

// Confirmed endpoint: POST /api/buildings
export const createBuilding = async (buildingData) => {
  return addMockBuilding(buildingData)
}

// Confirmed endpoint: PUT /api/buildings/{buildingId}
export const updateBuilding = async (buildingId, buildingData) => {
  return updateMockBuilding(buildingId, buildingData)
}

// Confirmed endpoint: DELETE /api/buildings/{buildingId}
export const deleteBuilding = async (buildingId) => {
  return deleteMockBuilding(buildingId)
}

// Owner service helper: list all buildings across owned properties (prepared for backend integration)
export const getAllBuildings = async () => {
  return getMockBuildings()
}

// ============================================================================
// 2. MANAGER BUILDING SERVICE (Frontend Mock-Backed • View Only)
// Backend does NOT yet support Manager authorization/endpoints for Buildings.
// Kept strictly mock-backed until backend manager role security is implemented.
// ============================================================================

export const getBuildingsForManager = async () => {
  return getMockBuildings()
}

export const getBuildingByIdForManager = async (buildingId) => {
  return getMockBuildingById(buildingId)
}

// ============================================================================
// 3. TENANT BUILDING SERVICE (Frontend Mock-Backed • View Only)
// Backend does NOT yet provide tenant relationship models on Building entities.
// Kept strictly mock-backed for "My Rental Property" and "Find Properties".
// ============================================================================

// Tenant "My Rental Property" scoped buildings (mock-backed)
export const getBuildingsForTenant = async (user) => {
  return getMockBuildingsForTenant(user)
}

// Tenant "My Rental Property" lease overview (mock-backed)
export const getTenantRentalContext = async (user) => {
  return getMyRentalProperty(user)
}

// Tenant building details lookup for discovery/rental view (mock-backed)
export const getBuildingByIdForTenant = async (buildingId) => {
  return getMockBuildingById(buildingId)
}
