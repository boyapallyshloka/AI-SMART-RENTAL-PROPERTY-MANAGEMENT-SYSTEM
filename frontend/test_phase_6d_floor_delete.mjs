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

console.log('🧪 Starting Phase 6D - Floor Delete Flow Verification...\n')

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
  deleteFloor,
  createFloor,
  updateFloor,
  getFloorById,
  getFloorsByBuilding,
  isUsingMockFloors,
  setUseMockFloors,
  getFloorsForManager,
  getFloorsForTenant,
  getFloorByIdForManager,
  getFloorByIdForTenant,
} = floorApi

const bldDetailsContent = fs.readFileSync(buildingDetailsPagePath, 'utf-8')
const floorDetailsContent = fs.readFileSync(floorDetailsPagePath, 'utf-8')

// --------------------------------------------------------------------------
// Item 1, 2, 3, 4: deleteFloor(floorId) Contract
// --------------------------------------------------------------------------
console.log('--- Test Section 1: deleteFloor Endpoint Contract ---')

let capturedDelete = null
const originalDelete = axiosClient.delete
axiosClient.delete = async (url, config) => {
  capturedDelete = { url, config }
  return { status: 204, data: null }
}

const testFloorId = 88
await deleteFloor(testFloorId)

assert.ok(capturedDelete, '1. deleteFloor must call axiosClient.delete')
assert.strictEqual(
  capturedDelete.url,
  `/floors/${testFloorId}`,
  '1 & 2. deleteFloor must call DELETE /api/floors/{floorId} with floorId in the URL'
)
assert.strictEqual(
  capturedDelete.config,
  undefined,
  '3. No request body, headers override or extra config should be passed in delete'
)

// Extra verification: calling with another floorId
await deleteFloor(999)
assert.strictEqual(capturedDelete.url, '/floors/999', '2. Dynamic floorId must be in URL')

console.log('✅ Items 1-4 Passed: deleteFloor(floorId) calls DELETE /api/floors/{floorId} with URL param only')

// --------------------------------------------------------------------------
// Item 5, 7, 8, 9, 10, 11: Owner Floor List Delete (BuildingDetailsPage.jsx)
// --------------------------------------------------------------------------
console.log('\n--- Test Section 2: BuildingDetailsPage.jsx Floor List Delete Integration ---')

assert.ok(
  bldDetailsContent.includes('deleteFloor(floorDeleteTarget.floorId)'),
  '5. Owner Floor list delete must use deleteFloor(floorDeleteTarget.floorId)'
)
assert.ok(
  bldDetailsContent.includes('<DeleteConfirmModal'),
  '7. Confirmation modal must exist before deletion'
)
assert.ok(
  bldDetailsContent.includes('isOpen={Boolean(floorDeleteTarget)}'),
  '7. DeleteConfirmModal opens with target floor'
)
assert.ok(
  bldDetailsContent.includes('if (!floorDeleteTarget || !canManage || isDeletingFloor) return'),
  '8. Duplicate deletion is prevented by checking isDeletingFloor'
)
assert.ok(
  bldDetailsContent.includes('isLoading={isDeletingFloor}'),
  '9. Loading state is forwarded to DeleteConfirmModal'
)
assert.ok(
  bldDetailsContent.includes('await loadData()'),
  '10. Successful deletion reloads data / updates the UI'
)
assert.ok(
  bldDetailsContent.includes('showToast('),
  '10. Successful deletion triggers success toast'
)
assert.ok(
  bldDetailsContent.includes('setErrorMessage(errorMsg)'),
  '11. Error handling sets error message on failure'
)
assert.ok(
  bldDetailsContent.includes('canManage'),
  'Role restriction check canManage must guard deletion'
)

console.log('✅ Items 5, 7-11 Passed: BuildingDetailsPage.jsx correctly connects floor delete with confirmation, loading, and error handling')

// --------------------------------------------------------------------------
// Item 6, 7, 8, 9, 10, 11: Owner Floor Details Delete (FloorDetailsPage.jsx)
// --------------------------------------------------------------------------
console.log('\n--- Test Section 3: FloorDetailsPage.jsx Floor Details Delete Integration ---')

assert.ok(
  floorDetailsContent.includes('deleteFloor(floor.floorId)'),
  '6. FloorDetailsPage must call deleteFloor(floor.floorId)'
)
assert.ok(
  floorDetailsContent.includes('<DeleteConfirmModal'),
  '7. DeleteConfirmModal must exist on FloorDetailsPage'
)
assert.ok(
  floorDetailsContent.includes('isOpen={isDeleteFloorOpen}'),
  '7. DeleteConfirmModal opens with isDeleteFloorOpen'
)
assert.ok(
  floorDetailsContent.includes('if (!floor || !canManage || isDeletingFloor) return'),
  '8. Duplicate deletion is prevented by checking isDeletingFloor'
)
assert.ok(
  floorDetailsContent.includes('isLoading={isDeletingFloor}'),
  '9. Loading state is forwarded to DeleteConfirmModal'
)
assert.ok(
  floorDetailsContent.includes('navigate(`${basePath}/buildings/${building?.buildingId || buildingId}'),
  '10. Successful deletion navigates to Building Details route'
)
assert.ok(
  floorDetailsContent.includes('setErrorMessage(errorMsg)'),
  '11. Error handling sets error message on failure'
)
assert.ok(
  floorDetailsContent.includes('{/* Error Notification */}'),
  '11. Error notification banner is rendered on FloorDetailsPage'
)

console.log('✅ Items 6, 7-11 Passed: FloorDetailsPage.jsx correctly connects floor delete with confirmation, loading, navigation, and error handling')

// --------------------------------------------------------------------------
// Item 12, 13: Mock Isolation & Role Restrictions
// --------------------------------------------------------------------------
console.log('\n--- Test Section 4: Mock Isolation & Preserved Helpers ---')

assert.strictEqual(isUsingMockFloors(), false, '12. Active OWNER flow uses real Spring Boot API by default')
assert.ok(
  !bldDetailsContent.includes('deleteMockFloor'),
  '12. BuildingDetailsPage must not use mock deleteMockFloor'
)
assert.ok(
  !floorDetailsContent.includes('deleteMockFloor'),
  '12. FloorDetailsPage must not use mock deleteMockFloor'
)
assert.strictEqual(
  typeof getFloorsForManager,
  'function',
  '13. Manager mock helper remains preserved'
)
assert.strictEqual(
  typeof getFloorsForTenant,
  'function',
  '13. Tenant mock helper remains preserved'
)
assert.strictEqual(
  typeof getFloorByIdForManager,
  'function',
  '13. Manager single floor mock helper remains preserved'
)
assert.strictEqual(
  typeof getFloorByIdForTenant,
  'function',
  '13. Tenant single floor mock helper remains preserved'
)

console.log('✅ Items 12-13 Passed: Mock helpers preserved for Manager/Tenant; Owner delete uses real API')

// --------------------------------------------------------------------------
// Item 14: Floor create/edit/read functionality remains untouched
// --------------------------------------------------------------------------
console.log('\n--- Test Section 5: Floor Create/Edit/Read Untouched ---')

assert.strictEqual(typeof createFloor, 'function', '14. createFloor remains intact')
assert.strictEqual(typeof updateFloor, 'function', '14. updateFloor remains intact')
assert.strictEqual(typeof getFloorById, 'function', '14. getFloorById remains intact')
assert.strictEqual(typeof getFloorsByBuilding, 'function', '14. getFloorsByBuilding remains intact')

assert.ok(
  bldDetailsContent.includes('createFloor(payload)'),
  '14. Floor create in BuildingDetailsPage remains intact'
)
assert.ok(
  bldDetailsContent.includes('updateFloor(floorModalData.floorId, payload)'),
  '14. Floor edit in BuildingDetailsPage remains intact'
)
assert.ok(
  floorDetailsContent.includes('updateFloor(floor.floorId, payload)'),
  '14. Floor edit in FloorDetailsPage remains intact'
)
assert.ok(
  bldDetailsContent.includes('getFloorsByBuilding(buildingId)'),
  '14. Floor read list in BuildingDetailsPage remains intact'
)
assert.ok(
  floorDetailsContent.includes('getFloorById(floorId)'),
  '14. Floor read single in FloorDetailsPage remains intact'
)

console.log('✅ Item 14 Passed: Floor create/edit/read functionality remains intact and untouched')

// Restore original delete function
axiosClient.delete = originalDelete

console.log('\n🎉 ALL 14 PHASE 6D FLOOR DELETE FLOW VERIFICATIONS PASSED!')
