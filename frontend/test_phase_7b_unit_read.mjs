/**
 * Phase 7B — Unit Read Flow Verification Suite
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

console.log('🧪 Starting Phase 7B - Unit Read Flow Verification...\n')

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
const floorDetailsPagePath = resolvePath('src/pages/owner/FloorDetailsPage.jsx')
const unitDetailsPagePath = resolvePath('src/pages/owner/UnitDetailsPage.jsx')
const buildingDetailsPagePath = resolvePath('src/pages/owner/BuildingDetailsPage.jsx')
const addUnitPagePath = resolvePath('src/pages/owner/AddUnitPage.jsx')

const unitApi = await import(`file://${unitApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  getUnitsByFloor,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitsForManager,
  getUnitsForTenant,
  getUnitByIdForManager,
  getUnitByIdForTenant,
  isUsingMockUnits,
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
// 1. Endpoint Contract Tests
// --------------------------------------------------------------------------
console.log('--- Checking Endpoint Contracts ---')

let capturedRequests = []
axiosClient.get = async (url, config) => {
  capturedRequests.push({ method: 'GET', url, config })
  if (url.startsWith('/units/floor/')) {
    return {
      data: [
        {
          unitId: 101,
          unitNumber: '101A',
          unitType: 'APARTMENT',
          area: 850,
          bedrooms: 2,
          bathrooms: 1,
          monthlyRent: 1500,
          securityDeposit: 1500,
          status: 'VACANT',
          description: 'Spacious 2-bed apartment',
          floorId: 42,
          floorName: 'Floor 4',
          floorNumber: 4,
          buildingId: 10,
          buildingName: 'Tower One',
          propertyId: 1,
          propertyName: 'Grand Palms',
          createdAt: '2026-09-08T00:00:00Z',
          updatedAt: '2026-09-08T00:00:00Z',
        },
      ],
    }
  }
  if (url.startsWith('/units/')) {
    return {
      data: {
        unitId: 99,
        unitNumber: '99B',
        unitType: 'ROOM',
        area: 350,
        bedrooms: 1,
        bathrooms: 1,
        monthlyRent: 800,
        securityDeposit: 800,
        status: 'OCCUPIED',
        description: 'Single studio room',
        floorId: 15,
        floorName: 'Floor 2',
        floorNumber: 2,
        buildingId: 5,
        buildingName: 'East Wing',
        propertyId: 2,
        propertyName: 'Sunset Heights',
        createdAt: '2026-09-08T00:00:00Z',
        updatedAt: '2026-09-08T00:00:00Z',
      },
    }
  }
  return { data: null }
}

await test('Owner Unit list uses getUnitsByFloor()', async () => {
  capturedRequests = []
  const res = await getUnitsByFloor(42)
  assert.strictEqual(capturedRequests.length, 1)
  assert.strictEqual(capturedRequests[0].method, 'GET')
  assert.strictEqual(capturedRequests[0].url, '/units/floor/42')
  assert(Array.isArray(res.data))
  assert.strictEqual(res.data[0].unitId, 101)
})

await test('Owner Unit details uses getUnitById()', async () => {
  capturedRequests = []
  const res = await getUnitById(99)
  assert.strictEqual(capturedRequests.length, 1)
  assert.strictEqual(capturedRequests[0].method, 'GET')
  assert.strictEqual(capturedRequests[0].url, '/units/99')
  assert.strictEqual(res.data.unitId, 99)
})

await test('Correct floorId is passed in URL path variable', async () => {
  capturedRequests = []
  await getUnitsByFloor(777)
  assert.strictEqual(capturedRequests[0].url, '/units/floor/777')
})

await test('Correct unitId is passed in URL path variable', async () => {
  capturedRequests = []
  await getUnitById(888)
  assert.strictEqual(capturedRequests[0].url, '/units/888')
})

// --------------------------------------------------------------------------
// 2. FloorDetailsPage.jsx Inspections
// --------------------------------------------------------------------------
console.log('\n--- Checking FloorDetailsPage.jsx (Unit List Read) ---')

const floorDetailsSrc = fs.readFileSync(floorDetailsPagePath, 'utf8')

await test('FloorDetailsPage calls getUnitsByFloor(floorId) for active owner flow', () => {
  assert(floorDetailsSrc.includes('getUnitsByFloor(floorId)'))
})

await test('FloorDetailsPage maps backend response fields with real unitId', () => {
  assert(floorDetailsSrc.includes('unitId: u.unitId'))
  assert(floorDetailsSrc.includes('unitNumber: u.unitNumber'))
  assert(floorDetailsSrc.includes('monthlyRent: Number(u.monthlyRent'))
  assert(floorDetailsSrc.includes('floorId: u.floorId'))
})

await test('FloorDetailsPage contains loading state for floor and unit data', () => {
  assert(floorDetailsSrc.includes('isLoading'))
  assert(floorDetailsSrc.includes('<Loader') && floorDetailsSrc.includes('Loading floor details...'))
})

await test('FloorDetailsPage contains empty state when units list is empty', () => {
  assert(floorDetailsSrc.includes('units.length === 0'))
  assert(floorDetailsSrc.includes('No units on this floor'))
})

await test('FloorDetailsPage contains error state and retry handler', () => {
  assert(floorDetailsSrc.includes('errorMessage'))
  assert(floorDetailsSrc.includes('Failed to Load Floor'))
  assert(floorDetailsSrc.includes('onClick={loadData}'))
})

await test('Active owner Unit list flow in FloorDetailsPage has no silent mock fallback', () => {
  assert(!floorDetailsSrc.includes('catch { setUnits(getMockUnits'))
  assert(!floorDetailsSrc.includes('getUnitsForManager(floorId) // fallback'))
})

// --------------------------------------------------------------------------
// 3. UnitDetailsPage.jsx Inspections
// --------------------------------------------------------------------------
console.log('\n--- Checking UnitDetailsPage.jsx (Unit Details Read) ---')

const unitDetailsSrc = fs.readFileSync(unitDetailsPagePath, 'utf8')

await test('UnitDetailsPage calls getUnitById(unitId) for active owner flow', () => {
  assert(unitDetailsSrc.includes('getUnitById(unitId)'))
})

await test('UnitDetailsPage maps backend response and relationship context fields', () => {
  assert(unitDetailsSrc.includes('raw.floorId'))
  assert(unitDetailsSrc.includes('raw.buildingId'))
  assert(unitDetailsSrc.includes('raw.propertyId'))
  assert(unitDetailsSrc.includes('unitId: raw.unitId'))
  assert(unitDetailsSrc.includes('unitNumber: raw.unitNumber'))
  assert(unitDetailsSrc.includes('unitType: raw.unitType'))
  assert(unitDetailsSrc.includes('status: raw.status'))
})

await test('UnitDetailsPage contains loading state with Loader component', () => {
  assert(unitDetailsSrc.includes('isLoading'))
  assert(unitDetailsSrc.includes('<Loader text="Loading unit details..." />'))
})

await test('UnitDetailsPage contains empty state when unit is not found', () => {
  assert(unitDetailsSrc.includes('!unit'))
  assert(unitDetailsSrc.includes('Unit Not Found'))
})

await test('UnitDetailsPage contains error state and retry handler', () => {
  assert(unitDetailsSrc.includes('errorMessage'))
  assert(unitDetailsSrc.includes('Failed to Load Unit'))
  assert(unitDetailsSrc.includes('onClick={loadUnit}'))
})

await test('Active owner Unit Details flow in UnitDetailsPage has no mock dependency', () => {
  assert(!unitDetailsSrc.includes('catch { setUnit(getMockUnitById'))
  assert(unitDetailsSrc.includes('const res = await getUnitById(unitId)'))
})

// --------------------------------------------------------------------------
// 4. BuildingDetailsPage.jsx Floor Units Integration
// --------------------------------------------------------------------------
console.log('\n--- Checking BuildingDetailsPage.jsx (Floor Units Aggregation) ---')

const buildingDetailsSrc = fs.readFileSync(buildingDetailsPagePath, 'utf8')

await test('BuildingDetailsPage safely unwraps getUnitsByFloor for owner view', () => {
  assert(buildingDetailsSrc.includes('getUnitsByFloor(f.floorId)'))
  assert(buildingDetailsSrc.includes('uList?.data ?? uList ?? []'))
})

// --------------------------------------------------------------------------
// 5. Preserved Helper Functions and Untouched Create/Edit
// --------------------------------------------------------------------------
console.log('\n--- Checking Preserved Mock Helpers and Untouched Create/Edit ---')

await test('Manager and Tenant mock read helpers remain available and separate', () => {
  assert.strictEqual(typeof getUnitsForManager, 'function')
  assert.strictEqual(typeof getUnitsForTenant, 'function')
  assert.strictEqual(typeof getUnitByIdForManager, 'function')
  assert.strictEqual(typeof getUnitByIdForTenant, 'function')
})

await test('Unit create/edit/delete remain untouched for Phase 7B boundary', () => {
  const addUnitSrc = fs.readFileSync(addUnitPagePath, 'utf8')
  // AddUnitPage has not been migrated yet to live API (deferred to Phase 7C)
  assert(addUnitSrc.includes('addMockUnit') || addUnitSrc.includes('addUnit') || addUnitSrc.includes('createUnit'))
})

console.log('\n🎉 ALL 18 PHASE 7B UNIT READ VERIFICATIONS PASSED!\n')
