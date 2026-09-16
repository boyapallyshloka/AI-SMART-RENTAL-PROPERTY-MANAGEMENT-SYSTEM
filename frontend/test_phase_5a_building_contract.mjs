/**
 * Phase 5A Building API Contract Verification Suite
 */
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Setup Mock environment for Node.js
globalThis.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
}

async function runTests() {
  console.log('=== Starting Phase 5A Building API Contract Verification Tests ===\n')

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

  const axiosClientModule = await import(`file://${axiosClientPath}`)
  const axiosClient = axiosClientModule.default

  const buildingApi = await import(`file://${buildingApiPath}`)

  let recordedCalls = []
  // Mock axiosClient methods
  axiosClient.get = async (url, config) => {
    recordedCalls.push({ method: 'GET', url, config })
    return { data: [] }
  }
  axiosClient.post = async (url, data, config) => {
    recordedCalls.push({ method: 'POST', url, data, config })
    return { data: { buildingId: 101, ...data } }
  }
  axiosClient.put = async (url, data, config) => {
    recordedCalls.push({ method: 'PUT', url, data, config })
    return { data: { buildingId: 101, ...data } }
  }
  axiosClient.delete = async (url, config) => {
    recordedCalls.push({ method: 'DELETE', url, config })
    return { data: { success: true } }
  }

  // TEST 1: ALLOWED_BUILDING_FIELDS definition
  console.log('--- 1. Testing ALLOWED_BUILDING_FIELDS constant ---')
  assert.ok(Array.isArray(buildingApi.ALLOWED_BUILDING_FIELDS))
  assert.deepStrictEqual(
    [...buildingApi.ALLOWED_BUILDING_FIELDS].sort(),
    ['buildingName', 'totalFloors', 'totalUnits', 'description', 'propertyId'].sort()
  )
  console.log('✔ ALLOWED_BUILDING_FIELDS matches backend contract exactly')

  // TEST 2: formatBuildingRequest sanitization & numeric validation
  console.log('\n--- 2. Testing formatBuildingRequest sanitization & numeric handling ---')
  const messyInput = {
    name: 'Tower Grand',
    floors: '12',
    units: 48,
    description: 'Luxury highrise building',
    property: { id: 77, propertyName: 'Sunset Heights' }, // nested property object
    buildingId: 999, // FORBIDDEN
    id: 999, // FORBIDDEN
    propertyName: 'Sunset Heights', // FORBIDDEN
    createdAt: '2026-01-01', // FORBIDDEN
    updatedAt: '2026-01-02', // FORBIDDEN
    ownerId: 5, // FORBIDDEN
    randomUIField: 'active', // FORBIDDEN
  }

  const formatted = buildingApi.formatBuildingRequest(messyInput)
  assert.strictEqual(formatted.buildingName, 'Tower Grand')
  assert.strictEqual(formatted.totalFloors, 12)
  assert.strictEqual(formatted.totalUnits, 48)
  assert.strictEqual(formatted.description, 'Luxury highrise building')
  assert.strictEqual(formatted.propertyId, 77, 'propertyId must be flattened to a number')
  assert.strictEqual(formatted.property, undefined, 'nested property object must NOT be sent')
  assert.strictEqual(formatted.buildingId, undefined, 'buildingId must NOT be in request body')
  assert.strictEqual(formatted.id, undefined, 'id must NOT be in request body')
  assert.strictEqual(formatted.propertyName, undefined, 'propertyName must NOT be in request body')
  assert.strictEqual(formatted.createdAt, undefined, 'createdAt must NOT be in request body')
  assert.strictEqual(formatted.updatedAt, undefined, 'updatedAt must NOT be in request body')
  assert.strictEqual(formatted.ownerId, undefined, 'ownerId must NOT be in request body')
  assert.strictEqual(formatted.randomUIField, undefined)
  assert.deepStrictEqual(
    Object.keys(formatted).sort(),
    ['buildingName', 'totalFloors', 'totalUnits', 'description', 'propertyId'].sort()
  )
  console.log('✔ formatBuildingRequest properly sanitizes fields, flattens propertyId, and excludes forbidden fields')

  // Test zero floors and units preservation
  console.log('\n--- 3. Testing zero floors and units numeric preservation ---')
  const zeroInput = {
    buildingName: 'Open Ground Structure',
    totalFloors: 0,
    totalUnits: 0,
    propertyId: 10,
  }
  const formattedZero = buildingApi.formatBuildingRequest(zeroInput)
  assert.strictEqual(formattedZero.totalFloors, 0, 'totalFloors: 0 must be preserved as number')
  assert.strictEqual(formattedZero.totalUnits, 0, 'totalUnits: 0 must be preserved as number')
  assert.strictEqual(formattedZero.propertyId, 10)
  console.log('✔ formatBuildingRequest preserves 0 for totalFloors and totalUnits without omitting or defaulting')

  // Enable real REST mode for network verification
  buildingApi.setUseMockBuildings(false)

  // TEST 4: POST /api/buildings (createBuilding)
  console.log('\n--- 4. Testing POST /api/buildings ---')
  recordedCalls = []
  await buildingApi.createBuilding(messyInput)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'POST')
  assert.strictEqual(recordedCalls[0].url, '/buildings')
  assert.strictEqual(recordedCalls[0].data.buildingName, 'Tower Grand')
  assert.strictEqual(recordedCalls[0].data.propertyId, 77)
  assert.strictEqual(recordedCalls[0].data.totalFloors, 12)
  assert.strictEqual(recordedCalls[0].data.totalUnits, 48)
  assert.strictEqual(recordedCalls[0].data.buildingId, undefined)
  console.log('✔ createBuilding sends sanitized BuildingRequest to POST /api/buildings with propertyId')

  // TEST 5: GET /api/buildings/property/{propertyId} (getBuildingsByProperty)
  console.log('\n--- 5. Testing GET /api/buildings/property/{propertyId} ---')
  recordedCalls = []
  await buildingApi.getBuildingsByProperty(77)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/buildings/property/77')
  console.log('✔ getBuildingsByProperty requests GET /api/buildings/property/{propertyId}')

  // TEST 6: GET /api/buildings/{buildingId} (getBuildingById)
  console.log('\n--- 6. Testing GET /api/buildings/{buildingId} ---')
  recordedCalls = []
  await buildingApi.getBuildingById(101)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/buildings/101')
  console.log('✔ getBuildingById requests GET /api/buildings/{buildingId}')

  // TEST 7: PUT /api/buildings/{buildingId} (updateBuilding)
  console.log('\n--- 7. Testing PUT /api/buildings/{buildingId} ---')
  recordedCalls = []
  await buildingApi.updateBuilding(101, {
    buildingName: 'Tower Grand Renovation',
    totalFloors: 14,
    totalUnits: 56,
    propertyId: 77,
    buildingId: 101, // must be stripped from body
  })
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/buildings/101')
  assert.strictEqual(recordedCalls[0].data.buildingName, 'Tower Grand Renovation')
  assert.strictEqual(recordedCalls[0].data.totalFloors, 14)
  assert.strictEqual(recordedCalls[0].data.totalUnits, 56)
  assert.strictEqual(recordedCalls[0].data.propertyId, 77)
  assert.strictEqual(recordedCalls[0].data.buildingId, undefined, 'buildingId must be stripped from body')
  console.log('✔ updateBuilding sends sanitized BuildingRequest to PUT /api/buildings/{buildingId}')

  // TEST 8: DELETE /api/buildings/{buildingId} (deleteBuilding)
  console.log('\n--- 8. Testing DELETE /api/buildings/{buildingId} ---')
  recordedCalls = []
  await buildingApi.deleteBuilding(101)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'DELETE')
  assert.strictEqual(recordedCalls[0].url, '/buildings/101')
  console.log('✔ deleteBuilding requests DELETE /api/buildings/{buildingId}')

  // Reset mock toggle to preserve existing pages
  buildingApi.setUseMockBuildings(true)
  assert.strictEqual(buildingApi.isUsingMockBuildings(), true)

  // TEST 9: Verify preserved helper functions
  console.log('\n--- 9. Testing preserved UI compatibility helpers ---')
  assert.strictEqual(typeof buildingApi.getAllBuildings, 'function')
  assert.strictEqual(typeof buildingApi.getBuildingsForManager, 'function')
  assert.strictEqual(typeof buildingApi.getBuildingByIdForManager, 'function')
  assert.strictEqual(typeof buildingApi.getBuildingsForTenant, 'function')
  assert.strictEqual(typeof buildingApi.getTenantRentalContext, 'function')
  assert.strictEqual(typeof buildingApi.getBuildingByIdForTenant, 'function')
  console.log('✔ All UI compatibility helpers preserved for existing pages')

  console.log('\n======================================================')
  console.log('ALL PHASE 5A BUILDING API CONTRACT TESTS PASSED! 🎉')
  console.log('======================================================')
}

runTests().catch((err) => {
  console.error('Test Failed:', err)
  process.exit(1)
})
