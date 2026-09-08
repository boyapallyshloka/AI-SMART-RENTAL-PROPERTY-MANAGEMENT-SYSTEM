import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// Mock storage
const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
}

const projectRoot = 'C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend'

import axiosClient from 'file:///C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/api/axiosClient.js'
import * as propertyApi from 'file:///C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/api/propertyApi.js'

console.log('--- 1. Testing Codebase Decoupling from Mock Functions ---')
const addPropertyContent = fs.readFileSync(
  path.join(projectRoot, 'src/pages/owner/AddPropertyPage.jsx'),
  'utf-8'
)
const editPropertyContent = fs.readFileSync(
  path.join(projectRoot, 'src/pages/owner/EditPropertyPage.jsx'),
  'utf-8'
)
const formContent = fs.readFileSync(
  path.join(projectRoot, 'src/components/properties/OwnerPropertyForm.jsx'),
  'utf-8'
)

// Check AddPropertyPage
assert.ok(!addPropertyContent.includes('addMockProperty'), 'FAIL: AddPropertyPage must not reference addMockProperty')
assert.ok(addPropertyContent.includes('createProperty'), 'FAIL: AddPropertyPage must import and call createProperty')
assert.ok(addPropertyContent.includes('buildPropertyRequestPayload'), 'FAIL: AddPropertyPage must use buildPropertyRequestPayload')
console.log('✔ AddPropertyPage.jsx disconnected from addMockProperty and uses createProperty')

// Check EditPropertyPage
assert.ok(!editPropertyContent.includes('getMockPropertyById'), 'FAIL: EditPropertyPage must not reference getMockPropertyById')
assert.ok(!editPropertyContent.includes('updateMockProperty'), 'FAIL: EditPropertyPage must not reference updateMockProperty')
assert.ok(editPropertyContent.includes('getPropertyById'), 'FAIL: EditPropertyPage must import and call getPropertyById')
assert.ok(editPropertyContent.includes('updateProperty'), 'FAIL: EditPropertyPage must import and call updateProperty')
assert.ok(editPropertyContent.includes('buildPropertyRequestPayload'), 'FAIL: EditPropertyPage must use buildPropertyRequestPayload')
console.log('✔ EditPropertyPage.jsx disconnected from mock reads/writes and uses getPropertyById + updateProperty')

// Check OwnerPropertyForm duplicate submission prevention
assert.ok(formContent.includes('if (isLoading) return'), 'FAIL: OwnerPropertyForm must prevent duplicate submissions when isLoading')
assert.ok(formContent.includes('disabled={isLoading}'), 'FAIL: OwnerPropertyForm must disable submit button when isLoading')
console.log('✔ OwnerPropertyForm.jsx enforces duplicate submission prevention and loading state')

console.log('\n--- 2. Testing Exact Payload Mapping & Allowed PropertyRequest Fields ---')
const sampleFormData = {
  name: 'Oceanview Penthouse',
  type: 'Apartment',
  description: 'Panoramic ocean views and terrace.',
  area: 1850,
  bedrooms: 3,
  bathrooms: 2.5,
  furnishing: 'Furnished',
  parking: 'Garage',
  monthlyRent: 4500,
  deposit: 5000,
  // UI & Response fields that MUST be filtered out:
  ownerId: 99,
  ownerName: 'Imposter Owner',
  propertyId: 888,
  status: 'DRAFT',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
  address: '123 Fake Street',
  city: 'Malibu',
  state: 'CA',
  zipCode: '90265',
  amenities: ['Pool', 'Gym'],
  buildings: ['B1'],
  units: ['U1'],
  images: ['https://example.com/img.jpg'],
  imageUrl: 'https://example.com/img.jpg',
  totalUnits: 10,
  occupiedUnits: 2,
}

const payload = propertyApi.buildPropertyRequestPayload(sampleFormData)

// Allowed fields list
const ALLOWED_FIELDS = new Set([
  'propertyName',
  'propertyType',
  'description',
  'totalArea',
  'bedrooms',
  'bathrooms',
  'furnishingStatus',
  'parkingAvailable',
  'monthlyRent',
  'securityDeposit',
])

// 1. Verify every key in payload is an allowed PropertyRequest field
for (const key of Object.keys(payload)) {
  assert.ok(ALLOWED_FIELDS.has(key), `FAIL: Key "${key}" is not an allowed PropertyRequest field`)
}
console.log('✔ Payload strictly contains ONLY valid PropertyRequest fields')

// 2. Verify field name transformations
assert.equal(payload.propertyName, 'Oceanview Penthouse', 'name must map to propertyName')
assert.equal(payload.propertyType, 'APARTMENT', 'type "Apartment" must map to canonical enum APARTMENT')
assert.equal(payload.description, 'Panoramic ocean views and terrace.', 'description must be preserved')
assert.equal(payload.totalArea, 1850, 'area must map to totalArea')
assert.equal(payload.bedrooms, 3, 'bedrooms must map correctly')
assert.equal(payload.bathrooms, 2.5, 'bathrooms must map correctly')
assert.equal(payload.furnishingStatus, 'FULLY_FURNISHED', 'furnishing "Furnished" must map to canonical enum FULLY_FURNISHED')
assert.equal(payload.parkingAvailable, true, 'parking "Garage" must map to parkingAvailable=true')
assert.equal(payload.monthlyRent, 4500, 'monthlyRent must map correctly')
assert.equal(payload.securityDeposit, 5000, 'deposit must map to securityDeposit')
console.log('✔ Form field transformations (name, type, area, furnishing, parking, rent, deposit) verified')

// 3. Verify ownerId is absent
assert.equal(payload.ownerId, undefined, 'ownerId MUST be strictly absent')
assert.equal('ownerId' in payload, false, 'ownerId property MUST NOT exist in payload')
console.log('✔ ownerId is strictly absent from payload')

// 4. Verify other excluded UI/response fields
const forbiddenFields = [
  'ownerId', 'ownerName', 'propertyId', 'status', 'createdAt', 'updatedAt',
  'address', 'city', 'state', 'zipCode', 'amenities', 'buildings', 'units',
  'images', 'imageUrl', 'totalUnits', 'occupiedUnits'
]
for (const field of forbiddenFields) {
  assert.equal(payload[field], undefined, `FAIL: Forbidden field "${field}" must not be in payload`)
  assert.equal(field in payload, false, `FAIL: Forbidden field "${field}" must not exist in payload`)
}
console.log('✔ All UI/response-only fields are strictly excluded')

console.log('\n--- 3. Testing Enum Mapping Variations ---')
// Property Type variations
assert.equal(propertyApi.mapPropertyTypeToBackend('Apartment'), 'APARTMENT')
assert.equal(propertyApi.mapPropertyTypeToBackend('Villa'), 'VILLA')
assert.equal(propertyApi.mapPropertyTypeToBackend('House'), 'HOUSE')
assert.equal(propertyApi.mapPropertyTypeToBackend('Townhouse'), 'HOUSE')
assert.equal(propertyApi.mapPropertyTypeToBackend('Single Family'), 'HOUSE')
assert.equal(propertyApi.mapPropertyTypeToBackend('Loft'), 'APARTMENT')
assert.equal(propertyApi.mapPropertyTypeToBackend('Commercial'), 'COMMERCIAL')
assert.equal(propertyApi.mapPropertyTypeToBackend('PG'), 'PG')
assert.equal(propertyApi.mapPropertyTypeToBackend('Hostel'), 'HOSTEL')

// Furnishing variations
assert.equal(propertyApi.mapFurnishingStatusToBackend('Furnished'), 'FULLY_FURNISHED')
assert.equal(propertyApi.mapFurnishingStatusToBackend('Fully Furnished'), 'FULLY_FURNISHED')
assert.equal(propertyApi.mapFurnishingStatusToBackend('Semi-Furnished'), 'SEMI_FURNISHED')
assert.equal(propertyApi.mapFurnishingStatusToBackend('Unfurnished'), 'UNFURNISHED')

// Parking variations
assert.equal(propertyApi.mapParkingAvailableToBackend('Garage'), true)
assert.equal(propertyApi.mapParkingAvailableToBackend('Covered'), true)
assert.equal(propertyApi.mapParkingAvailableToBackend('Street'), true)
assert.equal(propertyApi.mapParkingAvailableToBackend('None'), false)
assert.equal(propertyApi.mapParkingAvailableToBackend(true), true)
assert.equal(propertyApi.mapParkingAvailableToBackend(false), false)
console.log('✔ All propertyType, furnishingStatus, and parkingAvailable variations mapped accurately')

console.log('\n--- 4. Testing createProperty and updateProperty API Dispatches ---')
let capturedPost = null
let capturedPut = null

// Mock axiosClient post and put
const originalPost = axiosClient.post
const originalPut = axiosClient.put

axiosClient.post = async (url, data, config) => {
  capturedPost = { url, data, config }
  return { propertyId: 101, ...data }
}

axiosClient.put = async (url, data, config) => {
  capturedPut = { url, data, config }
  return { propertyId: 101, ...data }
}

try {
  // Call createProperty
  await propertyApi.createProperty(sampleFormData)
  assert.equal(capturedPost.url, '/owner/properties', 'createProperty must POST to /owner/properties')
  assert.equal(capturedPost.data.propertyName, 'Oceanview Penthouse')
  assert.equal(capturedPost.data.propertyType, 'APARTMENT')
  assert.equal(capturedPost.data.ownerId, undefined, 'ownerId must be absent from createProperty dispatch')
  console.log('✔ createProperty correctly targets POST /owner/properties without ownerId')

  // Call updateProperty
  await propertyApi.updateProperty(101, sampleFormData)
  assert.equal(capturedPut.url, '/owner/properties/101', 'updateProperty must PUT to /owner/properties/101')
  assert.equal(capturedPut.data.propertyName, 'Oceanview Penthouse')
  assert.equal(capturedPut.data.propertyType, 'APARTMENT')
  assert.equal(capturedPut.data.ownerId, undefined, 'ownerId must be absent from updateProperty dispatch')
  console.log('✔ updateProperty correctly targets PUT /owner/properties/{id} without ownerId')
} finally {
  axiosClient.post = originalPost
  axiosClient.put = originalPut
}

console.log('\n======================================================')
console.log('ALL PHASE 3C PROPERTY CREATE & EDIT TESTS PASSED! 🎉')
console.log('======================================================')
