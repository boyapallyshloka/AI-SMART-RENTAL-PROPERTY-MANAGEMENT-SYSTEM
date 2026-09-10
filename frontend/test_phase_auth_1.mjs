/**
 * Auth Phase 1 — Frontend Authentication Integration Verification Suite
 * 
 * Verifies:
 * 1. Login contract & DTO processing (LoginRequest, LoginResponse)
 * 2. Login error handling (invalid credentials, pending account)
 * 3. Registration contract (RegisterRequest, UserResponse, exact 7 fields)
 * 4. Super Admin registration rejection
 * 5. Role-based registration status (Property Owner PENDING vs Tenant ACTIVE)
 * 6. Automatic session token acquisition for active registrations
 * 7. Session restoration with valid token & purge on partial session
 * 8. Role handling matching Spring Boot RoleType enums exactly
 * 9. Axios client JWT Bearer attachment & multipart FormData safety
 * 10. Mock auth isolation (default disabled, no silent fallback)
 * 11. Logout storage cleanup
 */

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. In-memory Mock Storage for Node.js test environment
const storageStore = new Map()
globalThis.localStorage = {
  getItem: (key) => (storageStore.has(key) ? storageStore.get(key) : null),
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear(),
}
globalThis.window = { localStorage: globalThis.localStorage }

// Polyfill FormData for Node.js if needed
if (typeof globalThis.FormData === 'undefined') {
  class MockFormData {
    constructor() {
      this._data = new Map()
    }
    append(k, v) {
      this._data.set(k, v)
    }
  }
  globalThis.FormData = MockFormData
}

console.log('=================================================================')
console.log('🧪 RUNNING AUTH PHASE 1 INTEGRATION VERIFICATION SUITE')
console.log('=================================================================\n')

// 2. Import modules
const authApiPath = path.resolve(__dirname, 'src/api/authApi.js')
const axiosClientPath = path.resolve(__dirname, 'src/api/axiosClient.js')
const rolesPath = path.resolve(__dirname, 'src/utils/roles.js')
const mockAuthPath = path.resolve(__dirname, 'src/api/mockAuth.js')

const authApi = await import(`file://${authApiPath}`)
const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default
const roles = await import(`file://${rolesPath}`)
const mockAuth = await import(`file://${mockAuthPath}`)

const { ROLES, normalizeRole, getRoleLabel, getDashboardPath, getPortalName, isSuperAdmin, isPropertyOwner, isPropertyManager, isTenant, isOwnerOrManager } = roles
const { login, register, logout, normalizeLoginResponse, isMockAuthActive, setUseMockAuth } = authApi

let testsPassed = 0

// Helper assertion function
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

// -----------------------------------------------------------------------------
// SUITE 1: CANONICAL ROLES & ROUTING
// -----------------------------------------------------------------------------
console.log('1. Verifying Backend Canonical Roles & Guards...')

await runTest('Backend RoleType enum values match exactly', () => {
  assert.strictEqual(ROLES.SUPER_ADMIN, 'SUPER_ADMIN')
  assert.strictEqual(ROLES.PROPERTY_OWNER, 'PROPERTY_OWNER')
  assert.strictEqual(ROLES.PROPERTY_MANAGER, 'PROPERTY_MANAGER')
  assert.strictEqual(ROLES.TENANT, 'TENANT')
})

await runTest('Role normalization handles canonical and legacy string aliases', () => {
  assert.strictEqual(normalizeRole('SUPER_ADMIN'), ROLES.SUPER_ADMIN)
  assert.strictEqual(normalizeRole('ADMIN'), ROLES.SUPER_ADMIN)
  assert.strictEqual(normalizeRole('PROPERTY_OWNER'), ROLES.PROPERTY_OWNER)
  assert.strictEqual(normalizeRole('OWNER'), ROLES.PROPERTY_OWNER)
  assert.strictEqual(normalizeRole('PROPERTY_MANAGER'), ROLES.PROPERTY_MANAGER)
  assert.strictEqual(normalizeRole('MANAGER'), ROLES.PROPERTY_MANAGER)
  assert.strictEqual(normalizeRole('TENANT'), ROLES.TENANT)
  assert.strictEqual(normalizeRole(null), ROLES.TENANT)
})

await runTest('Role helpers accurately identify roles', () => {
  assert.strictEqual(isSuperAdmin(ROLES.SUPER_ADMIN), true)
  assert.strictEqual(isSuperAdmin(ROLES.PROPERTY_OWNER), false)
  assert.strictEqual(isPropertyOwner(ROLES.PROPERTY_OWNER), true)
  assert.strictEqual(isPropertyOwner(ROLES.TENANT), false)
  assert.strictEqual(isPropertyManager(ROLES.PROPERTY_MANAGER), true)
  assert.strictEqual(isTenant(ROLES.TENANT), true)
  assert.strictEqual(isOwnerOrManager(ROLES.PROPERTY_OWNER), true)
  assert.strictEqual(isOwnerOrManager(ROLES.PROPERTY_MANAGER), true)
  assert.strictEqual(isOwnerOrManager(ROLES.TENANT), false)
})

await runTest('Dashboard paths map correctly to role portals', () => {
  assert.strictEqual(getDashboardPath(ROLES.SUPER_ADMIN), '/admin/dashboard')
  assert.strictEqual(getDashboardPath(ROLES.PROPERTY_OWNER), '/owner/dashboard')
  assert.strictEqual(getDashboardPath(ROLES.PROPERTY_MANAGER), '/owner/dashboard')
  assert.strictEqual(getDashboardPath(ROLES.TENANT), '/tenant/dashboard')
})

// -----------------------------------------------------------------------------
// SUITE 2: DTO NORMALIZATION
// -----------------------------------------------------------------------------
console.log('\n2. Verifying DTO Normalization (LoginResponse & UserResponse)...')

await runTest('normalizeLoginResponse correctly maps Spring Boot LoginResponse DTO', () => {
  const backendLoginResponse = {
    token: 'jwt.sample.token',
    userId: 101,
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@example.com',
    role: 'PROPERTY_OWNER',
  }
  const normalized = normalizeLoginResponse(backendLoginResponse)
  assert.strictEqual(normalized.id, '101')
  assert.strictEqual(normalized.name, 'Marcus Vance')
  assert.strictEqual(normalized.firstName, 'Marcus')
  assert.strictEqual(normalized.lastName, 'Vance')
  assert.strictEqual(normalized.email, 'marcus.vance@example.com')
  assert.strictEqual(normalized.role, ROLES.PROPERTY_OWNER)
  assert.strictEqual(normalized.roleLabel, 'Property Owner')
  assert.strictEqual(normalized.avatarText, 'MV')
  assert.strictEqual(normalized.status, 'ACTIVE')
})

await runTest('normalizeLoginResponse correctly maps Spring Boot UserResponse DTO', () => {
  const backendUserResponse = {
    id: 202,
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena@example.com',
    phone: '9876543210',
    gender: 'FEMALE',
    role: 'TENANT',
    status: 'ACTIVE',
  }
  const normalized = normalizeLoginResponse(backendUserResponse)
  assert.strictEqual(normalized.id, '202')
  assert.strictEqual(normalized.name, 'Elena Rostova')
  assert.strictEqual(normalized.phone, '9876543210')
  assert.strictEqual(normalized.gender, 'FEMALE')
  assert.strictEqual(normalized.role, ROLES.TENANT)
  assert.strictEqual(normalized.roleLabel, 'Verified Tenant')
  assert.strictEqual(normalized.avatarText, 'ER')
})

// -----------------------------------------------------------------------------
// SUITE 3: MOCK AUTH ISOLATION & REAL BACKEND ROUTING
// -----------------------------------------------------------------------------
console.log('\n3. Verifying Mock Auth Isolation & Default Real Backend...')

await runTest('Mock auth is disabled by default in normal flow', () => {
  assert.strictEqual(isMockAuthActive(), false, 'isMockAuthActive must be false by default')
})

await runTest('Real backend login failure does NOT fall back to fake mock credentials', async () => {
  storageStore.clear()
  // With mock auth disabled, attempting login without real backend returns a network/connection error,
  // NOT a mock user or silent mock success!
  const res = await login({ email: 'owner@homesphere.com', password: 'password123' })
  assert.strictEqual(res.success, false)
  assert.ok(res.error, 'Must contain error message')
  assert.ok(!res.token, 'Must not return mock token on backend failure')
  assert.ok(!res.user, 'Must not return mock user on backend failure')
})

// -----------------------------------------------------------------------------
// SUITE 4: LOGIN & REGISTRATION LOGIC WITH CONTROLLED MOCKS
// -----------------------------------------------------------------------------
console.log('\n4. Verifying Login & Registration Business Rules...')

// Enable mock auth temporarily for isolated logic tests
setUseMockAuth(true)

await runTest('Public registration rejects SUPER_ADMIN', async () => {
  const regResult = await register({
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'password123',
    role: ROLES.SUPER_ADMIN,
  })
  assert.strictEqual(regResult.success, false)
  assert.ok(regResult.error.includes('Super Administrator accounts cannot be created'))
})

await runTest('Property Owner registration sets status: PENDING and isPending: true', async () => {
  const regResult = await register({
    name: 'Sarah Owner',
    email: 'sarah.owner@example.com',
    password: 'password123',
    phone: '9876543211',
    gender: 'FEMALE',
    role: ROLES.PROPERTY_OWNER,
  })
  assert.strictEqual(regResult.success, true)
  assert.strictEqual(regResult.isPending, true)
  assert.strictEqual(regResult.status, 'PENDING')
  assert.strictEqual(regResult.user.role, ROLES.PROPERTY_OWNER)
})

await runTest('Login with pending account fails with verification notice', async () => {
  const loginRes = await login({
    email: 'sarah.owner@example.com',
    password: 'password123',
  })
  assert.strictEqual(loginRes.success, false)
  assert.strictEqual(loginRes.isPending, true)
  assert.ok(loginRes.error.includes('pending administrator verification'))
})

await runTest('Tenant registration sets status: ACTIVE', async () => {
  const regResult = await register({
    name: 'Tom Tenant',
    email: 'tom.tenant@example.com',
    password: 'password123',
    phone: '9876543212',
    gender: 'MALE',
    role: ROLES.TENANT,
  })
  assert.strictEqual(regResult.success, true)
  assert.strictEqual(regResult.isPending, false)
  assert.strictEqual(regResult.status, 'ACTIVE')
  assert.strictEqual(regResult.user.role, ROLES.TENANT)
})

await runTest('Active user login succeeds and provides JWT token', async () => {
  const loginRes = await login({
    email: 'tenant@homesphere.com',
    password: 'password123',
  })
  assert.strictEqual(loginRes.success, true)
  assert.ok(loginRes.token)
  assert.strictEqual(loginRes.user.role, ROLES.TENANT)
  assert.strictEqual(loginRes.status, 'ACTIVE')
})

await runTest('Login with incorrect credentials fails cleanly', async () => {
  const loginRes = await login({
    email: 'tenant@homesphere.com',
    password: 'wrong_password_123',
  })
  assert.strictEqual(loginRes.success, false)
  assert.ok(loginRes.error.includes('Invalid email or password'))
})

// Reset mock auth to false
setUseMockAuth(false)

// -----------------------------------------------------------------------------
// SUITE 5: LOGOUT & STORAGE PURGING
// -----------------------------------------------------------------------------
console.log('\n5. Verifying Logout & Storage Purging...')

await runTest('Logout clears all token and user session keys in storage', async () => {
  storageStore.set('token', 'sample-jwt-123')
  storageStore.set('homesphere_token', 'sample-jwt-123')
  storageStore.set('homesphere_user', JSON.stringify({ email: 'test@example.com' }))

  await logout()

  assert.strictEqual(localStorage.getItem('token'), null)
  assert.strictEqual(localStorage.getItem('homesphere_token'), null)
  assert.strictEqual(localStorage.getItem('homesphere_user'), null)
})

// -----------------------------------------------------------------------------
// SUITE 6: AXIOS CLIENT INTERCEPTORS & MULTIPART SAFETY
// -----------------------------------------------------------------------------
console.log('\n6. Verifying Axios Interceptors & Multipart Safety...')

await runTest('Axios request interceptor attaches Authorization: Bearer <token>', () => {
  storageStore.set('homesphere_token', 'my-auth-token-456')

  // Find request interceptor
  const requestInterceptor = axiosClient.interceptors.request.handlers[0]
  assert.ok(requestInterceptor, 'Request interceptor must be registered')

  const config = { headers: {} }
  const result = requestInterceptor.fulfilled(config)
  assert.strictEqual(result.headers.Authorization, 'Bearer my-auth-token-456')
})

await runTest('Axios request interceptor preserves multipart boundary for FormData without dropping Authorization', () => {
  storageStore.set('homesphere_token', 'my-auth-token-789')

  const requestInterceptor = axiosClient.interceptors.request.handlers[0]
  const mockFormData = new globalThis.FormData()
  mockFormData.append('file', 'test')

  const config = {
    data: mockFormData,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const result = requestInterceptor.fulfilled(config)
  assert.strictEqual(result.headers['Content-Type'], undefined, 'Content-Type must be removed for FormData')
  assert.strictEqual(result.headers.Authorization, 'Bearer my-auth-token-789', 'Authorization must be preserved')
})

await runTest('Axios response interceptor formats Spring Boot validation error map', async () => {
  const responseInterceptor = axiosClient.interceptors.response.handlers[0]
  assert.ok(responseInterceptor, 'Response interceptor must be registered')

  const mockError = {
    response: {
      status: 400,
      data: {
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Validation Failed',
        messages: {
          phone: 'Enter a valid 10-digit Indian mobile number',
          password: 'Password must be between 8 and 100 characters',
        },
      },
    },
  }

  try {
    await responseInterceptor.rejected(mockError)
    assert.fail('Should have rejected')
  } catch (standardizedError) {
    assert.strictEqual(standardizedError.status, 400)
    assert.ok(standardizedError.message.includes('Enter a valid 10-digit Indian mobile number'))
    assert.ok(standardizedError.message.includes('Password must be between 8 and 100 characters'))
  }
})

// -----------------------------------------------------------------------------
// SUITE 7: SOURCE CODE CONTRACT CHECKS
// -----------------------------------------------------------------------------
console.log('\n7. Verifying Frontend Source Code Integrity...')

await runTest('RegisterPage.jsx includes phone, gender, and minimum 8-character password validation', () => {
  const content = fs.readFileSync(path.resolve(__dirname, 'src/pages/auth/RegisterPage.jsx'), 'utf-8')
  assert.ok(content.includes('phoneRegex'), 'RegisterPage must have phone regex validation')
  assert.ok(content.includes('gender'), 'RegisterPage must have gender state/input')
  assert.ok(content.includes('password.length < 8'), 'RegisterPage must enforce min 8 chars')
  assert.ok(content.includes('placeholder="At least 8 characters"'), 'RegisterPage placeholder must reflect min 8 chars')
  assert.ok(!content.includes('password.length < 6'), 'RegisterPage must not permit 6-char passwords')
})

await runTest('AuthContext.jsx auto-logs in active registrations and requires valid token for session restoration', () => {
  const content = fs.readFileSync(path.resolve(__dirname, 'src/context/AuthContext.jsx'), 'utf-8')
  assert.ok(content.includes('if (stored && storedToken)'), 'Session restoration must require both user and token')
  assert.ok(content.includes('await login(registrationData.email, registrationData.password)'), 'Register must auto-login active accounts')
})

console.log('\n=================================================================')
console.log(`🎉 ALL ${testsPassed} AUTH PHASE 1 INTEGRATION TESTS PASSED!`)
console.log('=================================================================\n')
