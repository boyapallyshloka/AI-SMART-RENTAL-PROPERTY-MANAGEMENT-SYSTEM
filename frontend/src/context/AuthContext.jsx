import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Temporary mock user accounts
 */
export const MOCK_USERS = [
  {
    id: 'usr_owner_01',
    email: 'owner@homesphere.com',
    password: 'password123',
    name: 'Marcus Vance',
    role: 'owner',
    avatarText: 'MV',
    roleLabel: 'Property Owner',
  },
  {
    id: 'usr_tenant_01',
    email: 'tenant@homesphere.com',
    password: 'password123',
    name: 'Elena Rostova',
    role: 'tenant',
    avatarText: 'ER',
    roleLabel: 'Verified Tenant',
  },
  {
    id: 'usr_manager_01',
    email: 'manager@homesphere.com',
    password: 'password123',
    name: 'Sarah Connor',
    role: 'manager',
    avatarText: 'SC',
    roleLabel: 'Property Manager',
  },
]

const STORAGE_KEY = 'homesphere_mock_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load saved mock user from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to parse stored user from localStorage', e)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Log in with mock credentials
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    setError(null)
    const normalizedEmail = (email || '').trim().toLowerCase()
    const trimmedPassword = (password || '').trim()

    // Simulate async network response
    await new Promise((resolve) => setTimeout(resolve, 300))

    const matchedUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === trimmedPassword
    )

    if (!matchedUser) {
      const errMsg =
        'Invalid email or password. Use owner@homesphere.com, tenant@homesphere.com, or manager@homesphere.com with password123.'
      setError(errMsg)
      return { success: false, error: errMsg }
    }

    const sessionUser = {
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
      avatarText: matchedUser.avatarText,
      roleLabel: matchedUser.roleLabel,
    }

    setUser(sessionUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
    } catch (e) {
      console.error('Failed to save user session', e)
    }

    return { success: true, user: sessionUser }
  }

  /**
   * Mock registration
   */
  const register = async ({ name, email, password, role = 'tenant' }) => {
    setError(null)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const normalizedEmail = (email || '').trim().toLowerCase()
    const roleLabels = {
      owner: 'Property Owner',
      manager: 'Property Manager',
      tenant: 'Verified Tenant',
    }

    const sessionUser = {
      id: `usr_${Date.now()}`,
      email: normalizedEmail,
      name: name.trim() || `New ${roleLabels[role] || 'User'}`,
      role,
      avatarText: (name.trim() || 'User').slice(0, 2).toUpperCase(),
      roleLabel: roleLabels[role] || 'User',
    }

    setUser(sessionUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
    } catch (e) {
      console.error('Failed to save session', e)
    }

    return { success: true, user: sessionUser }
  }

  /**
   * Log out user
   */
  const logout = () => {
    setUser(null)
    setError(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear session', e)
    }
  }

  /**
   * Mock forgot password
   */
  const forgotPassword = async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true }
  }

  /**
   * Mock reset password
   */
  const resetPassword = async (email, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
