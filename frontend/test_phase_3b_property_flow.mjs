import assert from 'assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = 'C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend'

console.log('--- 1. Testing PropertiesPage.jsx Mock Decoupling & API Integration ---')
const propertiesPageContent = fs.readFileSync(
  path.join(projectRoot, 'src/pages/owner/PropertiesPage.jsx'),
  'utf-8'
)

// Check that getMockProperties read is gone
assert.ok(
  !propertiesPageContent.includes('getMockProperties'),
  'FAIL: PropertiesPage.jsx must not reference getMockProperties'
)
// Check that getMyProperties is imported and invoked
assert.ok(
  propertiesPageContent.includes("import { getMyProperties } from '../../api/propertyApi'") ||
  propertiesPageContent.includes("getMyProperties"),
  'FAIL: PropertiesPage.jsx must import and use getMyProperties from propertyApi'
)
// Check loading and error state
assert.ok(
  propertiesPageContent.includes('isLoading') && propertiesPageContent.includes('setIsLoading'),
  'FAIL: PropertiesPage.jsx must manage isLoading state'
)
assert.ok(
  propertiesPageContent.includes('error') && propertiesPageContent.includes('setError'),
  'FAIL: PropertiesPage.jsx must manage error state'
)
assert.ok(
  propertiesPageContent.includes('<Loader'),
  'FAIL: PropertiesPage.jsx must render Loader component for loading state'
)
console.log('✔ PropertiesPage.jsx correctly consumes getMyProperties, uses Loader, and eliminated getMockProperties')

console.log('\n--- 2. Testing PropertyDetailsPage.jsx Mock Decoupling & API Integration ---')
const propertyDetailsPageContent = fs.readFileSync(
  path.join(projectRoot, 'src/pages/owner/PropertyDetailsPage.jsx'),
  'utf-8'
)

// Check that getMockPropertyById read is gone
assert.ok(
  !propertyDetailsPageContent.includes('getMockPropertyById'),
  'FAIL: PropertyDetailsPage.jsx must not reference getMockPropertyById'
)
// Check that getPropertyById is imported and invoked
assert.ok(
  propertyDetailsPageContent.includes("import { getPropertyById } from '../../api/propertyApi'") ||
  propertyDetailsPageContent.includes("getPropertyById"),
  'FAIL: PropertyDetailsPage.jsx must import and use getPropertyById from propertyApi'
)
// Check loading and error state
assert.ok(
  propertyDetailsPageContent.includes('isLoading') && propertyDetailsPageContent.includes('setIsLoading'),
  'FAIL: PropertyDetailsPage.jsx must manage isLoading state'
)
assert.ok(
  propertyDetailsPageContent.includes('error') && propertyDetailsPageContent.includes('setError'),
  'FAIL: PropertyDetailsPage.jsx must manage error state'
)
assert.ok(
  propertyDetailsPageContent.includes('<Loader'),
  'FAIL: PropertyDetailsPage.jsx must render Loader component for loading state'
)
assert.ok(
  propertyDetailsPageContent.includes('Address not specified'),
  'FAIL: PropertyDetailsPage.jsx must have clean fallback for empty address'
)
console.log('✔ PropertyDetailsPage.jsx correctly consumes getPropertyById, uses Loader, and eliminated getMockPropertyById')

console.log('\n--- 3. Testing Backend-to-UI Field Mapping Logic ---')
// Extract mapBackendPropertyToUi function from PropertiesPage
// We evaluate it with mock backend PropertyResponse
const sampleBackendResponse = {
  propertyId: 101,
  propertyName: 'Highland Luxury Suites',
  propertyType: 'APARTMENT',
  description: 'Contemporary high-rise living with skyline views.',
  totalArea: 1450,
  bedrooms: 3,
  bathrooms: 2,
  furnishingStatus: 'FULLY_FURNISHED',
  parkingAvailable: true,
  monthlyRent: 2800.0,
  securityDeposit: 3500.0,
  status: 'AVAILABLE',
  ownerId: 42,
  ownerName: 'Sarah Jenkins',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-05T14:30:00Z'
}

// Extract mapBackendPropertyToUi source from PropertiesPage.jsx
const mapperRegex = /export const mapBackendPropertyToUi = \([\s\S]*?\n\}/
const match = propertiesPageContent.match(mapperRegex)
assert.ok(match, 'FAIL: mapBackendPropertyToUi must be defined in PropertiesPage.jsx')

const evalFn = new Function(match[0].replace('export const ', 'return ') + '; return mapBackendPropertyToUi;')
const mapBackendPropertyToUi = evalFn()

assert.equal(typeof mapBackendPropertyToUi, 'function', 'mapBackendPropertyToUi should be a function')

const mapped = mapBackendPropertyToUi(sampleBackendResponse)

// Test key field mappings
assert.equal(mapped.id, '101', 'backend propertyId must map to UI property id')
assert.equal(mapped.name, 'Highland Luxury Suites', 'backend propertyName must map to UI property name')
assert.equal(mapped.type, 'APARTMENT', 'backend propertyType must map to UI property type')
assert.equal(mapped.area, 1450, 'backend totalArea must map to UI area')
assert.equal(mapped.totalArea, 1450, 'backend totalArea must be preserved')
assert.equal(mapped.bedrooms, 3, 'bedrooms must map correctly')
assert.equal(mapped.bathrooms, 2, 'bathrooms must map correctly')
assert.equal(mapped.furnishing, 'FULLY_FURNISHED', 'furnishingStatus must map to UI furnishing')
assert.equal(mapped.furnishingStatus, 'FULLY_FURNISHED', 'furnishingStatus must be preserved')
assert.equal(mapped.parking, 'Available', 'parkingAvailable=true must map to UI parking "Available"')
assert.equal(mapped.monthlyRent, 2800.0, 'monthlyRent must map correctly')
assert.equal(mapped.deposit, 3500.0, 'securityDeposit must map to deposit')
assert.equal(mapped.securityDeposit, 3500.0, 'securityDeposit must be preserved')
assert.equal(mapped.status, 'AVAILABLE', 'status must map correctly')

// Test Address fallback constraint: DO NOT invent fake address
assert.equal(mapped.address, '', 'address must not be invented from other fields')
assert.equal(mapped.city, '', 'city must not be invented from other fields')
assert.equal(mapped.state, '', 'state must not be invented from other fields')
assert.equal(mapped.zipCode, '', 'zipCode must not be invented from other fields')

// Test Unit fallback metrics
assert.equal(mapped.totalUnits, 1, 'totalUnits should default safely to 1')
assert.equal(mapped.occupiedUnits, 0, 'occupiedUnits should default safely to 0 when AVAILABLE')

console.log('✔ mapBackendPropertyToUi produces exact expected UI shape with correct fallbacks')

console.log('\n--- 4. Testing Edge Cases in Field Mapping ---')
// Null/undefined inputs
assert.equal(mapBackendPropertyToUi(null), null, 'null input maps to null')
assert.equal(mapBackendPropertyToUi(undefined), null, 'undefined input maps to null')

// Occupied property units
const occupiedProp = mapBackendPropertyToUi({
  propertyId: 202,
  propertyName: 'Downtown Loft',
  propertyType: 'LOFT',
  parkingAvailable: false,
  status: 'OCCUPIED'
})
assert.equal(occupiedProp.parking, 'None', 'parkingAvailable=false maps to "None"')
assert.equal(occupiedProp.occupiedUnits, 1, 'status=OCCUPIED defaults occupiedUnits to 1')

console.log('✔ Edge cases (null inputs, boolean parking, occupied status) handled correctly')

console.log('\n======================================================')
console.log('ALL PHASE 3B PROPERTY FLOW TESTS PASSED! 🎉')
console.log('======================================================')
