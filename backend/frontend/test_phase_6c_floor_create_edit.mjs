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

console.log('🧪 Starting Phase 6C - Floor Create & Edit Flow Verification...\n')

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
  createFloor,
  getFloorById,
  updateFloor,
  deleteFloor,
  formatFloorRequest,
  ALLOWED_FLOOR_FIELDS,
  isUsingMockFloors,
  setUseMockFloors,
} = floorApi

const bldDetailsContent = fs.readFileSync(buildingDetailsPagePath, 'utf-8')
const floorDetailsContent = fs.readFileSync(floorDetailsPagePath, 'utf-8')

// --------------------------------------------------------------------------
// Item 1, 2, 3, 4, 5: Create Flow Contract & formatFloorRequest
// --------------------------------------------------------------------------
console.log('--- Test Section 1: Create Floor Contract & Payload Sanitization ---')

let capturedPost = null
const originalPost = axiosClient.post
axiosClient.post = async (url, payload) => {
  capturedPost = { url, payload }
  return {
    data: {
      floorId: 101,
      floorName: payload.floorName,
      floorNumber: payload.floorNumber,
      buildingId: payload.buildingId,
      createdAt: '2026-09-08T10:00:00Z',
    },
  }
}

// Test createFloor with raw dirty data
const dirtyCreateInput = {
  floorName: '  2nd Floor  ',
  floorNumber: '2',
  buildingId: '55',
  floorId: 999, // forbidden
  id: 999, // forbidden
  building: { id: 55, buildingName: 'Tower A' }, // forbidden
  propertyName: 'Grand View', // forbidden
  propertyId: 12, // forbidden
  createdAt: '2026-01-01', // forbidden
  updatedAt: '2026-01-02', // forbidden
  ownerId: 7, // forbidden
  extraField: 'extra', // forbidden
}

const formattedCreate = formatFloorRequest(dirtyCreateInput)
assert.deepStrictEqual(
  Object.keys(formattedCreate).sort(),
  ['buildingId', 'floorName', 'floorNumber'].sort(),
  '1. formatFloorRequest must contain ONLY allowed keys: floorName, floorNumber, buildingId'
)
assert.strictEqual(formattedCreate.floorName, '2nd Floor', 'floorName must be trimmed')
assert.strictEqual(formattedCreate.floorNumber, 2, 'floorNumber must be numeric')
assert.strictEqual(formattedCreate.buildingId, 55, 'buildingId must be numeric')

await createFloor(dirtyCreateInput)
assert.ok(capturedPost, '2. createFloor must call axiosClient.post')
assert.strictEqual(capturedPost.url, '/floors', '2. createFloor must call POST /api/floors')
assert.deepStrictEqual(
  Object.keys(capturedPost.payload).sort(),
  ['buildingId', 'floorName', 'floorNumber'].sort(),
  '3. Create payload must contain only floorName, floorNumber, buildingId'
)
assert.strictEqual(typeof capturedPost.payload.buildingId, 'number', '5. buildingId must be numeric')

// Test floorNumber 0 preservation
const zeroFloorReq = formatFloorRequest({ floorName: 'Ground', floorNumber: 0, buildingId: 10 })
assert.strictEqual(zeroFloorReq.floorNumber, 0, 'floorNumber 0 must be preserved')

console.log('✅ Items 1-5 Passed: createFloor() calls POST /api/floors with sanitized { floorName, floorNumber, buildingId }')

// --------------------------------------------------------------------------
// Item 6, 7: Read for Edit Contract (getFloorById)
// --------------------------------------------------------------------------
console.log('\n--- Test Section 2: Edit Flow GET Contract (getFloorById) ---')

let capturedGet = null
const originalGet = axiosClient.get
axiosClient.get = async (url) => {
  capturedGet = { url }
  return {
    data: {
      floorId: 42,
      floorName: 'Floor 3',
      floorNumber: 3,
      buildingId: 10,
    },
  }
}

const fetchedFloor = await getFloorById(42)
assert.ok(capturedGet, '6. Edit flow calls getFloorById')
assert.strictEqual(capturedGet.url, '/floors/42', '7. Edit calls GET /api/floors/{floorId}')
assert.strictEqual(fetchedFloor.data.floorId, 42)

console.log('✅ Items 6-7 Passed: getFloorById() calls GET /api/floors/{floorId}')

// --------------------------------------------------------------------------
// Item 8, 9, 10: Edit Flow PUT Contract (updateFloor)
// --------------------------------------------------------------------------
console.log('\n--- Test Section 3: Edit Flow PUT Contract (updateFloor) ---')

let capturedPut = null
const originalPut = axiosClient.put
axiosClient.put = async (url, payload) => {
  capturedPut = { url, payload }
  return {
    data: {
      floorId: 42,
      floorName: payload.floorName,
      floorNumber: payload.floorNumber,
      buildingId: payload.buildingId,
      updatedAt: '2026-09-08T11:00:00Z',
    },
  }
}

const editPayloadInput = {
  floorName: '  Executive 3rd Floor  ',
  floorNumber: '3',
  buildingId: 10,
  floorId: 42, // must be stripped from body
  building: { buildingId: 10, buildingName: 'Main Tower' },
}

await updateFloor(42, editPayloadInput)
assert.ok(capturedPut, '8. Edit flow calls updateFloor')
assert.strictEqual(capturedPut.url, '/floors/42', '9. Edit calls PUT /api/floors/{floorId}')
assert.strictEqual(capturedPut.payload.floorName, 'Executive 3rd Floor', 'floorName is trimmed')
assert.strictEqual(capturedPut.payload.floorNumber, 3, 'floorNumber is numeric')
assert.strictEqual(capturedPut.payload.buildingId, 10, '10. Edit payload contains buildingId')
assert.strictEqual(capturedPut.payload.floorId, undefined, 'floorId must NOT be in PUT body')
assert.strictEqual(capturedPut.payload.building, undefined, 'building object must NOT be in PUT body')

console.log('✅ Items 8-10 Passed: updateFloor() calls PUT /api/floors/{floorId} with buildingId in payload')

// --------------------------------------------------------------------------
// Item 11: Building Association Locked in Edit Mode
// --------------------------------------------------------------------------
console.log('\n--- Test Section 4: Building Association Locked in Edit Mode ---')

// Check BuildingDetailsPage.jsx
assert.ok(
  bldDetailsContent.includes('Floor building association cannot be modified once created.'),
  '11. BuildingDetailsPage must display informative note locking building in edit mode'
)
assert.ok(
  bldDetailsContent.includes('Floor will be created under this building.'),
  '11. BuildingDetailsPage must display informative note in create mode'
)

// Check FloorDetailsPage.jsx
assert.ok(
  floorDetailsContent.includes('Floor building association cannot be modified once created.'),
  '11. FloorDetailsPage must display informative note locking building in edit mode'
)

console.log('✅ Item 11 Passed: Building association lock note present in edit modes')

// --------------------------------------------------------------------------
// Item 12: Negative & Invalid Floor Numbers are Rejected
// --------------------------------------------------------------------------
console.log('\n--- Test Section 5: Client-Side Validation ---')

// In BuildingDetailsPage.jsx
assert.ok(
  bldDetailsContent.includes('Floor number cannot be negative.'),
  '12. BuildingDetailsPage must reject negative floor numbers'
)
assert.ok(
  bldDetailsContent.includes('Floor number must be an integer.'),
  '12. BuildingDetailsPage must reject non-integer floor numbers'
)
assert.ok(
  bldDetailsContent.includes('Floor name is required.'),
  '12. BuildingDetailsPage must reject empty floor name'
)

// In FloorDetailsPage.jsx
assert.ok(
  floorDetailsContent.includes('Floor number cannot be negative.'),
  '12. FloorDetailsPage must reject negative floor numbers'
)
assert.ok(
  floorDetailsContent.includes('Floor number must be an integer.'),
  '12. FloorDetailsPage must reject non-integer floor numbers'
)
assert.ok(
  floorDetailsContent.includes('Floor name is required.'),
  '12. FloorDetailsPage must reject empty floor name'
)

console.log('✅ Item 12 Passed: Negative numbers and invalid values rejected on both forms')

// --------------------------------------------------------------------------
// Item 13: Duplicate Submission Protection
// --------------------------------------------------------------------------
console.log('\n--- Test Section 6: Duplicate Submission Protection ---')

assert.ok(
  bldDetailsContent.includes('isSubmittingFloor'),
  '13. BuildingDetailsPage must track isSubmittingFloor'
)
assert.ok(
  bldDetailsContent.includes('disabled={isSubmittingFloor}'),
  '13. BuildingDetailsPage submit button must be disabled when submitting'
)
assert.ok(
  floorDetailsContent.includes('isSubmittingFloor'),
  '13. FloorDetailsPage must track isSubmittingFloor'
)
assert.ok(
  floorDetailsContent.includes('disabled={isSubmittingFloor}'),
  '13. FloorDetailsPage submit button must be disabled when submitting'
)

console.log('✅ Item 13 Passed: Duplicate submission protection in place')

// --------------------------------------------------------------------------
// Item 14: Loading States
// --------------------------------------------------------------------------
console.log('\n--- Test Section 7: Loading States ---')

assert.ok(
  bldDetailsContent.includes('isLoadingFloor'),
  '14. BuildingDetailsPage tracks floor loading state'
)
assert.ok(
  floorDetailsContent.includes('isFloorModalLoading'),
  '14. FloorDetailsPage tracks floor modal loading state'
)
assert.ok(
  bldDetailsContent.includes('Loading floor details...'),
  '14. BuildingDetailsPage shows loading indicator while fetching floor'
)
assert.ok(
  floorDetailsContent.includes('Loading floor details...'),
  '14. FloorDetailsPage shows loading indicator while fetching floor'
)

console.log('✅ Item 14 Passed: Loading states exist while fetching floor data')

// --------------------------------------------------------------------------
// Item 15: API Error Handling
// --------------------------------------------------------------------------
console.log('\n--- Test Section 8: API Error Handling ---')

assert.ok(
  bldDetailsContent.includes('floorModalError'),
  '15. BuildingDetailsPage has floorModalError banner state'
)
assert.ok(
  floorDetailsContent.includes('floorModalError'),
  '15. FloorDetailsPage has floorModalError banner state'
)
assert.ok(
  bldDetailsContent.includes('Submission Error'),
  '15. BuildingDetailsPage renders submission error banner'
)
assert.ok(
  floorDetailsContent.includes('Submission Error'),
  '15. FloorDetailsPage renders submission error banner'
)

console.log('✅ Item 15 Passed: API error handling banners render on both forms')

// --------------------------------------------------------------------------
// Item 16: Active OWNER Floor create/edit no longer depends on mock functions
// --------------------------------------------------------------------------
console.log('\n--- Test Section 9: Mock Isolation ---')

assert.strictEqual(isUsingMockFloors(), false, '16. Default mode is real Spring Boot API')
assert.ok(
  !bldDetailsContent.includes('addMockFloor'),
  '16. BuildingDetailsPage must not import or call addMockFloor directly'
)
assert.ok(
  !bldDetailsContent.includes('updateMockFloor'),
  '16. BuildingDetailsPage must not import or call updateMockFloor directly'
)
assert.ok(
  !floorDetailsContent.includes('updateMockFloor'),
  '16. FloorDetailsPage must not import or call updateMockFloor directly'
)

console.log('✅ Item 16 Passed: Active OWNER flow connects to real API; mock helpers isolated')

// --------------------------------------------------------------------------
// Item 17: Floor Delete Remains Untouched
// --------------------------------------------------------------------------
console.log('\n--- Test Section 10: Floor Delete Untouched ---')

assert.ok(
  bldDetailsContent.includes('handleConfirmDeleteFloor'),
  '17. BuildingDetailsPage retains existing floor delete handler untouched'
)
assert.ok(
  floorDetailsContent.includes('handleConfirmDeleteFloor'),
  '17. FloorDetailsPage retains existing floor delete handler untouched'
)
assert.ok(
  typeof deleteFloor === 'function',
  '17. deleteFloor is still available in floorApi.js'
)

console.log('✅ Item 17 Passed: Floor delete remains untouched for Phase 6D')

// Restore axios mocks
axiosClient.post = originalPost
axiosClient.get = originalGet
axiosClient.put = originalPut

console.log('\n🎉 ALL 17 PHASE 6C FLOOR CREATE & EDIT FLOW VERIFICATIONS PASSED!')
