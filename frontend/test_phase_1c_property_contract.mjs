/**
 * Phase 1C — Property Controller + DTO Contract Verification Suite
 * 
 * Verifies frontend propertyApi.js and related components against the CURRENT
 * Spring Boot PropertyController, DTOs, Enums, and Security contracts:
 * - 6 Property Endpoints under /api/owner/properties
 * - PropertyRequest DTO field-by-field verification & payload sanitization
 * - PropertyResponse DTO mapping & response preservation
 * - Canonical enums (PropertyType, FurnishingStatus, PropertyStatus)
 * - Security & Owner-Scoping (JWT-derived owner, role PROPERTY_OWNER)
 * - Error handling & validation assumptions
 */

import assert from 'node:assert'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Mock browser environment
const storageStore = new Map()
globalThis.localStorage = {
  getItem: (key) => (storageStore.has(key) ? storageStore.get(key) : null),
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear(),
}
globalThis.window = { localStorage: globalThis.localStorage }

console.log('=================================================================')
console.log('🧪 RUNNING PHASE 1C PROPERTY CONTROLLER + DTO CONTRACT AUDIT')
console.log('=================================================================\n')

// 2. Import modules
const propertyApiPath = path.resolve(__dirname, 'src/api/propertyApi.js')
const axiosClientPath = path.resolve(__dirname, 'src/api/axiosClient.js')

const propertyApi = await import(`file://${propertyApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  PROPERTY_TYPES,
  FURNISHING_STATUSES,
  PROPERTY_STATUSES,
  CANONICAL_PROPERTY_STATUSES,
  mapPropertyTypeToBackend,
  mapFurnishingStatusToBackend,
  mapParkingAvailableToBackend,
  buildPropertyRequestPayload,
  formatPropertyRequest,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  mapBackendPropertyToUi,
} = propertyApi

let testsPassed = 0

async function runTest(name, fn) {
  try {
    await fn()
    testsPassed++
    console.log(`  ✓ ${name}`)
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`)
    console.error(err)
    process.exit(1)
  }
}

// Intercept axiosClient calls for contract verification
let recordedCall = null
axiosClient.get = async (url, config) => {
  recordedCall = { method: 'GET', url, config }
  return { success: true }
}
axiosClient.post = async (url, data, config) => {
  recordedCall = { method: 'POST', url, data, config }
  return { success: true }
}
axiosClient.put = async (url, data, config) => {
  recordedCall = { method: 'PUT', url, data, config }
  return { success: true }
}
axiosClient.delete = async (url, config) => {
  recordedCall = { method: 'DELETE', url, config }
  return { success: true }
}

// -----------------------------------------------------------------------------
// SUITE 1: CANONICAL ENUMS CONTRACT AUDIT
// -----------------------------------------------------------------------------
console.log('1. Auditing Canonical Enums (PropertyType, FurnishingStatus, PropertyStatus)...')

await runTest('PropertyType enum matches Spring Boot PropertyType.java exactly', () => {
  const expectedTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'PG', 'HOSTEL', 'COMMERCIAL']
  assert.deepStrictEqual(Object.keys(PROPERTY_TYPES).sort(), [...expectedTypes].sort())
  for (const t of expectedTypes) {
    assert.strictEqual(PROPERTY_TYPES[t], t)
  }
})

await runTest('FurnishingStatus enum matches Spring Boot FurnishingStatus.java exactly', () => {
  const expectedFurnishing = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']
  assert.deepStrictEqual(Object.keys(FURNISHING_STATUSES).sort(), [...expectedFurnishing].sort())
  for (const f of expectedFurnishing) {
    assert.strictEqual(FURNISHING_STATUSES[f], f)
  }
})

await runTest('PropertyStatus enum matches Spring Boot PropertyStatus.java exactly', () => {
  const expectedStatuses = [
    'DRAFT',
    'AVAILABLE',
    'PUBLISHED',
    'OCCUPIED',
    'UNDER_MAINTENANCE',
    'INACTIVE',
  ]
  assert.deepStrictEqual(Object.keys(PROPERTY_STATUSES).sort(), [...expectedStatuses].sort())
  assert.deepStrictEqual(CANONICAL_PROPERTY_STATUSES.sort(), [...expectedStatuses].sort())
  for (const s of expectedStatuses) {
    assert.strictEqual(PROPERTY_STATUSES[s], s)
  }
})

await runTest('mapPropertyTypeToBackend maps UI aliases to canonical backend enums', () => {
  assert.strictEqual(mapPropertyTypeToBackend('Condominium'), 'APARTMENT')
  assert.strictEqual(mapPropertyTypeToBackend('Loft'), 'APARTMENT')
  assert.strictEqual(mapPropertyTypeToBackend('Townhouse'), 'HOUSE')
  assert.strictEqual(mapPropertyTypeToBackend('Single Family'), 'HOUSE')
  assert.strictEqual(mapPropertyTypeToBackend('Villa'), 'VILLA')
  assert.strictEqual(mapPropertyTypeToBackend('PG'), 'PG')
  assert.strictEqual(mapPropertyTypeToBackend('Hostel'), 'HOSTEL')
  assert.strictEqual(mapPropertyTypeToBackend('Commercial'), 'COMMERCIAL')
})

await runTest('mapFurnishingStatusToBackend maps UI aliases to canonical backend enums', () => {
  assert.strictEqual(mapFurnishingStatusToBackend('Furnished'), 'FULLY_FURNISHED')
  assert.strictEqual(mapFurnishingStatusToBackend('Fully-Furnished'), 'FULLY_FURNISHED')
  assert.strictEqual(mapFurnishingStatusToBackend('Semi-Furnished'), 'SEMI_FURNISHED')
  assert.strictEqual(mapFurnishingStatusToBackend('Unfurnished'), 'UNFURNISHED')
})

await runTest('mapParkingAvailableToBackend maps UI parking values to boolean', () => {
  assert.strictEqual(mapParkingAvailableToBackend(true), true)
  assert.strictEqual(mapParkingAvailableToBackend(false), false)
  assert.strictEqual(mapParkingAvailableToBackend('Garage'), true)
  assert.strictEqual(mapParkingAvailableToBackend('Covered'), true)
  assert.strictEqual(mapParkingAvailableToBackend('None'), false)
  assert.strictEqual(mapParkingAvailableToBackend(''), false)
})

// -----------------------------------------------------------------------------
// SUITE 2: PROPERTYREQUEST DTO FIELD-BY-FIELD & SANITIZATION AUDIT
// -----------------------------------------------------------------------------
console.log('\n2. Auditing PropertyRequest DTO Fields & Sanitization...')

await runTest('formatPropertyRequest strips forbidden & response-only fields', () => {
  const dirtyInput = {
    // Form / UI fields
    name: '  Green Horizon Villa  ',
    type: 'Villa',
    description: '  Luxury villa with pool  ',
    area: '3200.5',
    bedrooms: '4.2', // should round to 4
    bathrooms: '3.8', // should round to 4
    furnishing: 'Fully-Furnished',
    parking: 'Garage',
    rent: '4500.00',
    deposit: '9000.00',

    // FORBIDDEN fields (must be stripped)
    ownerId: 101,
    ownerName: 'Evil Hacker',
    propertyId: 999,
    status: 'PUBLISHED', // status cannot be set via PropertyRequest
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
    address: '123 Fake Street',
    city: 'Metropolis',
    state: 'NY',
    zipCode: '10001',
    amenities: ['Pool', 'Gym'],
    buildings: [{ buildingId: 1 }],
    units: [{ unitId: 1 }],
    images: ['https://example.com/img.jpg'],
    imageUrl: 'https://example.com/img.jpg',
    totalUnits: 10,
    occupiedUnits: 5,
  }

  const payload = formatPropertyRequest(dirtyInput)

  // 10 Allowed backend fields
  assert.strictEqual(payload.propertyName, 'Green Horizon Villa')
  assert.strictEqual(payload.propertyType, 'VILLA')
  assert.strictEqual(payload.description, 'Luxury villa with pool')
  assert.strictEqual(payload.totalArea, 3200.5)
  assert.strictEqual(payload.bedrooms, 4)
  assert.strictEqual(payload.bathrooms, 4)
  assert.strictEqual(payload.furnishingStatus, 'FULLY_FURNISHED')
  assert.strictEqual(payload.parkingAvailable, true)
  assert.strictEqual(payload.monthlyRent, 4500)
  assert.strictEqual(payload.securityDeposit, 9000)

  // Strict check: Forbidden fields must be undefined
  assert.strictEqual(payload.ownerId, undefined, 'ownerId must NOT be in PropertyRequest')
  assert.strictEqual(payload.ownerName, undefined, 'ownerName must NOT be in PropertyRequest')
  assert.strictEqual(payload.propertyId, undefined, 'propertyId must NOT be in PropertyRequest')
  assert.strictEqual(payload.status, undefined, 'status must NOT be in PropertyRequest')
  assert.strictEqual(payload.createdAt, undefined, 'createdAt must NOT be in PropertyRequest')
  assert.strictEqual(payload.updatedAt, undefined, 'updatedAt must NOT be in PropertyRequest')
  assert.strictEqual(payload.address, undefined, 'address must NOT be in PropertyRequest')
  assert.strictEqual(payload.city, undefined, 'city must NOT be in PropertyRequest')
  assert.strictEqual(payload.state, undefined, 'state must NOT be in PropertyRequest')
  assert.strictEqual(payload.zipCode, undefined, 'zipCode must NOT be in PropertyRequest')
  assert.strictEqual(payload.amenities, undefined, 'amenities must NOT be in PropertyRequest')
  assert.strictEqual(payload.buildings, undefined, 'buildings must NOT be in PropertyRequest')
  assert.strictEqual(payload.units, undefined, 'units must NOT be in PropertyRequest')
  assert.strictEqual(payload.images, undefined, 'images must NOT be in PropertyRequest')

  // Total keys must be exactly 10
  assert.strictEqual(Object.keys(payload).length, 10)
})

await runTest('formatPropertyRequest preserves 0 values for numeric/boolean fields', () => {
  const zeroInput = {
    propertyName: 'Studio Loft',
    propertyType: 'APARTMENT',
    totalArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    monthlyRent: 0,
    securityDeposit: 0,
    parkingAvailable: false,
  }

  const payload = formatPropertyRequest(zeroInput)

  assert.strictEqual(payload.totalArea, 0)
  assert.strictEqual(payload.bedrooms, 0)
  assert.strictEqual(payload.bathrooms, 0)
  assert.strictEqual(payload.monthlyRent, 0)
  assert.strictEqual(payload.securityDeposit, 0)
  assert.strictEqual(payload.parkingAvailable, false)
})

// -----------------------------------------------------------------------------
// SUITE 3: ENDPOINT CONTRACT AUDIT (All 6 PropertyController Endpoints)
// -----------------------------------------------------------------------------
console.log('\n3. Auditing All 6 Spring Boot PropertyController Endpoints...')

await runTest('1. POST /api/owner/properties calls correct path, method & sanitized body', async () => {
  recordedCall = null
  await createProperty({
    propertyName: 'Skyline Tower',
    propertyType: 'COMMERCIAL',
    monthlyRent: 5000,
    ownerId: 99, // must be stripped
  })

  assert.strictEqual(recordedCall.method, 'POST')
  assert.strictEqual(recordedCall.url, '/owner/properties')
  assert.strictEqual(recordedCall.data.propertyName, 'Skyline Tower')
  assert.strictEqual(recordedCall.data.propertyType, 'COMMERCIAL')
  assert.strictEqual(recordedCall.data.monthlyRent, 5000)
  assert.strictEqual(recordedCall.data.ownerId, undefined)
})

await runTest('2. GET /api/owner/properties calls correct path and method (Owner scoped)', async () => {
  recordedCall = null
  await getMyProperties()

  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/owner/properties')
  assert.strictEqual(recordedCall.config, undefined)
})

await runTest('3. GET /api/owner/properties/{id} calls correct path with path variable', async () => {
  recordedCall = null
  await getPropertyById(42)

  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/owner/properties/42')
})

await runTest('4. PUT /api/owner/properties/{id} sends sanitized PropertyRequest body', async () => {
  recordedCall = null
  await updateProperty(42, {
    propertyName: 'Updated Villa',
    propertyType: 'VILLA',
    monthlyRent: 6000,
    status: 'PUBLISHED', // must be stripped
    ownerId: 5, // must be stripped
  })

  assert.strictEqual(recordedCall.method, 'PUT')
  assert.strictEqual(recordedCall.url, '/owner/properties/42')
  assert.strictEqual(recordedCall.data.propertyName, 'Updated Villa')
  assert.strictEqual(recordedCall.data.propertyType, 'VILLA')
  assert.strictEqual(recordedCall.data.monthlyRent, 6000)
  assert.strictEqual(recordedCall.data.status, undefined)
  assert.strictEqual(recordedCall.data.ownerId, undefined)
})

await runTest('5. DELETE /api/owner/properties/{id} calls DELETE with path variable and no body', async () => {
  recordedCall = null
  await deleteProperty(42)

  assert.strictEqual(recordedCall.method, 'DELETE')
  assert.strictEqual(recordedCall.url, '/owner/properties/42')
  assert.strictEqual(recordedCall.data, undefined)
})

await runTest('6. PUT /api/owner/properties/{id}/status sends query param status', async () => {
  recordedCall = null
  await updatePropertyStatus(42, 'AVAILABLE')

  assert.strictEqual(recordedCall.method, 'PUT')
  assert.strictEqual(recordedCall.url, '/owner/properties/42/status')
  assert.strictEqual(recordedCall.data, null)
  assert.strictEqual(recordedCall.config.params.status, 'AVAILABLE')
})

await runTest('updatePropertyStatus rejects invalid non-canonical status values', async () => {
  let thrown = false
  try {
    await updatePropertyStatus(42, 'PENDING_APPROVAL')
  } catch (e) {
    thrown = true
    assert.ok(e.message.includes('Invalid property status'))
  }
  assert.strictEqual(thrown, true)
})

// -----------------------------------------------------------------------------
// SUITE 4: RESPONSE MAPPING & DTO RECONCILIATION AUDIT
// -----------------------------------------------------------------------------
console.log('\n4. Auditing Response Mapping & DTO Reconciliation...')

await runTest('mapBackendPropertyToUi correctly maps all 16 PropertyResponse fields', () => {
  const backendResponse = {
    propertyId: 55,
    propertyName: 'Seaside Condos',
    propertyType: 'APARTMENT',
    description: 'Beautiful oceanfront living',
    totalArea: 1450.75,
    bedrooms: 3,
    bathrooms: 2,
    furnishingStatus: 'SEMI_FURNISHED',
    parkingAvailable: true,
    monthlyRent: 3200.0,
    securityDeposit: 3200.0,
    status: 'AVAILABLE',
    ownerId: 10,
    ownerName: 'John Doe',
    createdAt: '2026-01-15T10:30:00',
    updatedAt: '2026-02-01T14:45:00',
  }

  const uiData = mapBackendPropertyToUi(backendResponse)

  // Primary & alias mappings
  assert.strictEqual(uiData.propertyId, 55)
  assert.strictEqual(uiData.id, '55')
  assert.strictEqual(uiData.propertyName, 'Seaside Condos')
  assert.strictEqual(uiData.name, 'Seaside Condos')
  assert.strictEqual(uiData.propertyType, 'APARTMENT')
  assert.strictEqual(uiData.type, 'APARTMENT')
  assert.strictEqual(uiData.description, 'Beautiful oceanfront living')
  assert.strictEqual(uiData.totalArea, 1450.75)
  assert.strictEqual(uiData.area, 1450.75)
  assert.strictEqual(uiData.bedrooms, 3)
  assert.strictEqual(uiData.bathrooms, 2)
  assert.strictEqual(uiData.furnishingStatus, 'SEMI_FURNISHED')
  assert.strictEqual(uiData.furnishing, 'SEMI_FURNISHED')
  assert.strictEqual(uiData.parkingAvailable, true)
  assert.strictEqual(uiData.parking, 'Available')
  assert.strictEqual(uiData.monthlyRent, 3200)
  assert.strictEqual(uiData.securityDeposit, 3200)
  assert.strictEqual(uiData.deposit, 3200)
  assert.strictEqual(uiData.status, 'AVAILABLE')
  assert.strictEqual(uiData.ownerId, 10)
  assert.strictEqual(uiData.ownerName, 'John Doe')
  assert.strictEqual(uiData.createdAt, '2026-01-15T10:30:00')
  assert.strictEqual(uiData.updatedAt, '2026-02-01T14:45:00')
})

// -----------------------------------------------------------------------------
// SUITE 5: FRONTEND PAGES & COMPONENTS CONTRACT ALIGNMENT AUDIT
// -----------------------------------------------------------------------------
console.log('\n5. Auditing Frontend Pages & Components Integration...')

import fs from 'node:fs'

const propertiesPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/PropertiesPage.jsx'), 'utf8')
const propertyDetailsPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/PropertyDetailsPage.jsx'), 'utf8')
const addPropertyPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/AddPropertyPage.jsx'), 'utf8')
const editPropertyPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/EditPropertyPage.jsx'), 'utf8')
const ownerPropertyTableCode = fs.readFileSync(path.resolve(__dirname, 'src/components/properties/OwnerPropertyTable.jsx'), 'utf8')

await runTest('PropertiesPage.jsx uses real propertyApi methods and canonical constants', () => {
  assert.ok(propertiesPageCode.includes("getMyProperties"), 'Must call getMyProperties')
  assert.ok(propertiesPageCode.includes("deleteProperty"), 'Must call deleteProperty')
  assert.ok(propertiesPageCode.includes("updatePropertyStatus"), 'Must call updatePropertyStatus')
  assert.ok(propertiesPageCode.includes("CANONICAL_PROPERTY_STATUSES"), 'Must use CANONICAL_PROPERTY_STATUSES')
  assert.ok(!propertiesPageCode.includes("from '../../utils/ownerPropertyMockData'"), 'Must NOT import mock data in PropertiesPage')
})

await runTest('PropertyDetailsPage.jsx uses real propertyApi methods', () => {
  assert.ok(propertyDetailsPageCode.includes("getPropertyById"), 'Must call getPropertyById')
  assert.ok(propertyDetailsPageCode.includes("deleteProperty"), 'Must call deleteProperty')
  assert.ok(propertyDetailsPageCode.includes("updatePropertyStatus"), 'Must call updatePropertyStatus')
})

await runTest('AddPropertyPage.jsx uses createProperty and sanitization', () => {
  assert.ok(addPropertyPageCode.includes("createProperty"), 'Must call createProperty')
  assert.ok(addPropertyPageCode.includes("buildPropertyRequestPayload"), 'Must sanitize via buildPropertyRequestPayload')
})

await runTest('EditPropertyPage.jsx uses getPropertyById and updateProperty', () => {
  assert.ok(editPropertyPageCode.includes("getPropertyById"), 'Must call getPropertyById')
  assert.ok(editPropertyPageCode.includes("updateProperty"), 'Must call updateProperty')
  assert.ok(editPropertyPageCode.includes("buildPropertyRequestPayload"), 'Must sanitize via buildPropertyRequestPayload')
})

await runTest('OwnerPropertyTable.jsx uses CANONICAL_PROPERTY_STATUSES', () => {
  assert.ok(ownerPropertyTableCode.includes("CANONICAL_PROPERTY_STATUSES"), 'Must use CANONICAL_PROPERTY_STATUSES for status change')
})

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=================================================================')
console.log(`🎉 ALL ${testsPassed} PHASE 1C PROPERTY CONTRACT TESTS PASSED!`)
console.log('=================================================================\n')
