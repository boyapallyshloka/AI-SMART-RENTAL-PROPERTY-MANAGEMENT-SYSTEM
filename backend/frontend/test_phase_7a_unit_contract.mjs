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

console.log('🧪 Starting Phase 7A - Unit API Contract Verification...\n')

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

// --------------------------------------------------------------------------
// 1. Unit API file exists
// --------------------------------------------------------------------------
assert.ok(fs.existsSync(unitApiPath), '1. Unit API file must exist')
console.log('✅ 1. unitApi.js file exists.')

const unitApi = await import(`file://${unitApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  ALLOWED_UNIT_FIELDS,
  UNIT_TYPES,
  UNIT_STATUSES,
  CANONICAL_UNIT_TYPES,
  CANONICAL_UNIT_STATUSES,
  formatUnitRequest,
  createUnit,
  getUnitsByFloor,
  getUnitById,
  updateUnit,
  deleteUnit,
  setUseMockUnits,
  isUsingMockUnits,
  getUnitsByBuilding,
  getAllUnits,
  getUnitsForManager,
  getUnitByIdForManager,
  getUnitsForTenant,
  getUnitByIdForTenant,
  getAvailableUnits,
  getAvailableProperties,
} = unitApi

// --------------------------------------------------------------------------
// 17 & 18. UNIT_TYPES and UNIT_STATUSES Enums
// --------------------------------------------------------------------------
console.log('\n--- Checking Enums ---')
assert.strictEqual(UNIT_TYPES.APARTMENT, 'APARTMENT', '17. UNIT_TYPES must contain APARTMENT')
assert.strictEqual(UNIT_TYPES.ROOM, 'ROOM', '17. UNIT_TYPES must contain ROOM')
assert.ok(Array.isArray(UNIT_TYPES), '17. UNIT_TYPES must be iterable for .map compatibility')

assert.strictEqual(UNIT_STATUSES.VACANT, 'VACANT', '18. UNIT_STATUSES must contain VACANT')
assert.strictEqual(UNIT_STATUSES.OCCUPIED, 'OCCUPIED', '18. UNIT_STATUSES must contain OCCUPIED')
assert.strictEqual(UNIT_STATUSES.RESERVED, 'RESERVED', '18. UNIT_STATUSES must contain RESERVED')
assert.strictEqual(UNIT_STATUSES.MAINTENANCE, 'MAINTENANCE', '18. UNIT_STATUSES must contain MAINTENANCE')
assert.ok(Array.isArray(UNIT_STATUSES), '18. UNIT_STATUSES must be iterable for .map compatibility')

console.log('✅ 17-18. UNIT_TYPES and UNIT_STATUSES enums match backend contract.')

// --------------------------------------------------------------------------
// 7, 8, 9, 10, 11, 12, 13, 14, 15, 16. formatUnitRequest & Payload Sanitization
// --------------------------------------------------------------------------
console.log('\n--- Checking formatUnitRequest & Sanitization ---')

assert.deepStrictEqual(
  ALLOWED_UNIT_FIELDS.slice().sort(),
  [
    'area',
    'bathrooms',
    'bedrooms',
    'description',
    'floorId',
    'monthlyRent',
    'securityDeposit',
    'status',
    'unitNumber',
    'unitType',
  ].sort(),
  'ALLOWED_UNIT_FIELDS must match the 10 backend UnitRequest fields'
)

const dirtyInput = {
  unitId: 501, // 9. forbidden
  id: 501, // 9. forbidden
  number: '402', // alias -> unitNumber
  type: 'apartment', // alias -> unitType
  area: '750.5',
  bedrooms: '2',
  bathrooms: '2',
  rent: '2500', // alias -> monthlyRent
  deposit: '2500', // alias -> securityDeposit
  status: 'vacant',
  description: 'Spacious 2BHK with balcony view',
  floor: { id: 12, floorName: 'Floor 4', floorNumber: 4 }, // 10, 15. forbidden nested object
  floorName: 'Floor 4', // 10. forbidden
  floorNumber: 4, // 10. forbidden
  building: { id: 3, buildingName: 'Tower A' }, // 11, 15. forbidden
  buildingId: 3, // 11. forbidden
  buildingName: 'Tower A', // 11. forbidden
  property: { id: 1, name: 'Palms' }, // 12, 15. forbidden
  propertyId: 1, // 12. forbidden
  propertyName: 'Palms', // 12. forbidden
  ownerId: 99, // 13. forbidden
  createdAt: '2026-09-08T10:00:00Z', // 14. forbidden
  updatedAt: '2026-09-08T11:00:00Z', // 14. forbidden
  extraUiFlag: true, // arbitrary UI field forbidden
}

const sanitized = formatUnitRequest(dirtyInput)

// 7 & 8. Payload contains only allowed UnitRequest fields
const keys = Object.keys(sanitized).sort()
for (const k of keys) {
  assert.ok(ALLOWED_UNIT_FIELDS.includes(k), `Field ${k} must be in ALLOWED_UNIT_FIELDS`)
}

// 9. unitId/id excluded
assert.strictEqual(sanitized.unitId, undefined, '9. unitId must be excluded')
assert.strictEqual(sanitized.id, undefined, '9. id must be excluded')

// 10. floorName/floorNumber excluded
assert.strictEqual(sanitized.floorName, undefined, '10. floorName must be excluded')
assert.strictEqual(sanitized.floorNumber, undefined, '10. floorNumber must be excluded')

// 11. buildingId/buildingName excluded
assert.strictEqual(sanitized.buildingId, undefined, '11. buildingId must be excluded')
assert.strictEqual(sanitized.buildingName, undefined, '11. buildingName must be excluded')

// 12. propertyId/propertyName excluded
assert.strictEqual(sanitized.propertyId, undefined, '12. propertyId must be excluded')
assert.strictEqual(sanitized.propertyName, undefined, '12. propertyName must be excluded')

// 13. ownerId excluded
assert.strictEqual(sanitized.ownerId, undefined, '13. ownerId must be excluded')

// 14. createdAt/updatedAt excluded
assert.strictEqual(sanitized.createdAt, undefined, '14. createdAt must be excluded')
assert.strictEqual(sanitized.updatedAt, undefined, '14. updatedAt must be excluded')

// 15. Nested floor/building/property objects excluded
assert.strictEqual(sanitized.floor, undefined, '15. nested floor object must be excluded')
assert.strictEqual(sanitized.building, undefined, '15. nested building object must be excluded')
assert.strictEqual(sanitized.property, undefined, '15. nested property object must be excluded')

// 16. floorId correctly preserved as numeric field
assert.strictEqual(sanitized.floorId, 12, '16. floorId must be normalized to numeric 12')
assert.strictEqual(typeof sanitized.floorId, 'number', '16. floorId must be a number')

// Verify other formatted values
assert.strictEqual(sanitized.unitNumber, '402')
assert.strictEqual(sanitized.unitType, 'APARTMENT')
assert.strictEqual(sanitized.area, 750.5)
assert.strictEqual(sanitized.bedrooms, 2)
assert.strictEqual(sanitized.bathrooms, 2)
assert.strictEqual(sanitized.monthlyRent, 2500)
assert.strictEqual(sanitized.securityDeposit, 2500)
assert.strictEqual(sanitized.status, 'VACANT')
assert.strictEqual(sanitized.description, 'Spacious 2BHK with balcony view')

// Zero preservation test
const zeroInput = {
  unitNumber: 'Studio-0',
  unitType: 'ROOM',
  area: 0,
  bedrooms: 0,
  bathrooms: 0,
  monthlyRent: 0,
  securityDeposit: 0,
  floorId: 0,
}
const zeroSanitized = formatUnitRequest(zeroInput)
assert.strictEqual(zeroSanitized.area, 0, 'area 0 must be preserved')
assert.strictEqual(zeroSanitized.bedrooms, 0, 'bedrooms 0 must be preserved')
assert.strictEqual(zeroSanitized.bathrooms, 0, 'bathrooms 0 must be preserved')
assert.strictEqual(zeroSanitized.monthlyRent, 0, 'monthlyRent 0 must be preserved')
assert.strictEqual(zeroSanitized.securityDeposit, 0, 'securityDeposit 0 must be preserved')
assert.strictEqual(zeroSanitized.floorId, 0, 'floorId 0 must be preserved')

console.log('✅ 7-16. formatUnitRequest sanitizes fields and strictly strips forbidden keys.')

// --------------------------------------------------------------------------
// 2, 3, 4, 5, 6. Endpoints Contract Verification
// --------------------------------------------------------------------------
console.log('\n--- Checking Endpoint Contracts ---')

// 2. createUnit() uses POST /units
let capturedPost = null
const origPost = axiosClient.post
axiosClient.post = async (url, payload) => {
  capturedPost = { url, payload }
  return { data: { unitId: 101, ...payload } }
}

await createUnit({ number: '101', type: 'ROOM', floorId: 5, rent: 1200, deposit: 1200 })
assert.ok(capturedPost, '2. createUnit must call axiosClient.post')
assert.strictEqual(capturedPost.url, '/units', '2. createUnit must call POST /units')
assert.strictEqual(capturedPost.payload.unitNumber, '101')
assert.strictEqual(capturedPost.payload.unitType, 'ROOM')
assert.strictEqual(capturedPost.payload.floorId, 5)
assert.strictEqual(capturedPost.payload.monthlyRent, 1200)
assert.strictEqual(capturedPost.payload.securityDeposit, 1200)
console.log('✅ 2. createUnit() calls POST /units with sanitized payload.')

// 3. getUnitsByFloor() uses GET /units/floor/{floorId}
let capturedGet = null
const origGet = axiosClient.get
axiosClient.get = async (url) => {
  capturedGet = { url }
  return { data: [{ unitId: 101, unitNumber: '101' }] }
}

await getUnitsByFloor(42)
assert.ok(capturedGet, '3. getUnitsByFloor must call axiosClient.get')
assert.strictEqual(capturedGet.url, '/units/floor/42', '3. getUnitsByFloor must call GET /units/floor/{floorId}')
console.log('✅ 3. getUnitsByFloor() calls GET /units/floor/{floorId}.')

// 4. getUnitById() uses GET /units/{unitId}
await getUnitById(99)
assert.ok(capturedGet, '4. getUnitById must call axiosClient.get')
assert.strictEqual(capturedGet.url, '/units/99', '4. getUnitById must call GET /units/{unitId}')
console.log('✅ 4. getUnitById() calls GET /units/{unitId}.')

// 5. updateUnit() uses PUT /units/{unitId}
let capturedPut = null
const origPut = axiosClient.put
axiosClient.put = async (url, payload) => {
  capturedPut = { url, payload }
  return { data: { unitId: 99, ...payload } }
}

await updateUnit(99, { number: '101-B', rent: 1400, deposit: 1400, floorId: 5 })
assert.ok(capturedPut, '5. updateUnit must call axiosClient.put')
assert.strictEqual(capturedPut.url, '/units/99', '5. updateUnit must call PUT /units/{unitId}')
assert.strictEqual(capturedPut.payload.unitNumber, '101-B')
assert.strictEqual(capturedPut.payload.monthlyRent, 1400)
assert.strictEqual(capturedPut.payload.securityDeposit, 1400)
assert.strictEqual(capturedPut.payload.floorId, 5)
console.log('✅ 5. updateUnit() calls PUT /units/{unitId} with sanitized payload.')

// 6. deleteUnit() uses DELETE /units/{unitId}
let capturedDelete = null
const origDelete = axiosClient.delete
axiosClient.delete = async (url) => {
  capturedDelete = { url }
  return { status: 204, data: null }
}

await deleteUnit(99)
assert.ok(capturedDelete, '6. deleteUnit must call axiosClient.delete')
assert.strictEqual(capturedDelete.url, '/units/99', '6. deleteUnit must call DELETE /units/{unitId}')
console.log('✅ 6. deleteUnit() calls DELETE /units/{unitId}.')

// Restore axios mocks
axiosClient.post = origPost
axiosClient.get = origGet
axiosClient.put = origPut
axiosClient.delete = origDelete

// --------------------------------------------------------------------------
// 19. Existing mock helpers remain available
// --------------------------------------------------------------------------
console.log('\n--- Checking Preserved Mock Helpers ---')
assert.strictEqual(typeof getUnitsByBuilding, 'function', '19. getUnitsByBuilding helper exists')
assert.strictEqual(typeof getAllUnits, 'function', '19. getAllUnits helper exists')
assert.strictEqual(typeof getUnitsForManager, 'function', '19. getUnitsForManager helper exists')
assert.strictEqual(typeof getUnitByIdForManager, 'function', '19. getUnitByIdForManager helper exists')
assert.strictEqual(typeof getUnitsForTenant, 'function', '19. getUnitsForTenant helper exists')
assert.strictEqual(typeof getUnitByIdForTenant, 'function', '19. getUnitByIdForTenant helper exists')
assert.strictEqual(typeof getAvailableUnits, 'function', '19. getAvailableUnits helper exists')
assert.strictEqual(typeof getAvailableProperties, 'function', '19. getAvailableProperties helper exists')
console.log('✅ 19. All mock helpers remain preserved for UI discovery/manager/tenant views.')

// --------------------------------------------------------------------------
// 20. Unit pages have NOT been migrated in this phase
// --------------------------------------------------------------------------
console.log('\n--- Checking UI Pages Untouched ---')
const addUnitContent = fs.readFileSync(addUnitPagePath, 'utf-8')
const unitDetailsContent = fs.readFileSync(unitDetailsPagePath, 'utf-8')

assert.ok(
  addUnitContent.includes('const unitTypeOptions = UNIT_TYPES.map'),
  '20. AddUnitPage remains intact with .map on UNIT_TYPES'
)
assert.ok(
  addUnitContent.includes('const statusOptions = UNIT_STATUSES.map'),
  '20. AddUnitPage remains intact with .map on UNIT_STATUSES'
)
assert.ok(
  unitDetailsContent.includes('export default function UnitDetailsPage'),
  '20. UnitDetailsPage remains intact and unmigrated'
)
console.log('✅ 20. Unit pages have NOT been migrated in this phase (isolated to unitApi.js).')

console.log('\n🎉 ALL 20 PHASE 7A UNIT API CONTRACT VERIFICATIONS PASSED!')
