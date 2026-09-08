import axiosClient from './axiosClient.js'
import {
  mockLogin,
  mockRegister,
  mockLogout,
  mockForgotPassword,
  mockResetPassword,
} from './mockAuth.js'
import { ROLES, normalizeRole, getRoleLabel } from '../utils/roles.js'

/**
 * Authentication API Service Layer
 * 
 * Endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * 
 * Active Implementation: Spring Boot REST Backend via axiosClient
 * Fallback: mockAuth.js (development / offline fallback)
 */
let useMockFallback =
  typeof import.meta !== 'undefined' &&
  import.meta?.env?.VITE_USE_MOCK_AUTH === 'true'

/**
 * Toggle mock authentication fallback for development or automated testing
 * @param {boolean} enabled
 */
export const setUseMockAuth = (enabled) => {
  useMockFallback = Boolean(enabled)
}

/**
 * Check if mock authentication fallback is currently active
 * @returns {boolean}
 */
export const isMockAuthActive = () => useMockFallback

/**
 * Normalize Spring Boot LoginResponse DTO into frontend application user state
 * @param {Object} raw - Spring Boot LoginResponse { token, userId, firstName, lastName, email, role }
 * @returns {Object} Normalized user entity
 */
export const normalizeLoginResponse = (raw) => {
  if (!raw) return null
  const canonicalRole = normalizeRole(raw.role)
  const label = getRoleLabel(canonicalRole)
  const fullName =
    [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
    raw.name ||
    `User (${label})`

  const avatarText =
    raw.avatarText ||
    ((raw.firstName?.[0] || '') + (raw.lastName?.[0] || '')) ||
    fullName.slice(0, 2)

  return {
    id: String(raw.userId || raw.id || ''),
    email: raw.email,
    name: fullName,
    firstName: raw.firstName,
    lastName: raw.lastName,
    role: canonicalRole,
    status: raw.status || 'ACTIVE',
    avatarText: avatarText.toUpperCase(),
    roleLabel: label,
  }
}

/**
 * Authenticate user credentials
 * Spring Boot Endpoint: POST /api/auth/login
 * Request: LoginRequest { email, password }
 * Response: LoginResponse { token, userId, firstName, lastName, email, role }
 */
export const login = async (credentials) => {
  if (useMockFallback) {
    const res = await mockLogin(credentials)
    if (!res.success) {
      return {
        success: false,
        error: res.error,
        isPending: res.isPending || false,
      }
    }
    return {
      success: true,
      token: res.data.token,
      user: normalizeLoginResponse(res.data),
      status: res.data.status || 'ACTIVE',
    }
  }

  // Active implementation: Spring Boot REST Backend via axiosClient
  try {
    const payload = {
      email: (credentials?.email || '').trim().toLowerCase(),
      password: credentials?.password || '',
    }
    const data = await axiosClient.post('/auth/login', payload)
    return {
      success: true,
      token: data.token,
      user: normalizeLoginResponse(data),
      status: data.status || 'ACTIVE',
    }
  } catch (error) {
    const isPending =
      error.message === 'Account is not active' ||
      error.data?.message === 'Account is not active' ||
      (error.status === 403 && error.data?.isPending)

    const errorMessage = isPending
      ? 'Your account is pending administrator verification. You will be able to sign in once approved.'
      : error.message || 'Authentication failed'

    return {
      success: false,
      error: errorMessage,
      isPending,
    }
  }
}

/**
 * Register a new user account
 * Spring Boot Endpoint: POST /api/auth/register
 * Request: RegisterRequest { firstName, lastName, email, password, phone, gender, role }
 * Response: UserResponse { id, firstName, lastName, email, phone, gender, role, status, createdAt, updatedAt }
 */
export const register = async (userData) => {
  const canonicalRole = normalizeRole(userData.role)

  // Spring Boot Rule: SUPER_ADMIN cannot be registered through public registration
  if (canonicalRole === ROLES.SUPER_ADMIN) {
    return {
      success: false,
      error: 'Super Administrator accounts cannot be created through public registration.',
    }
  }

  if (useMockFallback) {
    const res = await mockRegister(userData)
    if (!res.success) {
      return {
        success: false,
        error: res.error,
      }
    }
    return {
      success: true,
      user: normalizeLoginResponse(res.data),
      token: res.token || null,
      status: res.status,
      isPending: res.isPending || false,
    }
  }

  // Active implementation: Spring Boot REST Backend via axiosClient
  try {
    const nameParts = (userData.name || '').trim().split(' ')
    const firstName =
      userData.firstName || nameParts[0] || 'User'
    const lastName =
      userData.lastName || nameParts.slice(1).join(' ') || getRoleLabel(canonicalRole)

    const payload = {
      firstName,
      lastName,
      email: (userData.email || '').trim().toLowerCase(),
      password: userData.password,
      phone: userData.phone || '9876543210',
      gender: userData.gender || 'OTHER',
      role: canonicalRole,
    }

    const data = await axiosClient.post('/auth/register', payload)
    const isPending =
      data.status === 'PENDING' || canonicalRole === ROLES.PROPERTY_OWNER

    return {
      success: true,
      user: normalizeLoginResponse(data),
      token: data.token || null,
      status: data.status || (isPending ? 'PENDING' : 'ACTIVE'),
      isPending,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Registration failed',
    }
  }
}

/**
 * Terminate user session and remove stored credentials
 * Spring Boot Endpoint: POST /api/auth/logout
 */
export const logout = async () => {
  try {
    if (useMockFallback) {
      await mockLogout()
    } else {
      await axiosClient.post('/auth/logout').catch(() => {})
    }
  } finally {
    // Clear all token representations used by axiosClient and AuthContext
    localStorage.removeItem('token')
    localStorage.removeItem('homesphere_token')
    localStorage.removeItem('homesphere_user')
  }
  return { success: true }
}

/**
 * Send password recovery instructions
 * Spring Boot Endpoint: POST /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
  if (useMockFallback) {
    return mockForgotPassword(email)
  }
  return axiosClient.post('/auth/forgot-password', { email })
}

/**
 * Set new account password
 * Spring Boot Endpoint: POST /api/auth/reset-password
 */
export const resetPassword = async (data) => {
  if (useMockFallback) {
    return mockResetPassword(data.email, data.password)
  }
  return axiosClient.post('/auth/reset-password', data)
}

/**
 * Fetch authenticated user profile
 * Spring Boot Endpoint: GET /api/auth/me
 */
export const getCurrentUser = async () => {
  if (useMockFallback) {
    const stored = localStorage.getItem('homesphere_user')
    return stored ? JSON.parse(stored) : null
  }
  const data = await axiosClient.get('/auth/me')
  return normalizeLoginResponse(data)
}
