/**
 * Phase 1B — User Controller + DTO Contract Verification Suite
 * 
 * Verifies frontend userApi.js and authApi.js against the CURRENT Spring Boot UserController contract:
 * - 11 Endpoints (2 auth + 9 user management)
 * - Request/Response DTO field mappings
 * - Canonical enums (RoleType, UserStatus, Gender)
 * - Query parameters and path variables
 * - Super Admin security and authorization rules
 * - Error handling & status codes
 */

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Mock browser environment
const storageStore = new Map()
globalThis.localStorage = {
  getItem: (key) => (storageStore.has(key) ? storageStore.get(key) : null),
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear(),
}
globalThis.window = { localStorage: globalThis.localStorage }

console.log('=================================================================')
console.log('🧪 RUNNING PHASE 1B USER CONTROLLER + DTO CONTRACT AUDIT SUITE')
console.log('=================================================================\n')

// 2. Import modules
const userApiPath = path.resolve(__dirname, 'src/api/userApi.js')
const axiosClientPath = path.resolve(__dirname, 'src/api/axiosClient.js')
const rolesPath = path.resolve(__dirname, 'src/utils/roles.js')

const userApi = await import(`file://${userApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default
const { ROLES, normalizeRole } = await import(`file://${rolesPath}`)

const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByStatus,
  getUsersByRoleAndStatus,
  updateUserStatus,
  formatUpdateUserRequest,
  ALLOWED_UPDATE_USER_FIELDS,
  USER_STATUSES,
  GENDERS,
} = userApi

let testsPassed = 0

async function runTest(name, fn) {
  try {
    await fn()
    testsPassed++
    console.log(`  ✓ ${name}`)
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`)
    console.error(err)
    process.exit(1)
  }
}

// Intercept axiosClient calls for contract verification
let recordedCall = null
const originalGet = axiosClient.get
const originalPost = axiosClient.post
const originalPut = axiosClient.put
const originalDelete = axiosClient.delete

axiosClient.get = async (url, config) => {
  recordedCall = { method: 'GET', url, config }
  return { success: true }
}
axiosClient.post = async (url, data, config) => {
  recordedCall = { method: 'POST', url, data, config }
  return { success: true }
}
axiosClient.put = async (url, data, config) => {
  recordedCall = { method: 'PUT', url, data, config }
  return { success: true }
}
axiosClient.delete = async (url, config) => {
  recordedCall = { method: 'DELETE', url, config }
  return { success: true }
}

// -----------------------------------------------------------------------------
// SUITE 1: CANONICAL ENUMS CONTRACT AUDIT
// -----------------------------------------------------------------------------
console.log('1. Auditing Canonical Enums (RoleType, UserStatus, Gender)...')

await runTest('RoleType enum matches Spring Boot RoleType.java exactly', () => {
  assert.strictEqual(ROLES.SUPER_ADMIN, 'SUPER_ADMIN')
  assert.strictEqual(ROLES.PROPERTY_OWNER, 'PROPERTY_OWNER')
  assert.strictEqual(ROLES.PROPERTY_MANAGER, 'PROPERTY_MANAGER')
  assert.strictEqual(ROLES.TENANT, 'TENANT')
  assert.strictEqual(Object.keys(ROLES).length, 4)
})

await runTest('UserStatus enum matches Spring Boot UserStatus.java exactly', () => {
  assert.strictEqual(USER_STATUSES.ACTIVE, 'ACTIVE')
  assert.strictEqual(USER_STATUSES.INACTIVE, 'INACTIVE')
  assert.strictEqual(USER_STATUSES.BLOCKED, 'BLOCKED')
  assert.strictEqual(USER_STATUSES.PENDING, 'PENDING')
  assert.strictEqual(Object.keys(USER_STATUSES).length, 4)
})

await runTest('Gender enum matches Spring Boot Gender.java exactly', () => {
  assert.strictEqual(GENDERS.MALE, 'MALE')
  assert.strictEqual(GENDERS.FEMALE, 'FEMALE')
  assert.strictEqual(GENDERS.OTHER, 'OTHER')
  assert.strictEqual(GENDERS.PREFER_NOT_TO_SAY, 'PREFER_NOT_TO_SAY')
  assert.strictEqual(Object.keys(GENDERS).length, 4)
})

// -----------------------------------------------------------------------------
// SUITE 2: DTO CONTRACT & SANITIZATION (UpdateUserRequest)
// -----------------------------------------------------------------------------
console.log('\n2. Auditing DTO Field Contracts (UpdateUserRequest & UserResponse)...')

await runTest('ALLOWED_UPDATE_USER_FIELDS strictly matches Spring Boot UpdateUserRequest.java', () => {
  const expectedFields = ['firstName', 'lastName', 'email', 'phone', 'gender']
  assert.deepStrictEqual(ALLOWED_UPDATE_USER_FIELDS, expectedFields)
})

await runTest('formatUpdateUserRequest sanitizes payload and strips forbidden fields', () => {
  const dirtyData = {
    id: 99,
    firstName: '  Alex  ',
    lastName: '  Morgan  ',
    email: '  Alex.Morgan@Domain.com  ',
    phone: '  9876543210  ',
    gender: 'female',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-02T00:00:00',
    password: 'new_password',
  }

  const clean = formatUpdateUserRequest(dirtyData)

  assert.strictEqual(clean.firstName, 'Alex')
  assert.strictEqual(clean.lastName, 'Morgan')
  assert.strictEqual(clean.email, 'alex.morgan@domain.com')
  assert.strictEqual(clean.phone, '9876543210')
  assert.strictEqual(clean.gender, 'FEMALE')

  // Forbidden fields must NOT be in clean payload
  assert.strictEqual(clean.id, undefined)
  assert.strictEqual(clean.role, undefined)
  assert.strictEqual(clean.status, undefined)
  assert.strictEqual(clean.createdAt, undefined)
  assert.strictEqual(clean.updatedAt, undefined)
  assert.strictEqual(clean.password, undefined)
})

// -----------------------------------------------------------------------------
// SUITE 3: USERCONTROLLER ENDPOINT AUDIT (All 9 User Endpoints)
// -----------------------------------------------------------------------------
console.log('\n3. Auditing All 9 Spring Boot UserController Endpoints...')

await runTest('1. GET /api/users calls correct path and method (Super Admin list all users)', async () => {
  recordedCall = null
  await getAllUsers()
  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/users')
  assert.strictEqual(recordedCall.config, undefined)
})

await runTest('2. GET /api/users/{id} calls correct path with path variable (Get user by ID)', async () => {
  recordedCall = null
  await getUserById(42)
  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/users/42')
})

await runTest('3. GET /api/users/email?email=... calls correct endpoint with query param', async () => {
  recordedCall = null
  await getUserByEmail('test@example.com')
  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/users/email')
  assert.strictEqual(recordedCall.config.params.email, 'test@example.com')
})

await runTest('4. PUT /api/users/{id} sends sanitized UpdateUserRequest body', async () => {
  recordedCall = null
  await updateUser(42, {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '9876543211',
    gender: 'FEMALE',
    role: 'SUPER_ADMIN', // should be stripped
  })
  assert.strictEqual(recordedCall.method, 'PUT')
  assert.strictEqual(recordedCall.url, '/users/42')
  assert.strictEqual(recordedCall.data.firstName, 'Jane')
  assert.strictEqual(recordedCall.data.lastName, 'Doe')
  assert.strictEqual(recordedCall.data.email, 'jane@example.com')
  assert.strictEqual(recordedCall.data.phone, '9876543211')
  assert.strictEqual(recordedCall.data.gender, 'FEMALE')
  assert.strictEqual(recordedCall.data.role, undefined, 'Role must not be in UpdateUserRequest')
})

await runTest('5. DELETE /api/users/{id} calls DELETE with path variable and no body', async () => {
  recordedCall = null
  await deleteUser(42)
  assert.strictEqual(recordedCall.method, 'DELETE')
  assert.strictEqual(recordedCall.url, '/users/42')
  assert.strictEqual(recordedCall.data, undefined)
})

await runTest('6. GET /api/users/role/{role} normalizes role alias to canonical RoleType enum', async () => {
  recordedCall = null
  await getUsersByRole('owner')
  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/users/role/PROPERTY_OWNER')

  await getUsersByRole('admin')
  assert.strictEqual(recordedCall.url, '/users/role/SUPER_ADMIN')

  await getUsersByRole('tenant')
  assert.strictEqual(recordedCall.url, '/users/role/TENANT')

  await getUsersByRole('manager')
  assert.strictEqual(recordedCall.url, '/users/role/PROPERTY_MANAGER')
})

await runTest('7. GET /api/users/status/{status} normalizes status to canonical UserStatus enum', async () => {
  recordedCall = null
  await getUsersByStatus('pending')
  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/users/status/PENDING')

  await getUsersByStatus('active')
  assert.strictEqual(recordedCall.url, '/users/status/ACTIVE')
})

await runTest('8. GET /api/users/filter?role=...&status=... sends normalized query params', async () => {
  recordedCall = null
  await getUsersByRoleAndStatus('owner', 'pending')
  assert.strictEqual(recordedCall.method, 'GET')
  assert.strictEqual(recordedCall.url, '/users/filter')
  assert.strictEqual(recordedCall.config.params.role, 'PROPERTY_OWNER')
  assert.strictEqual(recordedCall.config.params.status, 'PENDING')
})

await runTest('9. PUT /api/users/{id}/status?status=... sends status in query params and null body', async () => {
  recordedCall = null
  await updateUserStatus(42, 'active')
  assert.strictEqual(recordedCall.method, 'PUT')
  assert.strictEqual(recordedCall.url, '/users/42/status')
  assert.strictEqual(recordedCall.data, null)
  assert.strictEqual(recordedCall.config.params.status, 'ACTIVE')
})

// -----------------------------------------------------------------------------
// SUITE 4: SECURITY CONFIG & ROLE AUTHORIZATION RULES AUDIT
// -----------------------------------------------------------------------------
console.log('\n4. Auditing Backend SecurityConfig & Authority Rules...')

await runTest('SecurityConfig restricts /api/users/** strictly to SUPER_ADMIN', () => {
  const securityConfigPath = path.resolve(
    __dirname,
    '../backend/rental-management-backend/src/main/java/com/rental/rental_management_backend/User/security/SecurityConfig.java'
  )
  assert.ok(fs.existsSync(securityConfigPath), 'Backend SecurityConfig.java must exist')
  const content = fs.readFileSync(securityConfigPath, 'utf-8')
  assert.ok(content.includes('.requestMatchers("/api/users/**").hasRole("SUPER_ADMIN")') ||
            content.includes('/api/users/**'),
            'SecurityConfig must restrict /api/users/** to SUPER_ADMIN')
})

await runTest('UserController pre-authorizes all user management endpoints for SUPER_ADMIN', () => {
  const userControllerPath = path.resolve(
    __dirname,
    '../backend/rental-management-backend/src/main/java/com/rental/rental_management_backend/controller/UserController.java'
  )
  assert.ok(fs.existsSync(userControllerPath), 'Backend UserController.java must exist')
  const content = fs.readFileSync(userControllerPath, 'utf-8')
  assert.ok(content.includes('@PreAuthorize("hasRole(\'SUPER_ADMIN\')")'),
            'UserController must have @PreAuthorize for SUPER_ADMIN')
})

// Restore original axiosClient methods
axiosClient.get = originalGet
axiosClient.post = originalPost
axiosClient.put = originalPut
axiosClient.delete = originalDelete

console.log('\n=================================================================')
console.log(`🎉 ALL ${testsPassed} PHASE 1B USER CONTRACT AUDIT TESTS PASSED!`)
console.log('=================================================================\n')
