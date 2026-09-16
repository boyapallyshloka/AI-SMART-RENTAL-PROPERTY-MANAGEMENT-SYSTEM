import { ROLES, normalizeRole, getRoleLabel } from '../utils/roles.js'

/**
 * Isolated Mock Authentication Service
 * 
 * Simulates Spring Boot backend authentication endpoints and DTO responses:
 * - LoginRequest: { email, password }
 * - LoginResponse: { token, userId, firstName, lastName, email, role }
 * - RegisterRequest: { firstName, lastName, email, password, role }
 * - UserResponse: { id, firstName, lastName, email, role, status, createdAt }
 */

export const PENDING_STORAGE_KEY = 'homesphere_pending_registrations'

/**
 * Seed mock user accounts matching Spring Boot RoleType enums
 */
export const MOCK_USERS = [
  {
    id: 'usr_owner_01',
    email: 'owner@homesphere.com',
    password: 'password123',
    firstName: 'Marcus',
    lastName: 'Vance',
    name: 'Marcus Vance',
    role: ROLES.PROPERTY_OWNER,
    status: 'ACTIVE',
    avatarText: 'MV',
    roleLabel: 'Property Owner',
  },
  {
    id: 'usr_tenant_01',
    email: 'tenant@homesphere.com',
    password: 'password123',
    firstName: 'Elena',
    lastName: 'Rostova',
    name: 'Elena Rostova',
    role: ROLES.TENANT,
    status: 'ACTIVE',
    avatarText: 'ER',
    roleLabel: 'Verified Tenant',
  },
  {
    id: 'usr_manager_01',
    email: 'manager@homesphere.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Connor',
    name: 'Sarah Connor',
    role: ROLES.PROPERTY_MANAGER,
    status: 'ACTIVE',
    avatarText: 'SC',
    roleLabel: 'Property Manager',
  },
  {
    id: 'usr_admin_01',
    email: 'admin@homesphere.com',
    password: 'password123',
    firstName: 'Shloka',
    lastName: 'Reddy',
    name: 'Shloka Reddy',
    role: ROLES.SUPER_ADMIN,
    status: 'ACTIVE',
    avatarText: 'SR',
    roleLabel: 'Super Admin',
  },
]

/**
 * Demo accounts configuration for Quick Fill in LoginPage
 * Isolated here so login UI does not hardcode credentials in JSX closures
 */
export const DEMO_ACCOUNTS = [
  {
    key: 'owner',
    role: ROLES.PROPERTY_OWNER,
    label: 'Owner',
    email: 'owner@homesphere.com',
    password: 'password123',
    displayEmail: 'owner@...',
  },
  {
    key: 'tenant',
    role: ROLES.TENANT,
    label: 'Tenant',
    email: 'tenant@homesphere.com',
    password: 'password123',
    displayEmail: 'tenant@...',
  },
  {
    key: 'manager',
    role: ROLES.PROPERTY_MANAGER,
    label: 'Manager',
    email: 'manager@homesphere.com',
    password: 'password123',
    displayEmail: 'manager@...',
  },
  {
    key: 'admin',
    role: ROLES.SUPER_ADMIN,
    label: 'Admin',
    email: 'admin@homesphere.com',
    password: 'password123',
    displayEmail: 'admin@...',
  },
]

/**
 * Generate a simulated JWT token string for mock sessions
 */
export const mockGenerateJwt = (role, id) => {
  return `mock_jwt_${(role || 'user').toLowerCase()}_${id}_${Date.now()}`
}

/**
 * Simulate POST /api/auth/login
 * Returns Spring Boot LoginResponse DTO format:
 * { token, userId, firstName, lastName, email, role, status }
 */
export const mockLogin = async ({ email, password }) => {
  // Simulate network round-trip latency
  await new Promise((resolve) => setTimeout(resolve, 300))

  const normalizedEmail = (email || '').trim().toLowerCase()
  const trimmedPassword = (password || '').trim()

  // 1. Check if account is in pending registrations (e.g. unapproved Property Owner)
  try {
    const storedPending = JSON.parse(localStorage.getItem(PENDING_STORAGE_KEY) || '[]')
    const pendingMatch = storedPending.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === trimmedPassword
    )
    if (pendingMatch) {
      const errMsg =
        'Your account is pending administrator verification. You will be able to sign in once approved.'
      return {
        success: false,
        error: errMsg,
        isPending: true,
      }
    }
  } catch (e) {
    console.error('Failed to check pending registrations', e)
  }

  // 2. Match credentials against mock user database
  const matchedUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === trimmedPassword
  )

  if (!matchedUser) {
    return {
      success: false,
      error:
        'Invalid email or password. Use owner@homesphere.com, tenant@homesphere.com, manager@homesphere.com, or admin@homesphere.com with password123.',
    }
  }

  if (matchedUser.status === 'PENDING') {
    return {
      success: false,
      error:
        'Your account is pending administrator verification. You will be able to sign in once approved.',
      isPending: true,
    }
  }

  // Return simulated Spring Boot LoginResponse DTO
  return {
    success: true,
    data: {
      token: mockGenerateJwt(matchedUser.role, matchedUser.id),
      userId: matchedUser.id,
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
      email: matchedUser.email,
      role: matchedUser.role,
      status: matchedUser.status || 'ACTIVE',
    },
  }
}

/**
 * Simulate POST /api/auth/register
 * Handles Spring Boot registration rules:
 * - Reject SUPER_ADMIN public registration
 * - PROPERTY_OWNER is created in PENDING status
 * - TENANT and PROPERTY_MANAGER are created in ACTIVE status
 */
export const mockRegister = async ({ name, email, password, role = ROLES.TENANT }) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const normalizedEmail = (email || '').trim().toLowerCase()
  const canonicalRole = normalizeRole(role)

  // Spring Boot Rule: SUPER_ADMIN cannot be registered through public registration
  if (canonicalRole === ROLES.SUPER_ADMIN) {
    return {
      success: false,
      error: 'Super Administrator accounts cannot be created through public registration.',
    }
  }

  const nameParts = (name || '').trim().split(' ')
  const firstName = nameParts[0] || 'New'
  const lastName = nameParts.slice(1).join(' ') || getRoleLabel(canonicalRole)
  const isPending = canonicalRole === ROLES.PROPERTY_OWNER
  const status = isPending ? 'PENDING' : 'ACTIVE'
  const userId = `usr_${Date.now()}`

  const userDto = {
    id: userId,
    firstName,
    lastName,
    name: (name || '').trim() || `${firstName} ${lastName}`,
    email: normalizedEmail,
    role: canonicalRole,
    status,
    createdAt: new Date().toISOString(),
  }

  if (isPending) {
    try {
      const storedPending = JSON.parse(localStorage.getItem(PENDING_STORAGE_KEY) || '[]')
      storedPending.push({
        ...userDto,
        password: (password || '').trim(),
      })
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(storedPending))
    } catch (e) {
      console.error('Failed to save pending registration', e)
    }

    return {
      success: true,
      data: userDto,
      isPending: true,
      status: 'PENDING',
    }
  }

  // Active user gets a mock JWT token immediately
  return {
    success: true,
    data: userDto,
    token: mockGenerateJwt(canonicalRole, userId),
    isPending: false,
    status: 'ACTIVE',
  }
}

/**
 * Simulate POST /api/auth/logout
 */
export const mockLogout = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return { success: true }
}

/**
 * Simulate POST /api/auth/forgot-password
 */
export const mockForgotPassword = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: 'Password reset instructions sent to ' + email }
}

/**
 * Simulate POST /api/auth/reset-password
 */
export const mockResetPassword = async (email, newPassword) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: 'Password has been successfully updated' }
}
