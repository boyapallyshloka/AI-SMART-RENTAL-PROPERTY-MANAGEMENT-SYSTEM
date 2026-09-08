import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

console.log('=== TEST PHASE 4A: PROPERTY ADDRESS INTEGRATION ===\n')

const projectRoot = 'C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend'

// 1. Inspect propertyAddressApi.js implementation
const apiFile = path.join(projectRoot, 'src/api/propertyAddressApi.js')
const apiCode = fs.readFileSync(apiFile, 'utf-8')

assert.ok(apiCode.includes('export const createAddress ='), 'FAIL: createAddress must be exported')
assert.ok(apiCode.includes('export const getAddress ='), 'FAIL: getAddress must be exported')
assert.ok(apiCode.includes('export const updateAddress ='), 'FAIL: updateAddress must be exported')
assert.ok(apiCode.includes('export const deleteAddress ='), 'FAIL: deleteAddress must be exported')
assert.ok(apiCode.includes('formatAddressRequest'), 'FAIL: formatAddressRequest must be defined')
assert.ok(apiCode.includes('ALLOWED_ADDRESS_REQUEST_FIELDS'), 'FAIL: ALLOWED_ADDRESS_REQUEST_FIELDS must be exported')

const propertyAddressApi = await import(`file:///${apiFile.replace(/\\/g, '/')}`)
const {
  createAddress,
  getAddress,
  updateAddress,
  deleteAddress,
  formatAddressRequest,
  ALLOWED_ADDRESS_REQUEST_FIELDS,
} = propertyAddressApi

console.log('✔ propertyAddressApi exports verified')

// 2. Test ALLOWED_ADDRESS_REQUEST_FIELDS
const expectedFields = [
  'addressLine1',
  'addressLine2',
  'area',
  'city',
  'state',
  'country',
  'pincode',
  'latitude',
  'longitude',
]

assert.deepStrictEqual(
  [...ALLOWED_ADDRESS_REQUEST_FIELDS].sort(),
  [...expectedFields].sort(),
  'ALLOWED_ADDRESS_REQUEST_FIELDS must match the 9 canonical backend request fields'
)
console.log('✔ ALLOWED_ADDRESS_REQUEST_FIELDS strictly matches backend contract')

// 3. Test formatAddressRequest & Exclusion of propertyId from request body
const rawUiInput = {
  propertyId: 101,
  addressId: 50,
  address: '420 Ocean Boulevard', // UI street address field
  addressLine2: 'Apt 4B',
  area: 'Westside',
  city: 'Santa Monica',
  state: 'California',
  country: 'USA',
  zipCode: '904010', // UI zipCode field
  latitude: '34.0195',
  longitude: '-118.4912',
  extraField: 'should be deleted',
  createdAt: '2026-09-08T00:00:00',
  updatedAt: '2026-09-08T00:00:00',
}

const cleanedPayload = formatAddressRequest(rawUiInput)

// Verify propertyId is strictly NOT in payload
assert.strictEqual(
  cleanedPayload.propertyId,
  undefined,
  'propertyId must NOT be present in request body'
)
assert.strictEqual(
  cleanedPayload.addressId,
  undefined,
  'addressId must NOT be present in request body'
)
assert.strictEqual(
  cleanedPayload.createdAt,
  undefined,
  'createdAt must NOT be present in request body'
)
assert.strictEqual(
  cleanedPayload.extraField,
  undefined,
  'Extra fields must NOT be present in request body'
)

// Verify mapping
assert.strictEqual(cleanedPayload.addressLine1, '420 Ocean Boulevard')
assert.strictEqual(cleanedPayload.addressLine2, 'Apt 4B')
assert.strictEqual(cleanedPayload.area, 'Westside')
assert.strictEqual(cleanedPayload.city, 'Santa Monica')
assert.strictEqual(cleanedPayload.state, 'California')
assert.strictEqual(cleanedPayload.country, 'USA')
assert.strictEqual(cleanedPayload.pincode, '904010')
assert.strictEqual(cleanedPayload.latitude, 34.0195)
assert.strictEqual(cleanedPayload.longitude, -118.4912)

// Verify only allowed fields exist in cleaned payload
for (const key of Object.keys(cleanedPayload)) {
  assert.ok(
    expectedFields.includes(key),
    `Field ${key} is not in ALLOWED_ADDRESS_REQUEST_FIELDS`
  )
}
console.log('✔ formatAddressRequest cleanly maps fields and strictly excludes propertyId & response metadata')

// 4. Test Mock / Fake address non-generation
const emptyFormatting = formatAddressRequest({})
assert.deepStrictEqual(
  emptyFormatting,
  {},
  'formatAddressRequest must NOT invent fake or default addresses'
)
console.log('✔ Verified no fake or default address is generated')

// 5. Static code inspection of PropertyDetailsPage.jsx
const detailsPageFile = path.join(projectRoot, 'src/pages/owner/PropertyDetailsPage.jsx')
const detailsPageCode = fs.readFileSync(detailsPageFile, 'utf-8')

assert.ok(
  detailsPageCode.includes("from '../../api/propertyAddressApi'"),
  'FAIL: PropertyDetailsPage.jsx must import from propertyAddressApi'
)
assert.ok(
  detailsPageCode.includes('getAddress'),
  'FAIL: PropertyDetailsPage.jsx must call getAddress'
)
assert.ok(
  detailsPageCode.includes('createAddress'),
  'FAIL: PropertyDetailsPage.jsx must call createAddress'
)
assert.ok(
  detailsPageCode.includes('updateAddress'),
  'FAIL: PropertyDetailsPage.jsx must call updateAddress'
)
assert.ok(
  detailsPageCode.includes('deleteAddress'),
  'FAIL: PropertyDetailsPage.jsx must call deleteAddress'
)
assert.ok(
  detailsPageCode.includes('isSubmittingAddress'),
  'FAIL: PropertyDetailsPage.jsx must guard against duplicate submissions via isSubmittingAddress'
)
assert.ok(
  detailsPageCode.includes('isDeletingAddress'),
  'FAIL: PropertyDetailsPage.jsx must guard against duplicate deletion via isDeletingAddress'
)
assert.ok(
  detailsPageCode.includes('window.confirm'),
  'FAIL: PropertyDetailsPage.jsx must prompt confirmation before deleting address'
)
assert.ok(
  detailsPageCode.includes("'Address not specified'"),
  'FAIL: PropertyDetailsPage.jsx must preserve Address not specified fallback'
)
console.log('✔ PropertyDetailsPage.jsx verified for all CRUD address operations & safeguards')

// 6. Verify propertyApi.js and PropertyRequest payloads remain untouched
const propertyApiFile = path.join(projectRoot, 'src/api/propertyApi.js')
const propertyApiCode = fs.readFileSync(propertyApiFile, 'utf-8')
assert.ok(
  !propertyApiCode.includes('createAddress'),
  'propertyApi.js must NOT be modified with address methods'
)
assert.ok(
  propertyApiCode.includes('formatPropertyRequest'),
  'propertyApi.js must preserve formatPropertyRequest'
)
console.log('✔ propertyApi.js remains untouched and separate from address logic')

console.log('\n======================================================')
console.log('ALL PHASE 4A PROPERTY ADDRESS TESTS PASSED! 🎉')
console.log('======================================================\n')
