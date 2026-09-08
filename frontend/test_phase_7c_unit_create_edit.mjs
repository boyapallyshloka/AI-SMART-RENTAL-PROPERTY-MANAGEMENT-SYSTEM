/**
 * Phase 7C — Unit Create & Edit Flow Verification Suite
 */
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

console.log('🧪 Starting Phase 7C - Unit Create & Edit Flow Verification...\n')

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

const unitApiPath = resolvePath('src/api/unitApi.js')
const axiosClientPath = resolvePath('src/api/axiosClient.js')
const addUnitPagePath = resolvePath('src/pages/owner/AddUnitPage.jsx')
const unitDetailsPagePath = resolvePath('src/pages/owner/UnitDetailsPage.jsx')
const floorDetailsPagePath = resolvePath('src/pages/owner/FloorDetailsPage.jsx')

const unitApi = await import(`file://${unitApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  createUnit,
  updateUnit,
  getUnitById,
  formatUnitRequest,
  ALLOWED_UNIT_FIELDS,
  getUnitsForManager,
  getUnitsForTenant,
  getUnitByIdForManager,
  getUnitByIdForTenant,
} = unitApi

let testCount = 0
async function test(desc, fn) {
  testCount++
  try {
    await fn()
    console.log(`✅ ${testCount}. ${desc}`)
  } catch (err) {
    console.error(`❌ ${testCount}. FAILED: ${desc}`)
    console.error(err)
    process.exit(1)
  }
}

// --------------------------------------------------------------------------
// 1. Endpoint & Payload Sanitization Verification
// --------------------------------------------------------------------------
console.log('--- Checking Endpoint Contracts & Sanitization ---')

let capturedCalls = []
axiosClient.post = async (url, data, config) => {
  capturedCalls.push({ method: 'POST', url, data, config })
  return { data: { unitId: 501, ...data } }
}

axiosClient.put = async (url, data, config) => {
  capturedCalls.push({ method: 'PUT', url, data, config })
  return { data: { unitId: 501, ...data } }
}

const addUnitSrc = fs.readFileSync(addUnitPagePath, 'utf8')

await test('Owner Add Unit uses createUnit()', () => {
  assert(addUnitSrc.includes('createUnit(payload)'))
})

await test('Owner Edit Unit uses updateUnit()', () => {
  assert(addUnitSrc.includes('updateUnit(unitId, payload)'))
})

await test('Create uses POST /api/units', async () => {
  capturedCalls = []
  await createUnit({
    unitNumber: '301',
    unitType: 'APARTMENT',
    area: 900,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 2100,
    securityDeposit: 2100,
    status: 'VACANT',
    description: 'Corner penthouse view',
    floorId: 10,
  })
  assert.strictEqual(capturedCalls.length, 1)
  assert.strictEqual(capturedCalls[0].method, 'POST')
  assert.strictEqual(capturedCalls[0].url, '/units')
})

await test('Update uses PUT /api/units/{unitId}', async () => {
  capturedCalls = []
  await updateUnit(501, {
    unitNumber: '301-B',
    unitType: 'APARTMENT',
    area: 950,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 2200,
    securityDeposit: 2200,
    status: 'OCCUPIED',
    description: 'Updated description',
    floorId: 10,
  })
  assert.strictEqual(capturedCalls.length, 1)
  assert.strictEqual(capturedCalls[0].method, 'PUT')
  assert.strictEqual(capturedCalls[0].url, '/units/501')
})

await test('Create payload contains only allowed UnitRequest fields', async () => {
  capturedCalls = []
  const dirtyInput = {
    unitId: 999,
    id: 999,
    unitNumber: '101',
    unitType: 'APARTMENT',
    area: 750,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1300,
    securityDeposit: 1300,
    status: 'VACANT',
    description: 'Brand new flooring',
    floorId: 5,
    floor: { floorId: 5, floorName: 'Floor 1' },
    floorName: 'Floor 1',
    floorNumber: 1,
    building: { buildingId: 2, buildingName: 'North Tower' },
    buildingId: 2,
    buildingName: 'North Tower',
    property: { propertyId: 1, name: 'Palms' },
    propertyId: 1,
    propertyName: 'Palms',
    ownerId: 88,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
    someUiTag: 'badge',
  }
  await createUnit(dirtyInput)
  const sentPayload = capturedCalls[0].data
  for (const key of Object.keys(sentPayload)) {
    assert(
      ALLOWED_UNIT_FIELDS.includes(key),
      `Unexpected field "${key}" found in create payload`
    )
  }
})

await test('Update payload contains only allowed UnitRequest fields', async () => {
  capturedCalls = []
  const dirtyInput = {
    unitId: 777,
    id: 777,
    unitNumber: '202',
    unitType: 'ROOM',
    area: 400,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 850,
    securityDeposit: 850,
    status: 'RESERVED',
    description: 'Private studio',
    floorId: 8,
    buildingId: 3,
    buildingName: 'South Wing',
    propertyId: 1,
    propertyName: 'Palms',
    ownerId: 44,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
  }
  await updateUnit(777, dirtyInput)
  const sentPayload = capturedCalls[0].data
  for (const key of Object.keys(sentPayload)) {
    assert(
      ALLOWED_UNIT_FIELDS.includes(key),
      `Unexpected field "${key}" found in update payload`
    )
  }
})

await test('floorId is included correctly as a numeric ID', async () => {
  capturedCalls = []
  await createUnit({
    unitNumber: '404',
    unitType: 'APARTMENT',
    monthlyRent: 1200,
    securityDeposit: 1200,
    status: 'VACANT',
    floorId: '42',
  })
  assert.strictEqual(typeof capturedCalls[0].data.floorId, 'number')
  assert.strictEqual(capturedCalls[0].data.floorId, 42)
})

await test('unitId/id are excluded from request body', () => {
  const formatted = formatUnitRequest({
    unitId: 123,
    id: 456,
    unitNumber: '101',
    unitType: 'APARTMENT',
    floorId: 2,
    monthlyRent: 1000,
    securityDeposit: 1000,
  })
  assert.strictEqual(formatted.unitId, undefined)
  assert.strictEqual(formatted.id, undefined)
})

await test('building/property relationship fields are excluded from request body', () => {
  const formatted = formatUnitRequest({
    unitNumber: '101',
    unitType: 'APARTMENT',
    floorId: 2,
    monthlyRent: 1000,
    securityDeposit: 1000,
    floor: { id: 2 },
    floorName: 'Ground Floor',
    floorNumber: 0,
    building: { id: 1 },
    buildingId: 1,
    buildingName: 'Tower A',
    property: { id: 5 },
    propertyId: 5,
    propertyName: 'Grand Palms',
  })
  assert.strictEqual(formatted.floor, undefined)
  assert.strictEqual(formatted.floorName, undefined)
  assert.strictEqual(formatted.floorNumber, undefined)
  assert.strictEqual(formatted.building, undefined)
  assert.strictEqual(formatted.buildingId, undefined)
  assert.strictEqual(formatted.buildingName, undefined)
  assert.strictEqual(formatted.property, undefined)
  assert.strictEqual(formatted.propertyId, undefined)
  assert.strictEqual(formatted.propertyName, undefined)
})

await test('ownerId is excluded from request body', () => {
  const formatted = formatUnitRequest({
    unitNumber: '101',
    unitType: 'APARTMENT',
    floorId: 2,
    monthlyRent: 1000,
    securityDeposit: 1000,
    ownerId: 99,
  })
  assert.strictEqual(formatted.ownerId, undefined)
})

await test('createdAt/updatedAt are excluded from request body', () => {
  const formatted = formatUnitRequest({
    unitNumber: '101',
    unitType: 'APARTMENT',
    floorId: 2,
    monthlyRent: 1000,
    securityDeposit: 1000,
    createdAt: '2026-09-08T00:00:00Z',
    updatedAt: '2026-09-08T00:00:00Z',
  })
  assert.strictEqual(formatted.createdAt, undefined)
  assert.strictEqual(formatted.updatedAt, undefined)
})

// --------------------------------------------------------------------------
// 2. AddUnitPage.jsx UX, Form Validation & Flow Review
// --------------------------------------------------------------------------
console.log('\n--- Checking AddUnitPage.jsx UX, Validation & State Handling ---')

await test('Loading state exists while loading initial context and saving', () => {
  assert(addUnitSrc.includes('isPageLoading'))
  assert(addUnitSrc.includes('isSubmitting'))
  assert(addUnitSrc.includes('<Loader'))
})

await test('Duplicate submission is prevented via isSubmitting guard', () => {
  assert(addUnitSrc.includes('if (isSubmitting) return'))
  assert(addUnitSrc.includes('disabled={isSubmitting}'))
})

await test('Validation exists for required fields, enums, and non-negative numbers', () => {
  assert(addUnitSrc.includes('validate = () =>'))
  assert(addUnitSrc.includes('Unit number is required'))
  assert(addUnitSrc.includes('Unit type must be APARTMENT or ROOM'))
  assert(addUnitSrc.includes('Occupancy status must be'))
  assert(addUnitSrc.includes('Valid floor association is required'))
})

await test('API errors remain on form without triggering mock fallback', () => {
  assert(addUnitSrc.includes('catch (err)'))
  assert(addUnitSrc.includes('setErrorMessage(errorMsg)'))
  assert(!addUnitSrc.includes('catch { addMockUnit'))
  assert(!addUnitSrc.includes('catch { updateMockUnit'))
})

await test('Successful create has correct navigation and feedback', () => {
  assert(addUnitSrc.includes('await createUnit(payload)'))
  assert(
    addUnitSrc.includes('/owner/buildings/') &&
    addUnitSrc.includes('/floors/')
  )
  assert(addUnitSrc.includes('was created successfully'))
})

await test('Successful edit has correct navigation and feedback', () => {
  assert(addUnitSrc.includes('await updateUnit(unitId, payload)'))
  assert(addUnitSrc.includes('/owner/units/${unitId}'))
  assert(addUnitSrc.includes('was updated successfully'))
})

await test('Active OWNER create/edit no longer depends on mock implementation', () => {
  assert(!addUnitSrc.includes('addMockUnit'))
  assert(!addUnitSrc.includes('updateMockUnit'))
  assert(addUnitSrc.includes('createUnit,') && addUnitSrc.includes('updateUnit,'))
})

// --------------------------------------------------------------------------
// 3. Mock Helpers & Untouched Delete Boundary
// --------------------------------------------------------------------------
console.log('\n--- Checking Mock Helpers & Untouched Delete Boundary ---')

await test('Manager/Tenant mock helpers remain preserved', () => {
  assert.strictEqual(typeof getUnitsForManager, 'function')
  assert.strictEqual(typeof getUnitsForTenant, 'function')
  assert.strictEqual(typeof getUnitByIdForManager, 'function')
  assert.strictEqual(typeof getUnitByIdForTenant, 'function')
})

await test('Unit delete remains untouched for Phase 7C boundary', () => {
  const unitDetailsSrc = fs.readFileSync(unitDetailsPagePath, 'utf8')
  const floorDetailsSrc = fs.readFileSync(floorDetailsPagePath, 'utf8')
  assert(unitDetailsSrc.includes('deleteUnit'))
  assert(floorDetailsSrc.includes('deleteUnit'))
  // AddUnitPage does not handle deletion
  assert(!addUnitSrc.includes('deleteUnit'))
})

console.log('\n🎉 ALL 20 PHASE 7C UNIT CREATE & EDIT VERIFICATIONS PASSED!\n')
