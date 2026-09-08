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

console.log('🧪 Starting Phase 6A - Floor API Contract Verification...\n')

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

const floorApi = await import(`file://${floorApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  ALLOWED_FLOOR_FIELDS,
  formatFloorRequest,
  createFloor,
  getFloorsByBuilding,
  getFloorById,
  updateFloor,
  deleteFloor,
  setUseMockFloors,
  isUsingMockFloors,
  getAllFloors,
  getFloorsForManager,
  getFloorByIdForManager,
  getFloorsForTenant,
  getFloorByIdForTenant,
} = floorApi

// --------------------------------------------------------------------------
// Test 1: Verify ALLOWED_FLOOR_FIELDS
// --------------------------------------------------------------------------
console.log('--- Test 1: ALLOWED_FLOOR_FIELDS Constant ---')
assert.deepStrictEqual(
  ALLOWED_FLOOR_FIELDS,
  ['floorName', 'floorNumber', 'buildingId'],
  'ALLOWED_FLOOR_FIELDS must contain floorName, floorNumber, and buildingId'
)
console.log('✅ Test 1 Passed: ALLOWED_FLOOR_FIELDS matches backend FloorRequest contract.\n')

// --------------------------------------------------------------------------
// Test 2: formatFloorRequest mappings and alias normalization
// --------------------------------------------------------------------------
console.log('--- Test 2: formatFloorRequest mappings and alias normalization ---')

// 2a. Standard fields
const standardInput = {
  floorName: '  2nd Floor  ',
  floorNumber: 2,
  buildingId: 10,
}
const standardOutput = formatFloorRequest(standardInput)
assert.strictEqual(standardOutput.floorName, '2nd Floor')
assert.strictEqual(standardOutput.floorNumber, 2)
assert.strictEqual(standardOutput.buildingId, 10)

// 2b. Aliases: name -> floorName, number -> floorNumber
const aliasInput1 = {
  name: '  1st Floor  ',
  number: '1',
  buildingId: '5',
}
const aliasOutput1 = formatFloorRequest(aliasInput1)
assert.strictEqual(aliasOutput1.floorName, '1st Floor')
assert.strictEqual(aliasOutput1.floorNumber, 1)
assert.strictEqual(aliasOutput1.buildingId, 5)

// 2c. Alias: floor -> floorName
const aliasInput2 = {
  floor: 'Ground Floor',
  number: 0,
  buildingId: 8,
}
const aliasOutput2 = formatFloorRequest(aliasInput2)
assert.strictEqual(aliasOutput2.floorName, 'Ground Floor')
assert.strictEqual(aliasOutput2.floorNumber, 0, 'floorNumber=0 must be preserved')

console.log('✅ Test 2 Passed: floorName and aliases (name, floor, number) normalized accurately.\n')

// --------------------------------------------------------------------------
// Test 3: Numeric coercion and zero preservation
// --------------------------------------------------------------------------
console.log('--- Test 3: Numeric coercion and zero preservation ---')

const zeroInput = {
  floorName: 'Basement',
  floorNumber: 0,
  buildingId: 12,
}
const zeroOutput = formatFloorRequest(zeroInput)
assert.strictEqual(zeroOutput.floorNumber, 0, 'Zero floorNumber must be preserved')

// Invalid string numbers should not become NaN
const invalidNumInput = {
  floorName: 'Floor X',
  floorNumber: 'not-a-number',
  buildingId: 'invalid-id',
}
const invalidNumOutput = formatFloorRequest(invalidNumInput)
assert.strictEqual(invalidNumOutput.floorNumber, undefined, 'Invalid floorNumber must not be NaN')
assert.strictEqual(invalidNumOutput.buildingId, undefined, 'Invalid buildingId must not be NaN')

console.log('✅ Test 3 Passed: Numbers are coerced cleanly, 0 is preserved, and NaN is prevented.\n')

// --------------------------------------------------------------------------
// Test 4: Nested building normalization
// --------------------------------------------------------------------------
console.log('--- Test 4: Nested building normalization ---')

const nestedBuilding1 = {
  floorName: '3rd Floor',
  floorNumber: 3,
  building: { id: 77, name: 'Main Tower' },
}
const nestedOutput1 = formatFloorRequest(nestedBuilding1)
assert.strictEqual(nestedOutput1.buildingId, 77, 'building.id should normalize to buildingId')
assert.strictEqual(nestedOutput1.building, undefined, 'nested building object must be stripped')

const nestedBuilding2 = {
  floorName: '4th Floor',
  floorNumber: 4,
  building: { buildingId: 88 },
}
const nestedOutput2 = formatFloorRequest(nestedBuilding2)
assert.strictEqual(nestedOutput2.buildingId, 88, 'building.buildingId should normalize to buildingId')

console.log('✅ Test 4 Passed: Nested building data normalized to flat buildingId.\n')

// --------------------------------------------------------------------------
// Test 5: Forbidden response and UI fields removal
// --------------------------------------------------------------------------
console.log('--- Test 5: Forbidden fields removal ---')

const payloadWithForbidden = {
  floorId: 999,
  id: 999,
  floorName: 'Penthouse Floor',
  floorNumber: 15,
  buildingId: 20,
  building: { id: 20, name: 'Azure Heights' },
  buildingName: 'Azure Heights',
  propertyId: 1,
  propertyName: 'Azure Resort',
  createdAt: '2026-09-08T10:00:00',
  updatedAt: '2026-09-08T12:00:00',
  ownerId: 4,
  extraUiState: true,
}

const sanitized = formatFloorRequest(payloadWithForbidden)
console.log('Sanitized payload:', sanitized)

assert.deepStrictEqual(
  Object.keys(sanitized).sort(),
  ['buildingId', 'floorName', 'floorNumber'],
  'Sanitized payload must contain ONLY buildingId, floorName, floorNumber'
)
assert.strictEqual(sanitized.floorId, undefined)
assert.strictEqual(sanitized.id, undefined)
assert.strictEqual(sanitized.building, undefined)
assert.strictEqual(sanitized.buildingName, undefined)
assert.strictEqual(sanitized.propertyId, undefined)
assert.strictEqual(sanitized.propertyName, undefined)
assert.strictEqual(sanitized.createdAt, undefined)
assert.strictEqual(sanitized.updatedAt, undefined)
assert.strictEqual(sanitized.ownerId, undefined)

console.log('✅ Test 5 Passed: All forbidden response, entity, and UI fields are stripped.\n')

// --------------------------------------------------------------------------
// Test 6: createFloor invokes POST /api/floors
// --------------------------------------------------------------------------
console.log('--- Test 6: createFloor Endpoint Contract ---')

let capturedPost = null
const originalPost = axiosClient.post

axiosClient.post = async (url, data, config) => {
  capturedPost = { url, data, config }
  return {
    floorId: 501,
    ...data,
    createdAt: '2026-09-08T15:00:00',
    updatedAt: '2026-09-08T15:00:00',
  }
}

try {
  setUseMockFloors(false)
  const result = await createFloor({
    name: '  Floor 10  ',
    number: '10',
    building: { id: 25 },
    floorId: 999, // should be removed
  })
  console.log('Captured POST:', capturedPost)

  assert.strictEqual(capturedPost.url, '/floors', 'Endpoint must be /floors')
  assert.strictEqual(capturedPost.data.floorName, 'Floor 10')
  assert.strictEqual(capturedPost.data.floorNumber, 10)
  assert.strictEqual(capturedPost.data.buildingId, 25)
  assert.strictEqual(capturedPost.data.floorId, undefined)
  assert.strictEqual(result.floorId, 501)
} finally {
  axiosClient.post = originalPost
}

console.log('✅ Test 6 Passed: createFloor dispatches POST /api/floors with sanitized payload.\n')

// --------------------------------------------------------------------------
// Test 7: getFloorsByBuilding invokes GET /api/floors/building/{buildingId}
// --------------------------------------------------------------------------
console.log('--- Test 7: getFloorsByBuilding Endpoint Contract ---')

let capturedGet = null
const originalGet = axiosClient.get

axiosClient.get = async (url, config) => {
  capturedGet = { url, config }
  return [
    { floorId: 1, floorName: 'Floor 1', floorNumber: 1, buildingId: 25 },
  ]
}

try {
  setUseMockFloors(false)
  const result = await getFloorsByBuilding(25)
  console.log('Captured GET (by building):', capturedGet)

  assert.strictEqual(
    capturedGet.url,
    '/floors/building/25',
    'Endpoint must be /floors/building/{buildingId}'
  )
  assert.strictEqual(result.length, 1)
} finally {
  axiosClient.get = originalGet
}

console.log('✅ Test 7 Passed: getFloorsByBuilding dispatches GET /api/floors/building/{buildingId}.\n')

// --------------------------------------------------------------------------
// Test 8: getFloorById invokes GET /api/floors/{floorId}
// --------------------------------------------------------------------------
console.log('--- Test 8: getFloorById Endpoint Contract ---')

axiosClient.get = async (url, config) => {
  capturedGet = { url, config }
  return { floorId: 101, floorName: 'Floor 2', floorNumber: 2, buildingId: 25 }
}

try {
  setUseMockFloors(false)
  const result = await getFloorById(101)
  console.log('Captured GET (single):', capturedGet)

  assert.strictEqual(
    capturedGet.url,
    '/floors/101',
    'Endpoint must be /floors/{floorId}'
  )
  assert.strictEqual(result.floorId, 101)
} finally {
  axiosClient.get = originalGet
}

console.log('✅ Test 8 Passed: getFloorById dispatches GET /api/floors/{floorId}.\n')

// --------------------------------------------------------------------------
// Test 9: updateFloor invokes PUT /api/floors/{floorId}
// --------------------------------------------------------------------------
console.log('--- Test 9: updateFloor Endpoint Contract ---')

let capturedPut = null
const originalPut = axiosClient.put

axiosClient.put = async (url, data, config) => {
  capturedPut = { url, data, config }
  return {
    floorId: 101,
    ...data,
    updatedAt: '2026-09-08T15:15:00',
  }
}

try {
  setUseMockFloors(false)
  const result = await updateFloor(101, {
    floorName: '  Executive Floor 2  ',
    floorNumber: 2,
    buildingId: 25,
    id: 101, // should be removed
    buildingName: 'Main Tower', // should be removed
  })
  console.log('Captured PUT:', capturedPut)

  assert.strictEqual(
    capturedPut.url,
    '/floors/101',
    'Endpoint must be /floors/{floorId}'
  )
  assert.strictEqual(capturedPut.data.floorName, 'Executive Floor 2')
  assert.strictEqual(capturedPut.data.floorNumber, 2)
  assert.strictEqual(capturedPut.data.buildingId, 25)
  assert.strictEqual(capturedPut.data.id, undefined)
  assert.strictEqual(capturedPut.data.buildingName, undefined)
  assert.strictEqual(result.floorId, 101)
} finally {
  axiosClient.put = originalPut
}

console.log('✅ Test 9 Passed: updateFloor dispatches PUT /api/floors/{floorId} with sanitized payload.\n')

// --------------------------------------------------------------------------
// Test 10: deleteFloor invokes DELETE /api/floors/{floorId} with no body
// --------------------------------------------------------------------------
console.log('--- Test 10: deleteFloor Endpoint Contract ---')

let capturedDelete = null
const originalDelete = axiosClient.delete

axiosClient.delete = async (url, config) => {
  capturedDelete = { url, config }
  return null
}

try {
  setUseMockFloors(false)
  await deleteFloor(101)
  console.log('Captured DELETE:', capturedDelete)

  assert.strictEqual(
    capturedDelete.url,
    '/floors/101',
    'Endpoint must be /floors/{floorId}'
  )
  assert.strictEqual(
    capturedDelete.config,
    undefined,
    'DELETE must send no body or extra configuration'
  )
} finally {
  axiosClient.delete = originalDelete
}

console.log('✅ Test 10 Passed: deleteFloor dispatches DELETE /api/floors/{floorId} with no request body.\n')

// --------------------------------------------------------------------------
// Test 11: Mock compatibility and helpers preserved
// --------------------------------------------------------------------------
console.log('--- Test 11: Mock compatibility and helpers preserved ---')

setUseMockFloors(true)
assert.strictEqual(isUsingMockFloors(), true, 'isUsingMockFloors should be true when set')
assert(typeof getAllFloors === 'function', 'getAllFloors must be preserved')
assert(typeof getFloorsForManager === 'function', 'getFloorsForManager must be preserved')
assert(typeof getFloorByIdForManager === 'function', 'getFloorByIdForManager must be preserved')
assert(typeof getFloorsForTenant === 'function', 'getFloorsForTenant must be preserved')
assert(typeof getFloorByIdForTenant === 'function', 'getFloorByIdForTenant must be preserved')

console.log('✅ Test 11 Passed: All mock helpers and fallback mechanisms preserved for existing UI.\n')

console.log('🎉 ALL PHASE 6A FLOOR API CONTRACT TESTS PASSED SUCCESSFULLY!')
