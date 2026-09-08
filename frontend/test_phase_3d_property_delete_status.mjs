import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

console.log('=== TEST PHASE 3D: PROPERTY DELETE AND STATUS ===\n')

// 1. Test propertyApi.js contract for deleteProperty and updatePropertyStatus
const propertyApiPath = 'c:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/api/propertyApi.js'
const propertyApiCode = fs.readFileSync(propertyApiPath, 'utf-8')

// Check function exports
assert(
  propertyApiCode.includes('export const deleteProperty ='),
  'deleteProperty must be exported from propertyApi.js'
)
assert(
  propertyApiCode.includes('export const updatePropertyStatus ='),
  'updatePropertyStatus must be exported from propertyApi.js'
)
assert(
  propertyApiCode.includes('export const CANONICAL_PROPERTY_STATUSES ='),
  'CANONICAL_PROPERTY_STATUSES must be exported from propertyApi.js'
)

// Dynamic import of propertyApi module
const propertyApiModule = await import(`file://${propertyApiPath}`)
const { deleteProperty, updatePropertyStatus, CANONICAL_PROPERTY_STATUSES } = propertyApiModule

// Verify canonical statuses
const expectedStatuses = [
  'DRAFT',
  'AVAILABLE',
  'PUBLISHED',
  'OCCUPIED',
  'UNDER_MAINTENANCE',
  'INACTIVE',
]
assert.deepStrictEqual(
  CANONICAL_PROPERTY_STATUSES.sort(),
  [...expectedStatuses].sort(),
  'CANONICAL_PROPERTY_STATUSES must exactly match the 6 canonical statuses'
)
console.log('✔ CANONICAL_PROPERTY_STATUSES are verified:', CANONICAL_PROPERTY_STATUSES)

// Test rejection of non-canonical status
let rejected = false
try {
  await updatePropertyStatus('prop-123', 'INVALID_STATUS')
} catch (err) {
  rejected = true
  assert(
    err.message.includes('Invalid property status'),
    'Should reject invalid property status'
  )
}
assert(rejected, 'updatePropertyStatus must reject non-canonical status')
console.log('✔ updatePropertyStatus rejects non-canonical status values')

// 2. Static verification of PropertiesPage.jsx
const propertiesPagePath = 'c:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/pages/owner/PropertiesPage.jsx'
const propertiesPageCode = fs.readFileSync(propertiesPagePath, 'utf-8')

assert(
  propertiesPageCode.includes('deleteProperty'),
  'PropertiesPage.jsx must use deleteProperty'
)
assert(
  propertiesPageCode.includes('updatePropertyStatus'),
  'PropertiesPage.jsx must use updatePropertyStatus'
)
assert(
  !propertiesPageCode.includes('deleteMockProperty'),
  'PropertiesPage.jsx must NOT use deleteMockProperty'
)
assert(
  propertiesPageCode.includes('deletingId'),
  'PropertiesPage.jsx must prevent duplicate deletion requests using deletingId'
)
assert(
  propertiesPageCode.includes('updatingStatusId'),
  'PropertiesPage.jsx must track updatingStatusId for status changes'
)
assert(
  propertiesPageCode.includes('setToastMessage'),
  'PropertiesPage.jsx must preserve toast/feedback notifications'
)
console.log('✔ PropertiesPage.jsx delete & status integration verified')

// 3. Static verification of PropertyDetailsPage.jsx
const detailsPagePath = 'c:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/pages/owner/PropertyDetailsPage.jsx'
const detailsPageCode = fs.readFileSync(detailsPagePath, 'utf-8')

assert(
  detailsPageCode.includes('deleteProperty'),
  'PropertyDetailsPage.jsx must use deleteProperty'
)
assert(
  detailsPageCode.includes('updatePropertyStatus'),
  'PropertyDetailsPage.jsx must use updatePropertyStatus'
)
assert(
  !detailsPageCode.includes('deleteMockProperty'),
  'PropertyDetailsPage.jsx must NOT use deleteMockProperty'
)
assert(
  detailsPageCode.includes('isDeleting'),
  'PropertyDetailsPage.jsx must prevent duplicate deletions via isDeleting state'
)
assert(
  detailsPageCode.includes('isUpdatingStatus'),
  'PropertyDetailsPage.jsx must track isUpdatingStatus'
)
assert(
  detailsPageCode.includes('window.confirm'),
  'PropertyDetailsPage.jsx must keep the confirmation dialog'
)
assert(
  detailsPageCode.includes('navigate('),
  'PropertyDetailsPage.jsx must navigate back to properties list after deletion'
)
console.log('✔ PropertyDetailsPage.jsx delete & status integration verified')

// 4. Static verification of OwnerPropertyTable.jsx
const tablePath = 'c:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/components/properties/OwnerPropertyTable.jsx'
const tableCode = fs.readFileSync(tablePath, 'utf-8')

assert(
  tableCode.includes('onDelete'),
  'OwnerPropertyTable.jsx must handle onDelete'
)
assert(
  tableCode.includes('onStatusChange'),
  'OwnerPropertyTable.jsx must handle onStatusChange'
)
assert(
  tableCode.includes('window.confirm'),
  'OwnerPropertyTable.jsx must preserve confirmation dialog'
)
assert(
  tableCode.includes('deletingId'),
  'OwnerPropertyTable.jsx must show loader/disabled state for deletingId'
)
assert(
  tableCode.includes('updatingStatusId'),
  'OwnerPropertyTable.jsx must show loader/disabled state for updatingStatusId'
)
console.log('✔ OwnerPropertyTable.jsx delete & status actions verified')

console.log('\nALL PHASE 3D VERIFICATIONS PASSED!')
