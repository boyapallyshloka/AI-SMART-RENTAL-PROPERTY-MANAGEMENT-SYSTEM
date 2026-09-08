/**
 * Phase 5B Building Read Flow Verification Suite
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
  console.log('=== Starting Phase 5B Building Read Flow Verification Tests ===\n')

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
  const propertyDetailsPath = resolvePath('src/pages/owner/PropertyDetailsPage.jsx')
  const buildingsPagePath = resolvePath('src/pages/owner/BuildingsPage.jsx')
  const buildingDetailsPath = resolvePath('src/pages/owner/BuildingDetailsPage.jsx')
  const axiosClientPath = resolvePath('src/api/axiosClient.js')

  const axiosClientModule = await import(`file://${axiosClientPath}`)
  const axiosClient = axiosClientModule.default

  const buildingApi = await import(`file://${buildingApiPath}`)

  let recordedCalls = []
  // Mock axiosClient methods
  axiosClient.get = async (url, config) => {
    recordedCalls.push({ method: 'GET', url, config })
    if (url.includes('/buildings/property/')) {
      return {
        data: [
          {
            buildingId: 101,
            buildingName: 'Tower One',
            totalFloors: 8,
            totalUnits: 32,
            description: 'North residential wing',
            propertyId: 42,
            propertyName: 'Sunrise Villas',
          },
        ],
      }
    }
    if (url.includes('/buildings/101')) {
      return {
        data: {
          buildingId: 101,
          buildingName: 'Tower One',
          totalFloors: 8,
          totalUnits: 32,
          description: 'North residential wing',
          propertyId: 42,
          propertyName: 'Sunrise Villas',
        },
      }
    }
    return { data: [] }
  }

  // TEST 1: buildingApi endpoint dispatches
  console.log('--- 1. Testing Building Read Endpoints in buildingApi ---')
  recordedCalls = []
  const propertyBuildingsRes = await buildingApi.getBuildingsByProperty(42)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/buildings/property/42')
  const pList = propertyBuildingsRes?.data || propertyBuildingsRes
  assert.strictEqual(pList.length, 1)
  assert.strictEqual(pList[0].buildingName, 'Tower One')
  console.log('✔ getBuildingsByProperty routes to GET /api/buildings/property/{propertyId}')

  recordedCalls = []
  const singleBuildingRes = await buildingApi.getBuildingById(101)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/buildings/101')
  const bData = singleBuildingRes?.data || singleBuildingRes
  assert.strictEqual(bData.buildingId, 101)
  assert.strictEqual(bData.buildingName, 'Tower One')
  console.log('✔ getBuildingById routes to GET /api/buildings/{buildingId}')

  // TEST 2: Inspect PropertyDetailsPage.jsx
  console.log('\n--- 2. Inspecting PropertyDetailsPage.jsx Integration ---')
  const propDetailsContent = fs.readFileSync(propertyDetailsPath, 'utf8')
  assert.ok(
    propDetailsContent.includes('getBuildingsByProperty'),
    'PropertyDetailsPage must import getBuildingsByProperty'
  )
  assert.ok(
    propDetailsContent.includes('loadBuildings'),
    'PropertyDetailsPage must include loadBuildings helper'
  )
  assert.ok(
    propDetailsContent.includes('Buildings & Structures'),
    'PropertyDetailsPage must render "Buildings & Structures" section'
  )
  assert.ok(
    propDetailsContent.includes('/owner/buildings/${b.buildingId}'),
    'PropertyDetailsPage must link each building to /owner/buildings/:buildingId'
  )
  assert.ok(
    propDetailsContent.includes('View Buildings'),
    'PropertyDetailsPage must include "View Buildings" shortcut'
  )
  console.log('✔ PropertyDetailsPage properly consumes getBuildingsByProperty and links to Building Details')

  // TEST 3: Inspect BuildingsPage.jsx
  console.log('\n--- 3. Inspecting BuildingsPage.jsx (Building List) Integration ---')
  const buildingsPageContent = fs.readFileSync(buildingsPagePath, 'utf8')
  assert.ok(
    buildingsPageContent.includes('getBuildingsByProperty'),
    'BuildingsPage must import getBuildingsByProperty'
  )
  assert.ok(
    buildingsPageContent.includes('getMyProperties'),
    'BuildingsPage must import getMyProperties'
  )
  assert.ok(
    buildingsPageContent.includes('useSearchParams'),
    'BuildingsPage must support useSearchParams for propertyId query param'
  )
  assert.ok(
    buildingsPageContent.includes('propertyName') || buildingsPageContent.includes('property.name'),
    'BuildingsPage must display property name'
  )
  console.log('✔ BuildingsPage properly integrates getBuildingsByProperty, getMyProperties, and property filtering')

  // TEST 4: Inspect BuildingDetailsPage.jsx
  console.log('\n--- 4. Inspecting BuildingDetailsPage.jsx (Building Details) Integration ---')
  const buildingDetailsContent = fs.readFileSync(buildingDetailsPath, 'utf8')
  assert.ok(
    buildingDetailsContent.includes('getBuildingById'),
    'BuildingDetailsPage must import getBuildingById'
  )
  assert.ok(
    buildingDetailsContent.includes('Loader') && buildingDetailsContent.includes('isLoading'),
    'BuildingDetailsPage must show loader while loading'
  )
  assert.ok(
    buildingDetailsContent.includes('building.propertyName') || buildingDetailsContent.includes('building.property'),
    'BuildingDetailsPage must display associated property'
  )
  assert.ok(
    buildingDetailsContent.includes('/owner/properties/'),
    'BuildingDetailsPage must link back to associated property details'
  )
  console.log('✔ BuildingDetailsPage properly consumes getBuildingById and links back to Property Details')

  console.log('\n======================================================')
  console.log('ALL PHASE 5B BUILDING READ FLOW TESTS PASSED! 🎉')
  console.log('======================================================')
}

runTests().catch((err) => {
  console.error('Test Failed:', err)
  process.exit(1)
})
