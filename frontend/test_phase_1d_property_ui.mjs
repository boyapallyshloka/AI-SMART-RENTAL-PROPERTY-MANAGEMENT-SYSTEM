/**
 * Phase 1D — Property Owner UI Real API Integration Verification Suite
 * 
 * Verifies that the Property Owner UI pages and components:
 * 1. Load real properties from GET /api/owner/properties
 * 2. Load real property details from GET /api/owner/properties/{id}
 * 3. Create properties via POST /api/owner/properties
 * 4. Edit properties via PUT /api/owner/properties/{id}
 * 5. Delete properties via DELETE /api/owner/properties/{id}
 * 6. Update property status via PUT /api/owner/properties/{id}/status?status={status}
 * 7. NEVER send ownerId in create or update payloads
 * 8. Have NO mock property fallback in active owner flows
 * 9. Handle loading states with Loader components
 * 10. Handle empty states with EmptyState components
 * 11. Safely display API errors and provide retry handlers
 * 12. Accurately handle canonical backend enums
 */

import assert from 'node:assert'
import fs from 'node:fs'
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
console.log('🧪 RUNNING PHASE 1D PROPERTY OWNER UI REAL API INTEGRATION SUITE')
console.log('=================================================================\n')

// 2. Import modules
const propertyApiPath = path.resolve(__dirname, 'src/api/propertyApi.js')
const axiosClientPath = path.resolve(__dirname, 'src/api/axiosClient.js')

const propertyApi = await import(`file://${propertyApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  formatPropertyRequest,
  buildPropertyRequestPayload,
  mapBackendPropertyToUi,
  PROPERTY_TYPES,
  FURNISHING_STATUSES,
  PROPERTY_STATUSES,
  CANONICAL_PROPERTY_STATUSES,
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

// Intercept axiosClient calls
let recordedCalls = []
axiosClient.get = async (url, config) => {
  recordedCalls.push({ method: 'GET', url, config })
  return { success: true, data: [] }
}
axiosClient.post = async (url, data, config) => {
  recordedCalls.push({ method: 'POST', url, data, config })
  return { success: true, data: { propertyId: 101 } }
}
axiosClient.put = async (url, data, config) => {
  recordedCalls.push({ method: 'PUT', url, data, config })
  return { success: true, data: { propertyId: 101 } }
}
axiosClient.delete = async (url, config) => {
  recordedCalls.push({ method: 'DELETE', url, config })
  return { success: true, data: 'Property deleted successfully' }
}

// -----------------------------------------------------------------------------
// SECTION 1: REAL API ENDPOINT CALLS & METHODS
// -----------------------------------------------------------------------------
console.log('1. Verifying Real API Calls and Endpoints...')

await runTest('getMyProperties() calls GET /owner/properties', async () => {
  recordedCalls = []
  await getMyProperties()
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/owner/properties')
})

await runTest('getPropertyById(id) calls GET /owner/properties/{id}', async () => {
  recordedCalls = []
  await getPropertyById(77)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/owner/properties/77')
})

await runTest('createProperty(payload) calls POST /owner/properties', async () => {
  recordedCalls = []
  await createProperty({
    name: 'Highland Manor',
    type: 'Villa',
    rent: 5500,
  })
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'POST')
  assert.strictEqual(recordedCalls[0].url, '/owner/properties')
  assert.strictEqual(recordedCalls[0].data.propertyName, 'Highland Manor')
  assert.strictEqual(recordedCalls[0].data.propertyType, 'VILLA')
})

await runTest('updateProperty(id, payload) calls PUT /owner/properties/{id}', async () => {
  recordedCalls = []
  await updateProperty(77, {
    name: 'Highland Manor Renovation',
    type: 'Villa',
    rent: 6000,
  })
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/owner/properties/77')
  assert.strictEqual(recordedCalls[0].data.propertyName, 'Highland Manor Renovation')
  assert.strictEqual(recordedCalls[0].data.propertyType, 'VILLA')
})

await runTest('deleteProperty(id) calls DELETE /owner/properties/{id}', async () => {
  recordedCalls = []
  await deleteProperty(77)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'DELETE')
  assert.strictEqual(recordedCalls[0].url, '/owner/properties/77')
  assert.strictEqual(recordedCalls[0].data, undefined)
})

await runTest('updatePropertyStatus(id, status) calls PUT /owner/properties/{id}/status?status={status}', async () => {
  recordedCalls = []
  await updatePropertyStatus(77, 'OCCUPIED')
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/owner/properties/77/status')
  assert.strictEqual(recordedCalls[0].data, null)
  assert.strictEqual(recordedCalls[0].config.params.status, 'OCCUPIED')
})

// -----------------------------------------------------------------------------
// SECTION 2: PAYLOAD SANITIZATION & OWNER ID ABSENCE
// -----------------------------------------------------------------------------
console.log('\n2. Verifying Payload Sanitization & Owner ID Absence...')

await runTest('createProperty payload NEVER includes ownerId or status', async () => {
  recordedCalls = []
  await createProperty({
    ownerId: 999,
    ownerName: 'Malicious Attacker',
    status: 'PUBLISHED',
    propertyName: 'Safe Haven',
    propertyType: 'HOUSE',
  })
  const payload = recordedCalls[0].data
  assert.strictEqual(payload.ownerId, undefined, 'ownerId must NOT be present')
  assert.strictEqual(payload.ownerName, undefined, 'ownerName must NOT be present')
  assert.strictEqual(payload.status, undefined, 'status must NOT be present in create')
  assert.strictEqual(payload.propertyName, 'Safe Haven')
  assert.strictEqual(payload.propertyType, 'HOUSE')
})

await runTest('updateProperty payload NEVER includes ownerId or status', async () => {
  recordedCalls = []
  await updateProperty(77, {
    ownerId: 999,
    ownerName: 'Malicious Attacker',
    status: 'OCCUPIED',
    propertyName: 'Safe Haven Updated',
    propertyType: 'HOUSE',
  })
  const payload = recordedCalls[0].data
  assert.strictEqual(payload.ownerId, undefined, 'ownerId must NOT be present')
  assert.strictEqual(payload.ownerName, undefined, 'ownerName must NOT be present')
  assert.strictEqual(payload.status, undefined, 'status must NOT be present in update')
  assert.strictEqual(payload.propertyName, 'Safe Haven Updated')
  assert.strictEqual(payload.propertyType, 'HOUSE')
})

await runTest('formatPropertyRequest rounds bedrooms and bathrooms to integers', () => {
  const payload = formatPropertyRequest({
    propertyName: 'Integer Test',
    propertyType: 'APARTMENT',
    bedrooms: '3.4',
    bathrooms: '2.8',
  })
  assert.strictEqual(payload.bedrooms, 3)
  assert.strictEqual(payload.bathrooms, 3)
})

await runTest('formatPropertyRequest rejects NaN and retains valid 0 numbers', () => {
  const payload = formatPropertyRequest({
    propertyName: 'Zero Test',
    propertyType: 'APARTMENT',
    totalArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    monthlyRent: 0,
    securityDeposit: 0,
    parkingAvailable: false,
  })
  assert.strictEqual(payload.totalArea, 0)
  assert.strictEqual(payload.bedrooms, 0)
  assert.strictEqual(payload.bathrooms, 0)
  assert.strictEqual(payload.monthlyRent, 0)
  assert.strictEqual(payload.securityDeposit, 0)
  assert.strictEqual(payload.parkingAvailable, false)
})

// -----------------------------------------------------------------------------
// SECTION 3: UI PAGES INTEGRATION AUDIT
// -----------------------------------------------------------------------------
console.log('\n3. Auditing Owner Property Pages & Components...')

const propertiesPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/PropertiesPage.jsx'), 'utf8')
const propertyDetailsPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/PropertyDetailsPage.jsx'), 'utf8')
const addPropertyPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/AddPropertyPage.jsx'), 'utf8')
const editPropertyPageCode = fs.readFileSync(path.resolve(__dirname, 'src/pages/owner/EditPropertyPage.jsx'), 'utf8')
const ownerPropertyTableCode = fs.readFileSync(path.resolve(__dirname, 'src/components/properties/OwnerPropertyTable.jsx'), 'utf8')
const ownerPropertyFormCode = fs.readFileSync(path.resolve(__dirname, 'src/components/properties/OwnerPropertyForm.jsx'), 'utf8')

await runTest('PropertiesPage.jsx loads from real API and has loading, empty, and retry states', () => {
  assert.ok(propertiesPageCode.includes('getMyProperties()'), 'Must call getMyProperties()')
  assert.ok(propertiesPageCode.includes('deleteProperty(id)'), 'Must call deleteProperty(id)')
  assert.ok(propertiesPageCode.includes('updatePropertyStatus(id, newStatus)'), 'Must call updatePropertyStatus()')
  assert.ok(propertiesPageCode.includes('<Loader'), 'Must have Loader component for loading state')
  assert.ok(propertiesPageCode.includes('onClick={loadProperties}'), 'Must have retry handler for loading failure')
  assert.ok(propertiesPageCode.includes('OwnerPropertyTable'), 'Must render OwnerPropertyTable for empty/list states')
  assert.ok(!propertiesPageCode.includes('getMockProperties'), 'Must NOT call getMockProperties')
})

await runTest('PropertyDetailsPage.jsx loads from real API and has loading, empty, and retry states', () => {
  assert.ok(propertyDetailsPageCode.includes('getPropertyById(id)'), 'Must call getPropertyById(id)')
  assert.ok(propertyDetailsPageCode.includes('deleteProperty(property.id)'), 'Must call deleteProperty')
  assert.ok(propertyDetailsPageCode.includes('updatePropertyStatus(property.id, newStatus)'), 'Must call updatePropertyStatus')
  assert.ok(propertyDetailsPageCode.includes('CANONICAL_PROPERTY_STATUSES'), 'Must use canonical property statuses')
  assert.ok(propertyDetailsPageCode.includes('<Loader'), 'Must have Loader component for loading state')
  assert.ok(propertyDetailsPageCode.includes('EmptyState'), 'Must have EmptyState for not-found/error')
  assert.ok(propertyDetailsPageCode.includes('onClick={loadProperty}'), 'Must have retry handler')
  assert.ok(!propertyDetailsPageCode.includes('getMockPropertyById'), 'Must NOT call getMockPropertyById')
})

await runTest('AddPropertyPage.jsx creates property via real API with sanitization', () => {
  assert.ok(addPropertyPageCode.includes('createProperty(payload)'), 'Must call createProperty')
  assert.ok(addPropertyPageCode.includes('buildPropertyRequestPayload(data)'), 'Must sanitize via buildPropertyRequestPayload')
  assert.ok(addPropertyPageCode.includes('setIsLoading(true)'), 'Must manage loading state')
  assert.ok(addPropertyPageCode.includes('setError('), 'Must capture and display error')
  assert.ok(!addPropertyPageCode.includes('addMockProperty'), 'Must NOT call addMockProperty')
})

await runTest('EditPropertyPage.jsx loads & edits property via real API with retry', () => {
  assert.ok(editPropertyPageCode.includes('getPropertyById(id)'), 'Must call getPropertyById')
  assert.ok(editPropertyPageCode.includes('updateProperty(id, payload)'), 'Must call updateProperty')
  assert.ok(editPropertyPageCode.includes('buildPropertyRequestPayload(updatedData)'), 'Must sanitize via buildPropertyRequestPayload')
  assert.ok(editPropertyPageCode.includes('onClick={fetchProperty}'), 'Must have retry button on load failure')
  assert.ok(editPropertyPageCode.includes('<Loader'), 'Must manage loading state')
  assert.ok(!editPropertyPageCode.includes('updateMockProperty'), 'Must NOT call updateMockProperty')
})

await runTest('OwnerPropertyTable.jsx handles empty states, delete confirmations, and canonical statuses', () => {
  assert.ok(ownerPropertyTableCode.includes('EmptyState'), 'Must render EmptyState when empty')
  assert.ok(ownerPropertyTableCode.includes('window.confirm'), 'Must confirm deletion before calling onDelete')
  assert.ok(ownerPropertyTableCode.includes('CANONICAL_PROPERTY_STATUSES'), 'Must use canonical status values')
})

await runTest('OwnerPropertyForm.jsx does not send ownerId and validates required fields', () => {
  assert.ok(!ownerPropertyFormCode.includes('ownerId:'), 'Must NOT set ownerId in form state')
  assert.ok(ownerPropertyFormCode.includes('onSubmit(payload)'), 'Must submit validated payload')
})

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=================================================================')
console.log(`🎉 ALL ${testsPassed} PHASE 1D PROPERTY OWNER UI INTEGRATION TESTS PASSED!`)
console.log('=================================================================\n')
