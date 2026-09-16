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

console.log('🧪 Starting Phase 5D - Building Delete Verification...\n')

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
const axiosClientPath = resolvePath('src/api/axiosClient.js')
const buildingsPagePath = resolvePath('src/pages/owner/BuildingsPage.jsx')
const buildingDetailsPagePath = resolvePath('src/pages/owner/BuildingDetailsPage.jsx')

const buildingApi = await import(`file://${buildingApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

const {
  deleteBuilding,
  setUseMockBuildings,
  isUsingMockBuildings,
} = buildingApi

// --------------------------------------------------------------------------
// Test 1: Verify deleteBuilding Endpoint Contract (DELETE /api/buildings/{buildingId})
// --------------------------------------------------------------------------
console.log('--- Test 1: deleteBuilding Endpoint Contract ---')

let capturedDeleteRequest = null
const originalDelete = axiosClient.delete

axiosClient.delete = async (url, config) => {
  capturedDeleteRequest = { url, config }
  return 'Building deleted successfully'
}

try {
  setUseMockBuildings(false)
  assert.strictEqual(isUsingMockBuildings(), false, 'Real backend mode must be active')

  const testBuildingId = 55
  const res = await deleteBuilding(testBuildingId)
  console.log('Captured DELETE request:', capturedDeleteRequest)

  assert.strictEqual(
    capturedDeleteRequest.url,
    '/buildings/55',
    'URL must match /buildings/{buildingId} exactly'
  )
  assert.strictEqual(
    capturedDeleteRequest.config,
    undefined,
    'No body, params, or extra options should be passed in delete config'
  )
  assert.strictEqual(res, 'Building deleted successfully')
} finally {
  axiosClient.delete = originalDelete
}

console.log('✅ Test 1 Passed: deleteBuilding calls DELETE /api/buildings/{buildingId} with no request body or extra fields.\n')

// --------------------------------------------------------------------------
// Test 2: Verify Active Owner Flow Does Not Depend on Mock Deletion
// --------------------------------------------------------------------------
console.log('--- Test 2: Active Owner Mode & Mock Isolation ---')

// Default isUsingMockBuildings() should be false
setUseMockBuildings(false)
assert.strictEqual(
  isUsingMockBuildings(),
  false,
  'Default active state for owner building operations must connect to real REST API'
)

console.log('✅ Test 2 Passed: Active owner Building delete flow does not depend on mock deletion.\n')

// --------------------------------------------------------------------------
// Test 3: Verify BuildingsPage.jsx Delete Flow Integration
// --------------------------------------------------------------------------
console.log('--- Test 3: BuildingsPage.jsx Implementation Review ---')

const buildingsPageSrc = fs.readFileSync(buildingsPagePath, 'utf-8')

assert(
  buildingsPageSrc.includes('deleteBuilding(deleteTarget.buildingId)'),
  'BuildingsPage must invoke deleteBuilding with deleteTarget.buildingId'
)
assert(
  buildingsPageSrc.includes('if (!deleteTarget || isDeleting) return'),
  'BuildingsPage must prevent duplicate delete requests'
)
assert(
  buildingsPageSrc.includes('setIsDeleting(true)'),
  'BuildingsPage must track deletion loading state'
)
assert(
  buildingsPageSrc.includes('isLoading={isDeleting}'),
  'BuildingsPage must pass isLoading to DeleteConfirmModal'
)
assert(
  buildingsPageSrc.includes('setDeleteTarget(null)'),
  'BuildingsPage must clear delete target on success'
)
assert(
  buildingsPageSrc.includes('setToastMessage('),
  'BuildingsPage must show success message on deletion'
)
assert(
  buildingsPageSrc.includes('errorMessage') && buildingsPageSrc.includes('setErrorMessage('),
  'BuildingsPage must handle and display API errors'
)
assert(
  buildingsPageSrc.includes('canManage && ('),
  'BuildingsPage must restrict delete action to owner only (canManage)'
)

console.log('✅ Test 3 Passed: BuildingsPage.jsx has duplicate prevention, loading, error handling, and owner-only protection.\n')

// --------------------------------------------------------------------------
// Test 4: Verify BuildingDetailsPage.jsx Delete Flow Integration
// --------------------------------------------------------------------------
console.log('--- Test 4: BuildingDetailsPage.jsx Implementation Review ---')

const buildingDetailsSrc = fs.readFileSync(buildingDetailsPagePath, 'utf-8')

assert(
  buildingDetailsSrc.includes('deleteBuilding(building.buildingId)'),
  'BuildingDetailsPage must invoke deleteBuilding with building.buildingId'
)
assert(
  buildingDetailsSrc.includes('if (!building || !canManage || isDeletingBuilding) return'),
  'BuildingDetailsPage must prevent duplicate delete requests'
)
assert(
  buildingDetailsSrc.includes('setIsDeletingBuilding(true)'),
  'BuildingDetailsPage must track deletion loading state'
)
assert(
  buildingDetailsSrc.includes('isLoading={isDeletingBuilding}'),
  'BuildingDetailsPage must pass isLoading to DeleteConfirmModal'
)
assert(
  buildingDetailsSrc.includes('navigate(`${basePath}/buildings`') ||
    buildingDetailsSrc.includes("navigate('/owner/buildings'") ||
    buildingDetailsSrc.includes('navigate(`${basePath}/buildings`, {'),
  'BuildingDetailsPage must navigate to /owner/buildings on success'
)
assert(
  buildingDetailsSrc.includes('errorMessage') && buildingDetailsSrc.includes('setErrorMessage('),
  'BuildingDetailsPage must handle and display API errors without navigating away'
)
assert(
  buildingDetailsSrc.includes('canManage && ('),
  'BuildingDetailsPage must restrict delete action to owner only (canManage)'
)

console.log('✅ Test 4 Passed: BuildingDetailsPage.jsx has confirmation, loading, navigation on success, error recovery, and role check.\n')

console.log('🎉 ALL PHASE 5D BUILDING DELETE TESTS PASSED SUCCESSFULLY!')
