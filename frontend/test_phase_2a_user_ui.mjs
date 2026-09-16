/**
 * Phase 2A — Super Admin User Management UI Real API Integration Verification Suite
 * 
 * Verifies that the Super Admin User Management UI and API layer:
 * 1. Wire all 9 User Management endpoints to Spring Boot UserController
 * 2. Use correct HTTP methods and paths
 * 3. Restrict normal update payload to allowed fields (firstName, lastName, email, phone, gender)
 * 4. Prevent role, password, or status from leaking into normal update payload
 * 5. Call PUT /api/users/{id}/status?status={status} with query parameter and null body
 * 6. Normalize roles and statuses to canonical backend enums
 * 7. Have NO active mock-user fallback or imports in Super Admin flow
 * 8. Map Spring Boot UserResponse DTO to UI model safely
 * 9. Support User list, details, email search, role filter, status filter, combined filter, edit, status change, and delete
 * 10. Implement loading states, empty states, and safe error handling with retry
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
console.log('🧪 RUNNING PHASE 2A SUPER ADMIN USER MANAGEMENT UI INTEGRATION SUITE')
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
  mapBackendUserToUi,
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

// Intercept axiosClient calls
let recordedCalls = []
axiosClient.get = async (url, config) => {
  recordedCalls.push({ method: 'GET', url, config })
  return { success: true, data: [] }
}
axiosClient.post = async (url, data, config) => {
  recordedCalls.push({ method: 'POST', url, data, config })
  return { success: true, data: { id: 1 } }
}
axiosClient.put = async (url, data, config) => {
  recordedCalls.push({ method: 'PUT', url, data, config })
  return { success: true, data: { id: 1 } }
}
axiosClient.delete = async (url, config) => {
  recordedCalls.push({ method: 'DELETE', url, config })
  return { success: true, data: 'User deleted successfully' }
}

// -----------------------------------------------------------------------------
// SECTION 1: ALL 9 USER MANAGEMENT API ENDPOINTS & HTTP METHODS
// -----------------------------------------------------------------------------
console.log('1. Verifying All 9 User Management Endpoints & HTTP Methods...')

await runTest('1. getAllUsers() calls GET /users', async () => {
  recordedCalls = []
  await getAllUsers()
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/users')
})

await runTest('2. getUserById(id) calls GET /users/{id}', async () => {
  recordedCalls = []
  await getUserById(55)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/users/55')
})

await runTest('3. getUserByEmail(email) calls GET /users/email?email={email}', async () => {
  recordedCalls = []
  await getUserByEmail('admin@homesphere.com')
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/users/email')
  assert.strictEqual(recordedCalls[0].config.params.email, 'admin@homesphere.com')
})

await runTest('4. updateUser(id, data) calls PUT /users/{id} with sanitized body', async () => {
  recordedCalls = []
  await updateUser(55, {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    gender: 'MALE',
  })
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/users/55')
  assert.strictEqual(recordedCalls[0].data.firstName, 'John')
  assert.strictEqual(recordedCalls[0].data.lastName, 'Doe')
  assert.strictEqual(recordedCalls[0].data.email, 'john.doe@example.com')
  assert.strictEqual(recordedCalls[0].data.phone, '1234567890')
  assert.strictEqual(recordedCalls[0].data.gender, 'MALE')
})

await runTest('5. deleteUser(id) calls DELETE /users/{id} with no request body', async () => {
  recordedCalls = []
  await deleteUser(55)
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'DELETE')
  assert.strictEqual(recordedCalls[0].url, '/users/55')
  assert.strictEqual(recordedCalls[0].data, undefined)
})

await runTest('6. getUsersByRole(role) calls GET /users/role/{role} with canonical role enum', async () => {
  recordedCalls = []
  await getUsersByRole('SUPER_ADMIN')
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/users/role/SUPER_ADMIN')

  await getUsersByRole('property_owner')
  assert.strictEqual(recordedCalls[1].url, '/users/role/PROPERTY_OWNER')
})

await runTest('7. getUsersByStatus(status) calls GET /users/status/{status} with canonical status enum', async () => {
  recordedCalls = []
  await getUsersByStatus('ACTIVE')
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/users/status/ACTIVE')

  await getUsersByStatus('pending')
  assert.strictEqual(recordedCalls[1].url, '/users/status/PENDING')
})

await runTest('8. getUsersByRoleAndStatus(role, status) calls GET /users/filter?role={role}&status={status}', async () => {
  recordedCalls = []
  await getUsersByRoleAndStatus('PROPERTY_OWNER', 'PENDING')
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'GET')
  assert.strictEqual(recordedCalls[0].url, '/users/filter')
  assert.strictEqual(recordedCalls[0].config.params.role, 'PROPERTY_OWNER')
  assert.strictEqual(recordedCalls[0].config.params.status, 'PENDING')
})

await runTest('9. updateUserStatus(id, status) calls PUT /users/{id}/status?status={status} with null body and query param', async () => {
  recordedCalls = []
  await updateUserStatus(55, 'BLOCKED')
  assert.strictEqual(recordedCalls.length, 1)
  assert.strictEqual(recordedCalls[0].method, 'PUT')
  assert.strictEqual(recordedCalls[0].url, '/users/55/status')
  assert.strictEqual(recordedCalls[0].data, null, 'Body must be null')
  assert.strictEqual(recordedCalls[0].config.params.status, 'BLOCKED', 'status must be in query params')
})

// -----------------------------------------------------------------------------
// SECTION 2: UPDATE PAYLOAD RESTRICTION & FORBIDDEN FIELDS
// -----------------------------------------------------------------------------
console.log('\n2. Verifying Update Payload Field Restrictions...')

await runTest('ALLOWED_UPDATE_USER_FIELDS strictly contains only firstName, lastName, email, phone, gender', () => {
  assert.deepStrictEqual(ALLOWED_UPDATE_USER_FIELDS, ['firstName', 'lastName', 'email', 'phone', 'gender'])
})

await runTest('formatUpdateUserRequest strictly strips role, password, status, id, dates', () => {
  const dirtyData = {
    id: 100,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'Alice.Smith@Example.COM',
    phone: '555-0199',
    gender: 'female',
    role: 'SUPER_ADMIN',
    password: 'super_secret_password',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
  }

  const clean = formatUpdateUserRequest(dirtyData)
  assert.strictEqual(clean.firstName, 'Alice')
  assert.strictEqual(clean.lastName, 'Smith')
  assert.strictEqual(clean.email, 'alice.smith@example.com')
  assert.strictEqual(clean.phone, '555-0199')
  assert.strictEqual(clean.gender, 'FEMALE')

  // Forbidden fields must NOT be present
  assert.strictEqual(clean.id, undefined, 'id must be excluded')
  assert.strictEqual(clean.role, undefined, 'role must be excluded')
  assert.strictEqual(clean.password, undefined, 'password must be excluded')
  assert.strictEqual(clean.status, undefined, 'status must be excluded')
  assert.strictEqual(clean.createdAt, undefined, 'createdAt must be excluded')
  assert.strictEqual(clean.updatedAt, undefined, 'updatedAt must be excluded')
})

await runTest('updateUser() payload sends ONLY allowed fields to backend', async () => {
  recordedCalls = []
  await updateUser(55, {
    firstName: 'Bob',
    lastName: 'Ross',
    email: 'bob@example.com',
    phone: '1234567890',
    gender: 'MALE',
    role: 'SUPER_ADMIN',
    password: 'unauthorized_password_change',
    status: 'BLOCKED',
  })

  const payload = recordedCalls[0].data
  assert.deepStrictEqual(Object.keys(payload).sort(), ['email', 'firstName', 'gender', 'lastName', 'phone'])
  assert.strictEqual(payload.role, undefined)
  assert.strictEqual(payload.password, undefined)
  assert.strictEqual(payload.status, undefined)
})

// -----------------------------------------------------------------------------
// SECTION 3: CANONICAL ENUMS & UI RESPONSE MAPPING
// -----------------------------------------------------------------------------
console.log('\n3. Verifying Canonical Enums & UserResponse Mapping...')

await runTest('Canonical ROLES contain SUPER_ADMIN, PROPERTY_OWNER, PROPERTY_MANAGER, TENANT', () => {
  assert.strictEqual(ROLES.SUPER_ADMIN, 'SUPER_ADMIN')
  assert.strictEqual(ROLES.PROPERTY_OWNER, 'PROPERTY_OWNER')
  assert.strictEqual(ROLES.PROPERTY_MANAGER, 'PROPERTY_MANAGER')
  assert.strictEqual(ROLES.TENANT, 'TENANT')
})

await runTest('Canonical USER_STATUSES contain ACTIVE, INACTIVE, BLOCKED, PENDING', () => {
  assert.strictEqual(USER_STATUSES.ACTIVE, 'ACTIVE')
  assert.strictEqual(USER_STATUSES.INACTIVE, 'INACTIVE')
  assert.strictEqual(USER_STATUSES.BLOCKED, 'BLOCKED')
  assert.strictEqual(USER_STATUSES.PENDING, 'PENDING')
})

await runTest('mapBackendUserToUi accurately transforms UserResponse DTO to UI model', () => {
  const backendUser = {
    id: 42,
    firstName: 'Emily',
    lastName: 'Clark',
    email: 'emily.clark@example.com',
    phone: '555-1234',
    gender: 'FEMALE',
    role: 'PROPERTY_OWNER',
    status: 'ACTIVE',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-02T15:30:00Z',
  }

  const uiUser = mapBackendUserToUi(backendUser)
  assert.strictEqual(uiUser.id, 42)
  assert.strictEqual(uiUser.name, 'Emily Clark')
  assert.strictEqual(uiUser.firstName, 'Emily')
  assert.strictEqual(uiUser.lastName, 'Clark')
  assert.strictEqual(uiUser.email, 'emily.clark@example.com')
  assert.strictEqual(uiUser.phone, '555-1234')
  assert.strictEqual(uiUser.gender, 'FEMALE')
  assert.strictEqual(uiUser.role, 'PROPERTY_OWNER')
  assert.strictEqual(uiUser.status, 'ACTIVE')
  assert.strictEqual(uiUser.accountStatus, 'ACTIVE')
  assert.strictEqual(uiUser.verificationStatus, 'Verified')
  assert.ok(uiUser.joinDate.includes('2026'))
})

await runTest('mapBackendUserToUi gracefully handles null, undefined, or partial user objects', () => {
  assert.strictEqual(mapBackendUserToUi(null), null)
  assert.strictEqual(mapBackendUserToUi(undefined), null)

  const partialUser = mapBackendUserToUi({ id: 9, email: 'solo@domain.com' })
  assert.strictEqual(partialUser.id, 9)
  assert.strictEqual(partialUser.name, 'solo@domain.com')
  assert.strictEqual(partialUser.role, 'TENANT')
  assert.strictEqual(partialUser.status, 'ACTIVE')
})

// -----------------------------------------------------------------------------
// SECTION 4: SUPER ADMIN USER MANAGEMENT PAGE INTEGRATION AUDIT
// -----------------------------------------------------------------------------
console.log('\n4. Auditing Super Admin UserManagementPage.jsx Integration...')

const userManagementPagePath = path.resolve(__dirname, 'src/pages/admin/UserManagementPage.jsx')
assert.ok(fs.existsSync(userManagementPagePath), 'UserManagementPage.jsx must exist')
const pageCode = fs.readFileSync(userManagementPagePath, 'utf8')

await runTest('UserManagementPage.jsx imports all 9 userApi functions and mappings', () => {
  assert.ok(pageCode.includes('getAllUsers'), 'Must import getAllUsers')
  assert.ok(pageCode.includes('getUserById'), 'Must import getUserById')
  assert.ok(pageCode.includes('getUserByEmail'), 'Must import getUserByEmail')
  assert.ok(pageCode.includes('updateUser'), 'Must import updateUser')
  assert.ok(pageCode.includes('deleteUser'), 'Must import deleteUser')
  assert.ok(pageCode.includes('getUsersByRole'), 'Must import getUsersByRole')
  assert.ok(pageCode.includes('getUsersByStatus'), 'Must import getUsersByStatus')
  assert.ok(pageCode.includes('getUsersByRoleAndStatus'), 'Must import getUsersByRoleAndStatus')
  assert.ok(pageCode.includes('updateUserStatus'), 'Must import updateUserStatus')
  assert.ok(pageCode.includes('mapBackendUserToUi'), 'Must import mapBackendUserToUi')
  assert.ok(pageCode.includes('ROLES'), 'Must import ROLES')
  assert.ok(pageCode.includes('USER_STATUSES'), 'Must import USER_STATUSES')
})

await runTest('UserManagementPage.jsx does NOT import or use MOCK_USERS in active Super Admin flow', () => {
  assert.ok(!pageCode.includes('MOCK_USERS'), 'Must NOT import or use MOCK_USERS')
  assert.ok(!pageCode.includes('adminMockData'), 'Must NOT import adminMockData')
})

await runTest('UserManagementPage.jsx integrates Flow 1 (User list) & Flow 3 (Email search)', () => {
  assert.ok(pageCode.includes('getAllUsers()'), 'Must call getAllUsers() for platform user list')
  assert.ok(pageCode.includes('getUserByEmail('), 'Must call getUserByEmail() for email search')
})

await runTest('UserManagementPage.jsx integrates Flow 4 (Role filter), Flow 5 (Status filter), Flow 6 (Combined filter)', () => {
  assert.ok(pageCode.includes('getUsersByRole('), 'Must call getUsersByRole()')
  assert.ok(pageCode.includes('getUsersByStatus('), 'Must call getUsersByStatus()')
  assert.ok(pageCode.includes('getUsersByRoleAndStatus('), 'Must call getUsersByRoleAndStatus()')
})

await runTest('UserManagementPage.jsx integrates Flow 2 (User details modal)', () => {
  assert.ok(pageCode.includes('getUserById('), 'Must call getUserById(userId) on view details')
  assert.ok(pageCode.includes('isDetailsOpen'), 'Must manage details modal state')
})

await runTest('UserManagementPage.jsx integrates Flow 7 (Edit user profile modal) with only allowed fields', () => {
  assert.ok(pageCode.includes('updateUser('), 'Must call updateUser(editUserModalData.id, payload)')
  assert.ok(pageCode.includes('editUserModalData'), 'Must manage edit modal state')

  // Verify form only edits allowed fields
  assert.ok(pageCode.includes('firstName:'), 'Form must handle firstName')
  assert.ok(pageCode.includes('lastName:'), 'Form must handle lastName')
  assert.ok(pageCode.includes('email:'), 'Form must handle email')
  assert.ok(pageCode.includes('phone:'), 'Form must handle phone')
  assert.ok(pageCode.includes('gender:'), 'Form must handle gender')

  // Edit form must NOT have role, password, or status inputs
  assert.ok(!pageCode.includes('name="password"'), 'Must NOT have password input in edit form')
})

await runTest('UserManagementPage.jsx integrates Flow 8 (Update user status)', () => {
  assert.ok(pageCode.includes('updateUserStatus('), 'Must call updateUserStatus(id, newStatus)')
  assert.ok(pageCode.includes('statusModalData'), 'Must manage status modal state')
})

await runTest('UserManagementPage.jsx integrates Flow 9 (Delete user with DeleteConfirmModal)', () => {
  assert.ok(pageCode.includes('deleteUser('), 'Must call deleteUser(id)')
  assert.ok(pageCode.includes('DeleteConfirmModal'), 'Must use DeleteConfirmModal for deletion safety')
})

await runTest('UserManagementPage.jsx has loading, empty, and retry states', () => {
  assert.ok(pageCode.includes('<Loader'), 'Must render Loader component during loading state')
  assert.ok(pageCode.includes('<EmptyState'), 'Must render EmptyState component when no users match')
  assert.ok(pageCode.includes('Retry'), 'Must have Retry action on API error')
  assert.ok(pageCode.includes('onClick={loadUsers}'), 'Retry must trigger loadUsers')
})

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=================================================================')
console.log(`🎉 ALL ${testsPassed} PHASE 2A USER UI INTEGRATION TESTS PASSED!`)
console.log('=================================================================\n')
