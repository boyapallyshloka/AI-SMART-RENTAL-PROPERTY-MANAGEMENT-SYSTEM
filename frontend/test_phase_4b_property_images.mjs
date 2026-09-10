/**
 * Phase 4B Property Images Verification Suite
 */
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Setup Mock environment for Node.js before importing modules
class MockFormData {
  constructor() {
    this._entries = new Map()
  }
  append(key, value) {
    this._entries.set(key, value)
  }
  get(key) {
    return this._entries.get(key)
  }
  has(key) {
    return this._entries.has(key)
  }
  delete(key) {
    this._entries.delete(key)
  }
  entries() {
    return this._entries.entries()
  }
  keys() {
    return Array.from(this._entries.keys())
  }
}

globalThis.FormData = MockFormData
globalThis.window = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
}

async function runTests() {
  console.log('--- Starting Phase 4B Verification Tests ---')

  const propertyImageApiPath = path.resolve(
    __dirname,
    'src/api/propertyImageApi.js'
  )
  const propertyDetailsPagePath = path.resolve(
    __dirname,
    'src/pages/owner/PropertyDetailsPage.jsx'
  )
  const axiosClientPath = path.resolve(
    __dirname,
    'src/api/axiosClient.js'
  )

  const axiosClientModule = await import(`file://${axiosClientPath}`)
  const axiosClient = axiosClientModule.default

  const propertyImageApi = await import(`file://${propertyImageApiPath}`)

  let recordedCalls = []
  // Mock axiosClient methods
  axiosClient.get = async (url, config) => {
    recordedCalls.push({ method: 'GET', url, config })
    return { data: [] }
  }
  axiosClient.post = async (url, data, config) => {
    recordedCalls.push({ method: 'POST', url, data, config })
    return { data: { imageId: 101, imageUrl: 'https://storage.cloud/prop1.jpg' } }
  }
  axiosClient.put = async (url, data, config) => {
    recordedCalls.push({ method: 'PUT', url, data, config })
    return { data: { imageId: 101, isPrimary: true } }
  }
  axiosClient.delete = async (url, config) => {
    recordedCalls.push({ method: 'DELETE', url, config })
    return { data: { success: true } }
  }

  // TEST 1: buildImageFormData sanitization
  console.log('Testing buildImageFormData sanitization...')
  const messyInput = {
    file: 'fake-file-blob',
    imageType: 'GALLERY',
    isPrimary: true,
    propertyId: 999, // FORBIDDEN IN FORMDATA
    imageId: 123, // FORBIDDEN
    propertyName: 'Sunrise Villa', // FORBIDDEN
    createdAt: '2026-01-01', // FORBIDDEN
    updatedAt: '2026-01-02', // FORBIDDEN
    imageUrl: 'http://evil.com/fake.jpg', // FORBIDDEN
    ownerId: 42, // FORBIDDEN
    unrelatedField: 'random', // FORBIDDEN
  }

  const sanitizedFd = propertyImageApi.buildImageFormData(messyInput)
  assert.strictEqual(sanitizedFd.get('file'), 'fake-file-blob')
  assert.strictEqual(sanitizedFd.get('imageType'), 'GALLERY')
  assert.strictEqual(sanitizedFd.get('isPrimary'), true)
  assert.strictEqual(sanitizedFd.get('propertyId'), undefined, 'propertyId must NOT be in FormData')
  assert.strictEqual(sanitizedFd.get('imageId'), undefined, 'imageId must NOT be in FormData')
  assert.strictEqual(sanitizedFd.get('imageUrl'), undefined, 'imageUrl must NOT be in FormData')
  assert.strictEqual(sanitizedFd.get('ownerId'), undefined, 'ownerId must NOT be in FormData')
  assert.deepStrictEqual(sanitizedFd.keys().sort(), ['file', 'imageType', 'isPrimary'].sort())
  console.log('✓ buildImageFormData strictly limits fields to file, imageType, isPrimary')

  // TEST 2: GET /api/property-images/property/{propertyId}
  console.log('Testing getImagesByProperty...')
  recordedCalls = []
  await propertyImageApi.getImagesByProperty(42)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/property-images/property/42')
  console.log('✓ getImagesByProperty correctly requests GET /api/property-images/property/{propertyId}')

  // TEST 3: GET /api/property-images/{imageId}
  console.log('Testing getImageById...')
  recordedCalls = []
  await propertyImageApi.getImageById(101)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/property-images/101')
  console.log('✓ getImageById correctly requests GET /api/property-images/{imageId}')

  // TEST 4: POST /api/property-images/{propertyId}
  console.log('Testing uploadImage...')
  recordedCalls = []
  await propertyImageApi.uploadImage(55, messyInput)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'POST')
  assert.strictEqual(recordedCalls[0].url, '/property-images/55')
  const uploadedFd = recordedCalls[0].data
  assert.strictEqual(uploadedFd.get('file'), 'fake-file-blob')
  assert.strictEqual(uploadedFd.get('imageType'), 'GALLERY')
  assert.strictEqual(uploadedFd.get('isPrimary'), true)
  assert.strictEqual(uploadedFd.get('propertyId'), undefined, 'propertyId must NOT be in POST FormData')
  // Verify Content-Type is NOT manually overridden in headers
  assert.ok(
    !recordedCalls[0].config?.headers?.['Content-Type'],
    'Content-Type must not be manually forced to allow browser boundary calculation'
  )
  console.log('✓ uploadImage correctly requests POST /api/property-images/{propertyId} with sanitized FormData')

  // TEST 5: PUT /api/property-images/{imageId}
  console.log('Testing updateImage...')
  recordedCalls = []
  await propertyImageApi.updateImage(101, {
    isPrimary: true,
    imageType: 'COVER',
    propertyId: 55,
  })
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/property-images/101')
  const updatedFd = recordedCalls[0].data
  assert.strictEqual(updatedFd.get('isPrimary'), true)
  assert.strictEqual(updatedFd.get('imageType'), 'COVER')
  assert.strictEqual(updatedFd.get('propertyId'), undefined, 'propertyId must NOT be in PUT FormData')
  console.log('✓ updateImage correctly requests PUT /api/property-images/{imageId} with sanitized FormData')

  // TEST 6: DELETE /api/property-images/{imageId}
  console.log('Testing deleteImage...')
  recordedCalls = []
  await propertyImageApi.deleteImage(101)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'DELETE')
  assert.strictEqual(recordedCalls[0].url, '/property-images/101')
  console.log('✓ deleteImage correctly requests DELETE /api/property-images/{imageId}')

  // TEST 7: Inspect PropertyDetailsPage.jsx source code
  console.log('Inspecting PropertyDetailsPage.jsx for image integration & no fake URLs...')
  const detailsSource = fs.readFileSync(propertyDetailsPagePath, 'utf8')

  assert.ok(
    detailsSource.includes('getImagesByProperty'),
    'PropertyDetailsPage must import and call getImagesByProperty'
  )
  assert.ok(
    detailsSource.includes('uploadImage'),
    'PropertyDetailsPage must import and call uploadImage'
  )
  assert.ok(
    detailsSource.includes('updateImage'),
    'PropertyDetailsPage must import and call updateImage'
  )
  assert.ok(
    detailsSource.includes('deleteImage'),
    'PropertyDetailsPage must import and call deleteImage'
  )
  assert.ok(
    !detailsSource.includes('SAMPLE_PROPERTY_IMAGES'),
    'PropertyDetailsPage must not use SAMPLE_PROPERTY_IMAGES'
  )
  assert.ok(
    detailsSource.includes('propertyImages.length > 0'),
    'PropertyDetailsPage must check propertyImages length for empty state'
  )
  assert.ok(
    detailsSource.includes('No Photos Uploaded Yet'),
    'PropertyDetailsPage must render empty-state UI when no images exist'
  )
  assert.ok(
    detailsSource.includes('window.confirm'),
    'PropertyDetailsPage must preserve confirmation for deletion'
  )

  console.log('✓ PropertyDetailsPage.jsx cleanly integrates propertyImageApi with no fake image URLs')

  console.log('\nAll Phase 4B tests PASSED successfully!')
}

runTests().catch((err) => {
  console.error('Test Failed:', err)
  process.exit(1)
})
