import assert from 'node:assert';

// Mock localStorage
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

import axiosClient from 'file:///C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/api/axiosClient.js';
import * as propertyApi from 'file:///C:/Users/boyap/OneDrive/Desktop/Homeshpere/frontend/src/api/propertyApi.js';

console.log('--- 1. Testing Enums Contract ---');
assert.deepStrictEqual(propertyApi.PROPERTY_TYPES, {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  VILLA: 'VILLA',
  PG: 'PG',
  HOSTEL: 'HOSTEL',
  COMMERCIAL: 'COMMERCIAL',
});
console.log('✔ PROPERTY_TYPES enums verified');

assert.deepStrictEqual(propertyApi.FURNISHING_STATUSES, {
  UNFURNISHED: 'UNFURNISHED',
  SEMI_FURNISHED: 'SEMI_FURNISHED',
  FULLY_FURNISHED: 'FULLY_FURNISHED',
});
console.log('✔ FURNISHING_STATUSES enums verified');

assert.deepStrictEqual(propertyApi.PROPERTY_STATUSES, {
  DRAFT: 'DRAFT',
  AVAILABLE: 'AVAILABLE',
  PUBLISHED: 'PUBLISHED',
  OCCUPIED: 'OCCUPIED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  INACTIVE: 'INACTIVE',
});
console.log('✔ PROPERTY_STATUSES enums verified');

console.log('\n--- 2. Testing formatPropertyRequest & ownerId omission ---');
const sampleInput = {
  ownerId: 999, // Should be omitted!
  propertyName: '  Skyline Residences  ',
  propertyType: propertyApi.PROPERTY_TYPES.APARTMENT,
  description: 'Luxury high-rise apartment',
  totalArea: '1250.5',
  bedrooms: '3',
  bathrooms: '2',
  furnishingStatus: propertyApi.FURNISHING_STATUSES.FULLY_FURNISHED,
  parkingAvailable: true,
  monthlyRent: '45000',
  securityDeposit: '90000',
};

const formatted = propertyApi.formatPropertyRequest(sampleInput);
assert.strictEqual(formatted.ownerId, undefined, 'ownerId must NOT be included in PropertyRequest');
assert.strictEqual(formatted.propertyName, 'Skyline Residences');
assert.strictEqual(formatted.propertyType, 'APARTMENT');
assert.strictEqual(formatted.description, 'Luxury high-rise apartment');
assert.strictEqual(formatted.totalArea, 1250.5);
assert.strictEqual(formatted.bedrooms, 3);
assert.strictEqual(formatted.bathrooms, 2);
assert.strictEqual(formatted.furnishingStatus, 'FULLY_FURNISHED');
assert.strictEqual(formatted.parkingAvailable, true);
assert.strictEqual(formatted.monthlyRent, 45000);
assert.strictEqual(formatted.securityDeposit, 90000);
console.log('✔ formatPropertyRequest produces clean DTO and strictly omits ownerId');

console.log('\n--- 3. Testing Endpoint Verbs, Paths & Payloads ---');
let lastCall = null;
const originalGet = axiosClient.get;
const originalPost = axiosClient.post;
const originalPut = axiosClient.put;
const originalDelete = axiosClient.delete;

axiosClient.get = async (url, config) => { lastCall = { method: 'GET', url, config }; return { success: true }; };
axiosClient.post = async (url, data, config) => { lastCall = { method: 'POST', url, data, config }; return { success: true }; };
axiosClient.put = async (url, data, config) => { lastCall = { method: 'PUT', url, data, config }; return { success: true }; };
axiosClient.delete = async (url, config) => { lastCall = { method: 'DELETE', url, config }; return { success: true }; };

// GET /api/owner/properties
await propertyApi.getMyProperties();
assert.strictEqual(lastCall.method, 'GET');
assert.strictEqual(lastCall.url, '/owner/properties');
console.log('✔ GET /api/owner/properties verified');

// GET /api/owner/properties/{id}
await propertyApi.getPropertyById(45);
assert.strictEqual(lastCall.method, 'GET');
assert.strictEqual(lastCall.url, '/owner/properties/45');
console.log('✔ GET /api/owner/properties/{id} verified');

// POST /api/owner/properties
await propertyApi.createProperty(sampleInput);
assert.strictEqual(lastCall.method, 'POST');
assert.strictEqual(lastCall.url, '/owner/properties');
assert.strictEqual(lastCall.data.ownerId, undefined, 'ownerId must NOT be in POST payload');
assert.strictEqual(lastCall.data.propertyName, 'Skyline Residences');
assert.strictEqual(lastCall.data.monthlyRent, 45000);
console.log('✔ POST /api/owner/properties verified with formatted payload');

// PUT /api/owner/properties/{id}
await propertyApi.updateProperty(45, { ...sampleInput, propertyName: 'Updated Skyline' });
assert.strictEqual(lastCall.method, 'PUT');
assert.strictEqual(lastCall.url, '/owner/properties/45');
assert.strictEqual(lastCall.data.ownerId, undefined, 'ownerId must NOT be in PUT payload');
assert.strictEqual(lastCall.data.propertyName, 'Updated Skyline');
console.log('✔ PUT /api/owner/properties/{id} verified with formatted payload');

// DELETE /api/owner/properties/{id}
await propertyApi.deleteProperty(45);
assert.strictEqual(lastCall.method, 'DELETE');
assert.strictEqual(lastCall.url, '/owner/properties/45');
console.log('✔ DELETE /api/owner/properties/{id} verified');

// PUT /api/owner/properties/{id}/status?status={status}
await propertyApi.updatePropertyStatus(45, propertyApi.PROPERTY_STATUSES.OCCUPIED);
assert.strictEqual(lastCall.method, 'PUT');
assert.strictEqual(lastCall.url, '/owner/properties/45/status');
assert.strictEqual(lastCall.config.params.status, 'OCCUPIED');
console.log('✔ PUT /api/owner/properties/{id}/status?status={status} verified');

// Restore axiosClient methods
axiosClient.get = originalGet;
axiosClient.post = originalPost;
axiosClient.put = originalPut;
axiosClient.delete = originalDelete;

console.log('\n--- 4. Testing Preserved UI Compatibility Helper ---');
const mockProps = await propertyApi.getProperties();
assert.ok(Array.isArray(mockProps), 'getProperties must return array for existing UI pages');
assert.ok(mockProps.length > 0, 'getProperties must return mock properties');
console.log('✔ UI compatibility fallback getProperties() functions as expected');

console.log('\n======================================================');
console.log('ALL PHASE 3A PROPERTY API CONTRACT TESTS PASSED! 🎉');
console.log('======================================================');
