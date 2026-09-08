/**
 * Phase 4C Property Amenities Verification Suite
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
  console.log('--- Starting Phase 4C Property Amenities Verification Tests ---')

  const amenityApiPath = path.resolve(
    __dirname,
    '../../../../../OneDrive/Desktop/Homeshpere/frontend/src/api/amenityApi.js'
  )
  const propertyDetailsPagePath = path.resolve(
    __dirname,
    '../../../../../OneDrive/Desktop/Homeshpere/frontend/src/pages/owner/PropertyDetailsPage.jsx'
  )
  const axiosClientPath = path.resolve(
    __dirname,
    '../../../../../OneDrive/Desktop/Homeshpere/frontend/src/api/axiosClient.js'
  )

  const axiosClientModule = await import(`file://${axiosClientPath}`)
  const axiosClient = axiosClientModule.default

  const amenityApi = await import(`file://${amenityApiPath}`)

  let recordedCalls = []
  // Mock axiosClient methods
  axiosClient.get = async (url, config) => {
    recordedCalls.push({ method: 'GET', url, config })
    return { data: [] }
  }
  axiosClient.post = async (url, data, config) => {
    recordedCalls.push({ method: 'POST', url, data, config })
    return { data: { amenityId: 10, amenityName: data?.amenityName || 'Sample' } }
  }
  axiosClient.put = async (url, data, config) => {
    recordedCalls.push({ method: 'PUT', url, data, config })
    return { data: { amenityId: 10, ...data } }
  }
  axiosClient.delete = async (url, config) => {
    recordedCalls.push({ method: 'DELETE', url, config })
    return { data: { success: true } }
  }

  // TEST 1: formatAmenityRequest payload sanitization
  console.log('Testing formatAmenityRequest sanitization...')
  const messyInput = {
    amenityName: 'Swimming Pool',
    description: 'Heated outdoor pool',
    propertyId: 100, // FORBIDDEN
    amenityId: 5, // FORBIDDEN
    ownerId: 2, // FORBIDDEN
    createdAt: '2026-01-01', // FORBIDDEN
    updatedAt: '2026-01-02', // FORBIDDEN
    extraUI: 'unused', // FORBIDDEN
  }
  const formatted = amenityApi.formatAmenityRequest(messyInput)
  assert.strictEqual(formatted.amenityName, 'Swimming Pool')
  assert.strictEqual(formatted.description, 'Heated outdoor pool')
  assert.strictEqual(formatted.propertyId, undefined, 'propertyId must NOT be in body')
  assert.strictEqual(formatted.amenityId, undefined, 'amenityId must NOT be in body')
  assert.strictEqual(formatted.ownerId, undefined, 'ownerId must NOT be in body')
  assert.strictEqual(formatted.createdAt, undefined, 'createdAt must NOT be in body')
  assert.deepStrictEqual(Object.keys(formatted).sort(), ['amenityName', 'description'].sort())
  console.log('✓ formatAmenityRequest strictly limits fields to amenityName and description')

  // TEST 2: GET /api/amenities
  console.log('Testing getAllAmenities...')
  recordedCalls = []
  await amenityApi.getAllAmenities()
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/amenities')
  console.log('✓ getAllAmenities correctly requests GET /api/amenities')

  // TEST 3: GET /api/amenities/{amenityId}
  console.log('Testing getAmenityById...')
  recordedCalls = []
  await amenityApi.getAmenityById(25)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/amenities/25')
  console.log('✓ getAmenityById correctly requests GET /api/amenities/{amenityId}')

  // TEST 4: POST /api/amenities (createAmenity)
  console.log('Testing createAmenity...')
  recordedCalls = []
  await amenityApi.createAmenity(messyInput)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'POST')
  assert.strictEqual(recordedCalls[0].url, '/amenities')
  assert.strictEqual(recordedCalls[0].data.amenityName, 'Swimming Pool')
  assert.strictEqual(recordedCalls[0].data.description, 'Heated outdoor pool')
  assert.strictEqual(recordedCalls[0].data.propertyId, undefined)
  assert.strictEqual(recordedCalls[0].data.amenityId, undefined)
  console.log('✓ createAmenity correctly requests POST /api/amenities with sanitized body')

  // TEST 5: PUT /api/amenities/{amenityId} (updateAmenity)
  console.log('Testing updateAmenity...')
  recordedCalls = []
  await amenityApi.updateAmenity(25, { amenityName: 'Olympic Pool', propertyId: 99 })
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/amenities/25')
  assert.strictEqual(recordedCalls[0].data.amenityName, 'Olympic Pool')
  assert.strictEqual(recordedCalls[0].data.propertyId, undefined)
  console.log('✓ updateAmenity correctly requests PUT /api/amenities/{amenityId}')

  // TEST 6: DELETE /api/amenities/{amenityId} (deleteAmenity)
  console.log('Testing deleteAmenity...')
  recordedCalls = []
  await amenityApi.deleteAmenity(25)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'DELETE')
  assert.strictEqual(recordedCalls[0].url, '/amenities/25')
  console.log('✓ deleteAmenity correctly requests DELETE /api/amenities/{amenityId}')

  // TEST 7: GET /api/amenities/property/{propertyId}
  console.log('Testing getPropertyAmenities...')
  recordedCalls = []
  await amenityApi.getPropertyAmenities(42)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/amenities/property/42')
  console.log('✓ getPropertyAmenities correctly requests GET /api/amenities/property/{propertyId}')

  // TEST 8: POST /api/amenities/property/{propertyId}/amenity/{amenityId}
  console.log('Testing addAmenityToProperty...')
  recordedCalls = []
  await amenityApi.addAmenityToProperty(42, 7)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'POST')
  assert.strictEqual(recordedCalls[0].url, '/amenities/property/42/amenity/7')
  console.log('✓ addAmenityToProperty correctly requests POST /api/amenities/property/{propertyId}/amenity/{amenityId}')

  // TEST 9: DELETE /api/amenities/property/{propertyId}/amenity/{amenityId}
  console.log('Testing removeAmenityFromProperty...')
  recordedCalls = []
  await amenityApi.removeAmenityFromProperty(42, 7)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'DELETE')
  assert.strictEqual(recordedCalls[0].url, '/amenities/property/42/amenity/7')
  console.log('✓ removeAmenityFromProperty correctly requests DELETE /api/amenities/property/{propertyId}/amenity/{amenityId}')

  // TEST 10: Inspect PropertyDetailsPage.jsx source code
  console.log('Inspecting PropertyDetailsPage.jsx for amenity integration & safeguards...')
  const detailsSource = fs.readFileSync(propertyDetailsPagePath, 'utf8')

  assert.ok(
    detailsSource.includes('getPropertyAmenities'),
    'PropertyDetailsPage must import and call getPropertyAmenities'
  )
  assert.ok(
    detailsSource.includes('addAmenityToProperty'),
    'PropertyDetailsPage must import and call addAmenityToProperty'
  )
  assert.ok(
    detailsSource.includes('removeAmenityFromProperty'),
    'PropertyDetailsPage must import and call removeAmenityFromProperty'
  )
  assert.ok(
    detailsSource.includes('getAllAmenities'),
    'PropertyDetailsPage must import and call getAllAmenities'
  )
  assert.ok(
    detailsSource.includes('createAmenity'),
    'PropertyDetailsPage must import and call createAmenity'
  )
  assert.ok(
    detailsSource.includes('loadAmenities'),
    'PropertyDetailsPage must declare loadAmenities helper'
  )
  assert.ok(
    detailsSource.includes('propertyAmenities.length > 0'),
    'PropertyDetailsPage must conditionally render based on backend propertyAmenities length'
  )
  assert.ok(
    detailsSource.includes('No amenities specified yet'),
    'PropertyDetailsPage must display empty state when backend returns 0 amenities'
  )
  assert.ok(
    detailsSource.includes('window.confirm'),
    'PropertyDetailsPage must prompt confirmation before removing an amenity'
  )
  assert.ok(
    detailsSource.includes('isSubmittingAmenity') && detailsSource.includes('isRemovingAmenityId'),
    'PropertyDetailsPage must guard against duplicate submissions/removals'
  )

  console.log('✓ PropertyDetailsPage.jsx cleanly integrates amenityApi with proper loading, empty state, and duplicate protection')

  console.log('\nAll Phase 4C tests PASSED successfully!')
}

runTests().catch((err) => {
  console.error('Test Failed:', err)
  process.exit(1)
})
