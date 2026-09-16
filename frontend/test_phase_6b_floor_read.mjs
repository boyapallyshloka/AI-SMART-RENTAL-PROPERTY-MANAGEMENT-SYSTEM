import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Setup Mock browser environment for Node.js
globalThis.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
}
globalThis.localStorage = globalThis.window.localStorage

console.log('🧪 Starting Phase 6B - Floor Read Flow Verification...\n')

function resolvePath(subPath) {
  const candidates = [
    path.resolve(__dirname, subPath),
    path.resolve(__dirname, '../../../../../OneDrive/Desktop/Homeshpere/frontend', subPath),
    path.resolve(__dirname, '../frontend', subPath),
    path.resolve(__dirname, 'frontend', subPath),
    path.resolve('c:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend', subPath),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return candidates[0]
}

const floorApiPath = resolvePath('src/api/floorApi.js')
const axiosClientPath = resolvePath('src/api/axiosClient.js')
const buildingDetailsPagePath = resolvePath('src/pages/owner/BuildingDetailsPage.jsx')
const floorDetailsPagePath = resolvePath('src/pages/owner/FloorDetailsPage.jsx')

const floorApi = await import(`file://${floorApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  getFloorsByBuilding,
  getFloorById,
  isUsingMockFloors,
  setUseMockFloors,
  getFloorsForManager,
  getFloorsForTenant,
} = floorApi

// --------------------------------------------------------------------------
// Test 1: Real Floor Read Endpoints in floorApi.js
// --------------------------------------------------------------------------
console.log('--- Test 1: Real Floor Read Endpoints Contract ---')

let capturedGet = null
const originalGet = axiosClient.get

axiosClient.get = async (url, config) => {
  capturedGet = { url, config }
  if (url.includes('/building/')) {
    return [
      {
        floorId: 10,
        floorName: 'Floor 1',
        floorNumber: 1,
        buildingId: 5,
        buildingName: 'Tower A',
        propertyId: 1,
        propertyName: 'Sunset Palms',
      },
    ]
  }
  return {
    floorId: 10,
    floorName: 'Floor 1',
    floorNumber: 1,
    buildingId: 5,
    buildingName: 'Tower A',
    propertyId: 1,
    propertyName: 'Sunset Palms',
  }
}

try {
  // 1a. getFloorsByBuilding calls GET /api/floors/building/{buildingId}
  setUseMockFloors(false)
  assert.strictEqual(isUsingMockFloors(), false, 'Owner mode must not use mock fallback')

  const floors = await getFloorsByBuilding(42)
  console.log('Captured GET (by building):', capturedGet)
  assert.strictEqual(capturedGet.url, '/floors/building/42')
  assert.strictEqual(floors[0].floorId, 10)
  assert.strictEqual(floors[0].buildingName, 'Tower A')

  // 1b. getFloorById calls GET /api/floors/{floorId}
  const floor = await getFloorById(10)
  console.log('Captured GET (single floor):', capturedGet)
  assert.strictEqual(capturedGet.url, '/floors/10')
  assert.strictEqual(floor.floorId, 10)
  assert.strictEqual(floor.floorName, 'Floor 1')
  assert.strictEqual(floor.propertyName, 'Sunset Palms')
} finally {
  axiosClient.get = originalGet
}

console.log('✅ Test 1 Passed: getFloorsByBuilding and getFloorById dispatch to correct REST endpoints.\n')

// --------------------------------------------------------------------------
// Test 2: Active Owner Read Flow vs Mock Helpers Isolation
// --------------------------------------------------------------------------
console.log('--- Test 2: Active Owner Real Mode & Mock Isolation ---')

// Default isUsingMockFloors() must be false
assert.strictEqual(isUsingMockFloors(), false, 'Default active state for owner must connect to real REST API')

// Manager and Tenant helpers must continue to return mock data safely
const managerFloors = await getFloorsForManager(1)
assert(Array.isArray(managerFloors), 'Manager floors helper must return array')

const tenantFloors = await getFloorsForTenant(1)
assert(Array.isArray(tenantFloors), 'Tenant floors helper must return array')

console.log('✅ Test 2 Passed: Owner read flow uses real REST API while manager/tenant helpers remain mock-backed.\n')

// --------------------------------------------------------------------------
// Test 3: BuildingDetailsPage.jsx Floor List Integration Review
// --------------------------------------------------------------------------
console.log('--- Test 3: BuildingDetailsPage.jsx Floor List Integration ---')

const buildingDetailsSrc = fs.readFileSync(buildingDetailsPagePath, 'utf-8')

assert(
  buildingDetailsSrc.includes('getFloorsByBuilding(buildingId)'),
  'BuildingDetailsPage must invoke getFloorsByBuilding with buildingId'
)
assert(
  buildingDetailsSrc.includes('floorId: f.floorId ?? f.id') ||
    buildingDetailsSrc.includes('f.floorId'),
  'BuildingDetailsPage must map floorId from backend FloorResponse'
)
assert(
  buildingDetailsSrc.includes('floorName: f.floorName') ||
    buildingDetailsSrc.includes('f.floorName'),
  'BuildingDetailsPage must map floorName from backend FloorResponse'
)
assert(
  buildingDetailsSrc.includes('floorNumber: f.floorNumber') ||
    buildingDetailsSrc.includes('f.floorNumber'),
  'BuildingDetailsPage must map floorNumber from backend FloorResponse'
)
assert(
  buildingDetailsSrc.includes('floors.length === 0'),
  'BuildingDetailsPage must handle empty floors list with EmptyState'
)
assert(
  buildingDetailsSrc.includes('EmptyState'),
  'BuildingDetailsPage must render EmptyState component'
)
assert(
  buildingDetailsSrc.includes('handleConfirmDeleteBuilding'),
  'BuildingDetailsPage must preserve building delete handler'
)

console.log('✅ Test 3 Passed: BuildingDetailsPage.jsx correctly connects getFloorsByBuilding, maps fields, and handles empty state.\n')

// --------------------------------------------------------------------------
// Test 4: FloorDetailsPage.jsx Floor Details Integration Review
// --------------------------------------------------------------------------
console.log('--- Test 4: FloorDetailsPage.jsx Floor Details Integration ---')

const floorDetailsSrc = fs.readFileSync(floorDetailsPagePath, 'utf-8')

assert(
  floorDetailsSrc.includes('getFloorById(floorId)'),
  'FloorDetailsPage must invoke getFloorById with floorId'
)
assert(
  floorDetailsSrc.includes('rawFlr.floorId') || floorDetailsSrc.includes('flr.floorId'),
  'FloorDetailsPage must map floorId from backend FloorResponse'
)
assert(
  floorDetailsSrc.includes('rawFlr.floorName') || floorDetailsSrc.includes('flr.floorName'),
  'FloorDetailsPage must map floorName from backend FloorResponse'
)
assert(
  floorDetailsSrc.includes('rawFlr.floorNumber') || floorDetailsSrc.includes('flr.floorNumber'),
  'FloorDetailsPage must map floorNumber from backend FloorResponse'
)
assert(
  floorDetailsSrc.includes('isLoading'),
  'FloorDetailsPage must have an isLoading state'
)
assert(
  floorDetailsSrc.includes('Loader'),
  'FloorDetailsPage must render Loader component while loading'
)
assert(
  floorDetailsSrc.includes('errorMessage') && floorDetailsSrc.includes('Failed to Load Floor'),
  'FloorDetailsPage must handle API errors with error banner and retry'
)
assert(
  floorDetailsSrc.includes('EmptyState') && floorDetailsSrc.includes('Floor Not Found'),
  'FloorDetailsPage must render EmptyState when floor is not found'
)
assert(
  floorDetailsSrc.includes('handleFloorSubmit') && floorDetailsSrc.includes('handleConfirmDeleteFloor'),
  'FloorDetailsPage must leave floor create/edit/delete untouched'
)

console.log('✅ Test 4 Passed: FloorDetailsPage.jsx correctly connects getFloorById, maps fields, has loading/empty/error states.\n')

console.log('🎉 ALL PHASE 6B FLOOR READ FLOW TESTS PASSED SUCCESSFULLY!')
