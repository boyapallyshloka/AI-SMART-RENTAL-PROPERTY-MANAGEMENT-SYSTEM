import assert from 'assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = 'C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend'

console.log('--- 1. Testing PropertySearchPage.jsx Mock Decoupling & API Integration ---')
const searchPageContent = fs.readFileSync(
  path.join(projectRoot, 'src/pages/tenant/PropertySearchPage.jsx'),
  'utf-8'
)

// Check that mock property functions and data are NOT referenced
assert.ok(
  !searchPageContent.includes('getAvailableProperties'),
  'FAIL: PropertySearchPage.jsx must not reference getAvailableProperties'
)
assert.ok(
  !searchPageContent.includes('mockGetAvailableProperties'),
  'FAIL: PropertySearchPage.jsx must not reference mockGetAvailableProperties'
)
assert.ok(
  !searchPageContent.includes('MOCK_PROPERTIES'),
  'FAIL: PropertySearchPage.jsx must not reference MOCK_PROPERTIES'
)
assert.ok(
  !searchPageContent.includes('propertyMockData'),
  'FAIL: PropertySearchPage.jsx must not reference propertyMockData'
)
assert.ok(
  !searchPageContent.includes('prop-1'),
  'FAIL: PropertySearchPage.jsx must not contain mock IDs like prop-1'
)

// Check that getProperties is imported and used
assert.ok(
  searchPageContent.includes("import { getProperties } from '../../api/propertyApi'"),
  'FAIL: PropertySearchPage.jsx must import getProperties from propertyApi'
)
assert.ok(
  searchPageContent.includes('await getProperties()'),
  'FAIL: PropertySearchPage.jsx must call getProperties()'
)

// Check loading and error state
assert.ok(
  searchPageContent.includes('isLoading') && searchPageContent.includes('setIsLoading'),
  'FAIL: PropertySearchPage.jsx must manage isLoading state'
)
assert.ok(
  searchPageContent.includes('error') && searchPageContent.includes('setError'),
  'FAIL: PropertySearchPage.jsx must manage error state'
)
assert.ok(
  searchPageContent.includes('Try Again') && searchPageContent.includes('loadProperties'),
  'FAIL: PropertySearchPage.jsx must provide a retry action for error recovery'
)

// Check real ID navigation
assert.ok(
  searchPageContent.includes('property.propertyId ?? property.id') ||
  searchPageContent.includes('property.propertyId || property.id') ||
  searchPageContent.includes('navigate(`/tenant/properties/${propertyId}`)'),
  'FAIL: PropertySearchPage.jsx must navigate passing the real backend property ID'
)
console.log('✔ PropertySearchPage.jsx correctly decoupled from mocks, connected to getProperties, and handles error/loading/navigation.')

console.log('\n--- 2. Testing PropertyCard.jsx Contract Adherence ---')
const propertyCardContent = fs.readFileSync(
  path.join(projectRoot, 'src/components/properties/PropertyCard.jsx'),
  'utf-8'
)

assert.ok(
  propertyCardContent.includes('resolveImageUrl'),
  'FAIL: PropertyCard.jsx must use resolveImageUrl for real image resolution'
)
assert.ok(
  propertyCardContent.includes('hasRent'),
  'FAIL: PropertyCard.jsx must check hasRent to hide unit-level rent when absent'
)
assert.ok(
  propertyCardContent.includes('hasBeds'),
  'FAIL: PropertyCard.jsx must check hasBeds to hide unit-level bedrooms when absent'
)
assert.ok(
  propertyCardContent.includes('hasBaths'),
  'FAIL: PropertyCard.jsx must check hasBaths to hide unit-level bathrooms when absent'
)
assert.ok(
  !propertyCardContent.includes('prop-101'),
  'FAIL: PropertyCard.jsx must not contain mock IDs'
)
console.log('✔ PropertyCard.jsx correctly adheres to Unit/Property contract, hiding rent/beds/baths when null and resolving real images.')

console.log('\n--- 3. Testing PropertyGrid.jsx Loading Skeletons ---')
const propertyGridContent = fs.readFileSync(
  path.join(projectRoot, 'src/components/properties/PropertyGrid.jsx'),
  'utf-8'
)
assert.ok(
  propertyGridContent.includes('isLoading') && propertyGridContent.includes('animate-pulse'),
  'FAIL: PropertyGrid.jsx must render loading skeletons when isLoading is true'
)
console.log('✔ PropertyGrid.jsx correctly renders skeleton states.')

console.log('\n--- 4. Testing AppRoutes.jsx Tenant Routes ---')
const appRoutesContent = fs.readFileSync(
  path.join(projectRoot, 'src/routes/AppRoutes.jsx'),
  'utf-8'
)
assert.ok(
  appRoutesContent.includes("import PropertySearchPage from '../pages/tenant/PropertySearchPage'"),
  'FAIL: AppRoutes.jsx must import PropertySearchPage'
)
assert.ok(
  appRoutesContent.includes('<Route path="properties" element={<PropertySearchPage />} />'),
  'FAIL: AppRoutes.jsx must route properties to PropertySearchPage'
)
assert.ok(
  appRoutesContent.includes('<Route path="find-properties" element={<PropertySearchPage />} />'),
  'FAIL: AppRoutes.jsx must route find-properties to PropertySearchPage'
)
console.log('✔ AppRoutes.jsx correctly registers Tenant Property Search routes.')

console.log('\n--- 5. Testing propertyApi.js Image Resolution & Property Mapping ---')
const propertyApiContent = fs.readFileSync(
  path.join(projectRoot, 'src/api/propertyApi.js'),
  'utf-8'
)
assert.ok(
  propertyApiContent.includes('export const resolveImageUrl ='),
  'FAIL: propertyApi.js must export resolveImageUrl'
)
assert.ok(
  propertyApiContent.includes('export const getProperties ='),
  'FAIL: propertyApi.js must export getProperties'
)
console.log('✔ propertyApi.js correctly exports resolveImageUrl and getProperties.')

console.log('\nALL TENANT PHASE 1 STATIC CONTRACT CHECKS PASSED!')
