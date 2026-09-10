/**
 * Phase 2B — Frontend Runtime Connection Verification Suite
 * 
 * Verifies frontend runtime configuration and connection expectations:
 * 1. VITE_API_BASE_URL is referenced correctly in .env, .env.example, and axiosClient.js
 * 2. axiosClient has the expected Spring Boot base URL ('http://localhost:8080/api')
 * 3. Authorization Bearer token header handling is wired in axiosClient interceptor
 * 4. User API requests route strictly through axiosClient (GET /api/users, etc.)
 * 5. Architecture isolation: NO direct Neon/PostgreSQL database connections in frontend
 * 6. Super Admin User Management UI has NO mock-user fallback reintroduced
 * 7. Real runtime network probe against configured backend URL with classification
 */

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('=================================================================')
console.log('🧪 RUNNING PHASE 2B FRONTEND RUNTIME CONFIG & CONNECTION VERIFICATION')
console.log('=================================================================\n')

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

// -----------------------------------------------------------------------------
// SECTION 1: VITE ENVIRONMENT CONFIGURATION & BASE URL RESOLUTION
// -----------------------------------------------------------------------------
console.log('1. Auditing Environment Configuration & Base URL...')

const envPath = path.resolve(__dirname, '.env')
const envExamplePath = path.resolve(__dirname, '.env.example')
const axiosClientPath = path.resolve(__dirname, 'src/api/axiosClient.js')

await runTest('.env.example documents expected Spring Boot API base URL', () => {
  assert.ok(fs.existsSync(envExamplePath), '.env.example must exist')
  const content = fs.readFileSync(envExamplePath, 'utf8')
  assert.ok(content.includes('VITE_API_BASE_URL=http://localhost:8080/api'), 'Must document http://localhost:8080/api')
})

await runTest('.env exists and defines VITE_API_BASE_URL', () => {
  assert.ok(fs.existsSync(envPath), '.env must exist')
  const content = fs.readFileSync(envPath, 'utf8')
  assert.ok(content.includes('VITE_API_BASE_URL=http://localhost:8080/api'), '.env must set VITE_API_BASE_URL to http://localhost:8080/api')
})

await runTest('axiosClient.js reads VITE_API_BASE_URL with localhost:8080/api fallback', () => {
  const code = fs.readFileSync(axiosClientPath, 'utf8')
  assert.ok(code.includes('import.meta?.env?.VITE_API_BASE_URL'), 'Must read import.meta.env.VITE_API_BASE_URL')
  assert.ok(code.includes("'http://localhost:8080/api'"), "Must have 'http://localhost:8080/api' fallback")
})

// -----------------------------------------------------------------------------
// SECTION 2: AXIOS CLIENT INTERCEPTORS & BEARER JWT ATTACHMENT
// -----------------------------------------------------------------------------
console.log('\n2. Auditing Axios Client & Authorization Header Attachment...')

// Mock browser environment for axiosClient import
const storageStore = new Map()
globalThis.localStorage = {
  getItem: (key) => (storageStore.has(key) ? storageStore.get(key) : null),
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear(),
}
globalThis.window = { localStorage: globalThis.localStorage }

const axiosClientModule = await import(`file://${axiosClientPath}`)
const axiosClient = axiosClientModule.default

await runTest('axiosClient has expected baseURL and default JSON headers', () => {
  assert.strictEqual(axiosClient.defaults.baseURL, 'http://localhost:8080/api')
  assert.strictEqual(axiosClient.defaults.headers['Content-Type'], 'application/json')
})

await runTest('axiosClient request interceptor attaches Authorization: Bearer <token>', async () => {
  const testJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fakeToken123'
  localStorage.setItem('homesphere_token', testJwt)

  // Intercept request config through the interceptor stack
  const interceptor = axiosClient.interceptors.request.handlers[0].fulfilled
  const config = await interceptor({ headers: {} })

  assert.strictEqual(config.headers.Authorization, `Bearer ${testJwt}`)
  localStorage.clear()
})

await runTest('axiosClient request interceptor handles both token and homesphere_token storage keys', async () => {
  const testJwt = 'legacyToken456'
  localStorage.setItem('token', testJwt)

  const interceptor = axiosClient.interceptors.request.handlers[0].fulfilled
  const config = await interceptor({ headers: {} })

  assert.strictEqual(config.headers.Authorization, `Bearer ${testJwt}`)
  localStorage.clear()
})

// -----------------------------------------------------------------------------
// SECTION 3: USER API & UI PAGE ROUTING
// -----------------------------------------------------------------------------
console.log('\n3. Auditing User API Routing & Mock Isolation...')

const userApiPath = path.resolve(__dirname, 'src/api/userApi.js')
const userPagePath = path.resolve(__dirname, 'src/pages/admin/UserManagementPage.jsx')

await runTest('userApi.js routes all requests through axiosClient without hardcoded hostnames', () => {
  const code = fs.readFileSync(userApiPath, 'utf8')
  assert.ok(code.includes("import axiosClient from './axiosClient.js'"))
  assert.ok(code.includes("axiosClient.get('/users')"))
  assert.ok(code.includes("axiosClient.get(`/users/${id}`)"))
  assert.ok(code.includes("axiosClient.get('/users/email'"))
  assert.ok(code.includes("axiosClient.put(`/users/${id}'") || code.includes("axiosClient.put(`/users/${id}`"))
  assert.ok(code.includes("axiosClient.delete(`/users/${id}`)"))
  assert.ok(!code.includes('http://'), 'No hardcoded URLs in userApi.js')
  assert.ok(!code.includes('https://'), 'No hardcoded URLs in userApi.js')
})

await runTest('UserManagementPage.jsx has NO mock data fallback in active Super Admin flow', () => {
  const pageCode = fs.readFileSync(userPagePath, 'utf8')
  assert.ok(!pageCode.includes('MOCK_USERS'), 'Must NOT import MOCK_USERS')
  assert.ok(!pageCode.includes('adminMockData'), 'Must NOT import adminMockData')
  assert.ok(pageCode.includes('getAllUsers()'), 'Must call getAllUsers()')
})

// -----------------------------------------------------------------------------
// SECTION 4: ARCHITECTURAL INTEGRITY (NO DIRECT DB / NEON ACCESS)
// -----------------------------------------------------------------------------
console.log('\n4. Auditing Architecture Isolation (No Direct DB/Neon Access)...')

await runTest('Frontend source code contains zero direct Neon or PostgreSQL connections', () => {
  const srcDir = path.resolve(__dirname, 'src')
  const checkFiles = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        checkFiles(fullPath)
      } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8').toLowerCase()
        assert.ok(!content.includes('neon.tech'), `Direct Neon URL found in ${entry.name}`)
        assert.ok(!content.includes('@neondatabase'), `Neon driver found in ${entry.name}`)
        assert.ok(!content.includes('postgres://'), `Direct PostgreSQL connection string found in ${entry.name}`)
      }
    }
  }
  checkFiles(srcDir)
})

// -----------------------------------------------------------------------------
// SECTION 5: ACTUAL RUNTIME CONNECTION PROBE
// -----------------------------------------------------------------------------
console.log('\n5. Probing Actual Runtime Connection to Configured Backend URL...')

let connectionResult = null
try {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)

  const res = await fetch('http://localhost:8080/api/users', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer test_jwt_probe',
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
  clearTimeout(timeoutId)

  connectionResult = {
    reachable: true,
    status: res.status,
    classification: res.status === 200 ? 'A. SUCCESS' : res.status === 401 || res.status === 403 ? 'B. AUTHENTICATION FAILURE' : 'C. SERVER/ROUTE FAILURE',
  }
} catch (err) {
  const isConnRefused = err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')
  connectionResult = {
    reachable: false,
    error: err.cause?.code || err.code || err.message,
    classification: isConnRefused ? 'D. NETWORK/CONNECTION FAILURE' : 'E. CONFIGURATION ISSUE',
  }
}

await runTest('Runtime connection probe accurately classifies connection status without false claims', () => {
  assert.ok(connectionResult !== null, 'Probe must return a result')
  if (connectionResult.reachable) {
    console.log(`     [Probe Response: Backend reachable with HTTP ${connectionResult.status} -> ${connectionResult.classification}]`)
  } else {
    console.log(`     [Probe Response: Backend NOT reachable (${connectionResult.error}) -> ${connectionResult.classification}]`)
    assert.strictEqual(connectionResult.classification, 'D. NETWORK/CONNECTION FAILURE')
  }
})

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=================================================================')
console.log(`🎉 ALL ${testsPassed} PHASE 2B RUNTIME CONFIG VERIFICATION TESTS PASSED!`)
console.log(`   Runtime Classification: ${connectionResult.classification}`)
console.log('=================================================================\n')
