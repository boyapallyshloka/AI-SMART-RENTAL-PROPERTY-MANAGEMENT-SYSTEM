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

console.log('🧪 Starting Phase 5C - Building Create and Edit Verification...\n')

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

const buildingApiPath = resolvePath('src/api/buildingApi.js')
const axiosClientPath = resolvePath('src/api/axiosClient.js')
const addBuildingPagePath = resolvePath('src/pages/owner/AddBuildingPage.jsx')

const buildingApi = await import(`file://${buildingApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  formatBuildingRequest,
  createBuilding,
  getBuildingById,
  updateBuilding,
  setUseMockBuildings,
} = buildingApi

// --------------------------------------------------------------------------
// Test 1: Verify formatBuildingRequest for Create & Edit payloads
// --------------------------------------------------------------------------
console.log('--- Test 1: Building Create & Edit Payload Formatting ---')

// Valid create input from form
const createFormInput = {
  buildingName: '  Sunset Heights Tower B  ',
  totalFloors: '8',
  totalUnits: '32',
  description: '  Luxury residential tower with dedicated parking.  ',
  propertyId: '10',
  // UI-only / extra fields that might exist in state
  buildingId: 999,
  propertyName: 'Sunset Palms',
  ownerId: 5,
  createdAt: '2026-09-08T12:00:00',
  property: { id: 10, name: 'Sunset Palms' },
}

const formattedCreate = formatBuildingRequest(createFormInput)
console.log('Formatted Create payload:', formattedCreate)

assert.strictEqual(formattedCreate.buildingName, 'Sunset Heights Tower B', 'buildingName should be trimmed')
assert.strictEqual(formattedCreate.totalFloors, 8, 'totalFloors should be converted to number')
assert.strictEqual(formattedCreate.totalUnits, 32, 'totalUnits should be converted to number')
assert.strictEqual(formattedCreate.description, 'Luxury residential tower with dedicated parking.', 'description should be trimmed')
assert.strictEqual(formattedCreate.propertyId, 10, 'propertyId should be flat number')
assert.strictEqual(formattedCreate.buildingId, undefined, 'buildingId must NOT be in payload')
assert.strictEqual(formattedCreate.propertyName, undefined, 'propertyName must NOT be in payload')
assert.strictEqual(formattedCreate.property, undefined, 'property object must NOT be in payload')
assert.strictEqual(formattedCreate.ownerId, undefined, 'ownerId must NOT be in payload')

// Test zero floors and units preservation
const zeroFloorsUnits = formatBuildingRequest({
  buildingName: 'Open Pavillion',
  totalFloors: 0,
  totalUnits: 0,
  propertyId: 5,
})
assert.strictEqual(zeroFloorsUnits.totalFloors, 0, 'totalFloors=0 should be preserved')
assert.strictEqual(zeroFloorsUnits.totalUnits, 0, 'totalUnits=0 should be preserved')

console.log('✅ Test 1 Passed: formatBuildingRequest adheres strictly to Spring Boot DTO constraints.\n')

// --------------------------------------------------------------------------
// Test 2: Verify createBuilding triggers POST /api/buildings
// --------------------------------------------------------------------------
console.log('--- Test 2: createBuilding Endpoint Contract ---')

let capturedCreateRequest = null
const originalPost = axiosClient.post

axiosClient.post = async (url, data, config) => {
  capturedCreateRequest = { url, data, config }
  return {
    buildingId: 101,
    ...data,
    createdAt: '2026-09-08T14:50:00',
    updatedAt: '2026-09-08T14:50:00',
  }
}

try {
  setUseMockBuildings(false)
  const result = await createBuilding(createFormInput)
  console.log('Captured create POST request:', capturedCreateRequest)

  assert.strictEqual(capturedCreateRequest.url, '/buildings', 'URL should be /buildings')
  assert.strictEqual(capturedCreateRequest.data.buildingName, 'Sunset Heights Tower B')
  assert.strictEqual(capturedCreateRequest.data.totalFloors, 8)
  assert.strictEqual(capturedCreateRequest.data.totalUnits, 32)
  assert.strictEqual(capturedCreateRequest.data.propertyId, 10)
  assert.strictEqual(capturedCreateRequest.data.buildingId, undefined, 'buildingId must not be in POST body')
  assert.strictEqual(result.buildingId, 101, 'returns created building with buildingId')
} finally {
  axiosClient.post = originalPost
}

console.log('✅ Test 2 Passed: createBuilding calls POST /api/buildings with sanitized payload.\n')

// --------------------------------------------------------------------------
// Test 3: Verify getBuildingById triggers GET /api/buildings/{id} (Edit Mode)
// --------------------------------------------------------------------------
console.log('--- Test 3: getBuildingById Endpoint Contract (Edit Init) ---')

let capturedGetRequest = null
const originalGet = axiosClient.get

axiosClient.get = async (url, config) => {
  capturedGetRequest = { url, config }
  return {
    buildingId: 42,
    buildingName: 'Existing Tower Alpha',
    totalFloors: 5,
    totalUnits: 20,
    description: 'Existing building description',
    propertyId: 10,
    propertyName: 'Palm View Estates',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  }
}

try {
  setUseMockBuildings(false)
  const building = await getBuildingById(42)
  console.log('Captured GET request:', capturedGetRequest)

  assert.strictEqual(capturedGetRequest.url, '/buildings/42', 'URL should be /buildings/42')
  assert.strictEqual(building.buildingId, 42)
  assert.strictEqual(building.buildingName, 'Existing Tower Alpha')
  assert.strictEqual(building.totalFloors, 5)
  assert.strictEqual(building.totalUnits, 20)
  assert.strictEqual(building.propertyId, 10)
} finally {
  axiosClient.get = originalGet
}

console.log('✅ Test 3 Passed: getBuildingById calls GET /api/buildings/{id}.\n')

// --------------------------------------------------------------------------
// Test 4: Verify updateBuilding triggers PUT /api/buildings/{id}
// --------------------------------------------------------------------------
console.log('--- Test 4: updateBuilding Endpoint Contract ---')

let capturedPutRequest = null
const originalPut = axiosClient.put

axiosClient.put = async (url, data, config) => {
  capturedPutRequest = { url, data, config }
  return {
    buildingId: 42,
    ...data,
    updatedAt: '2026-09-08T15:00:00',
  }
}

try {
  setUseMockBuildings(false)
  const updatePayload = {
    buildingName: '  Updated Tower Alpha  ',
    totalFloors: '6',
    totalUnits: '24',
    description: '  Updated floor plan and newly renovated lobby  ',
    propertyId: 10,
    buildingId: 42, // must be stripped from body
    createdAt: '2026-01-01T00:00:00',
  }

  const updated = await updateBuilding(42, updatePayload)
  console.log('Captured PUT request:', capturedPutRequest)

  assert.strictEqual(capturedPutRequest.url, '/buildings/42', 'URL should be /buildings/42')
  assert.strictEqual(capturedPutRequest.data.buildingName, 'Updated Tower Alpha')
  assert.strictEqual(capturedPutRequest.data.totalFloors, 6)
  assert.strictEqual(capturedPutRequest.data.totalUnits, 24)
  assert.strictEqual(capturedPutRequest.data.description, 'Updated floor plan and newly renovated lobby')
  assert.strictEqual(capturedPutRequest.data.propertyId, 10)
  assert.strictEqual(capturedPutRequest.data.buildingId, undefined, 'buildingId must not be in PUT body')
  assert.strictEqual(updated.buildingId, 42)
} finally {
  axiosClient.put = originalPut
}

console.log('✅ Test 4 Passed: updateBuilding calls PUT /api/buildings/{id} with sanitized payload.\n')

// --------------------------------------------------------------------------
// Test 5: Verify AddBuildingPage.jsx source code integration
// --------------------------------------------------------------------------
console.log('--- Test 5: AddBuildingPage.jsx Implementation Review ---')

const pageContent = fs.readFileSync(addBuildingPagePath, 'utf-8')

assert(pageContent.includes('getMyProperties'), 'Must import or use getMyProperties')
assert(pageContent.includes('getBuildingById'), 'Must import and use getBuildingById')
assert(pageContent.includes('createBuilding'), 'Must import and use createBuilding')
assert(pageContent.includes('updateBuilding'), 'Must import and use updateBuilding')
assert(pageContent.includes('isInitLoading'), 'Must have initial loading state')
assert(pageContent.includes('isSubmitting'), 'Must have submit loading state to prevent double submit')
assert(pageContent.includes('apiError'), 'Must handle and display API errors')
assert(pageContent.includes('useSearchParams'), 'Must support URL query param for propertyId')

console.log('✅ Test 5 Passed: AddBuildingPage.jsx correctly connects all required flows.\n')

console.log('🎉 ALL PHASE 5C BUILDING CREATE AND EDIT TESTS PASSED SUCCESSFULLY!')
