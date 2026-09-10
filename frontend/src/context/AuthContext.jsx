import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/authApi.js'
import { normalizeRole, getRoleLabel } from '../utils/roles.js'

const STORAGE_KEY = 'homesphere_user'
const LEGACY_STORAGE_KEY = 'homesphere_mock_user'
const TOKEN_KEY = 'homesphere_token'
const LEGACY_TOKEN_KEY = 'token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load saved session from localStorage on initial render & migrate legacy session if found
  useEffect(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEY)
      // Check legacy key if primary key is absent
      if (!stored) {
        const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacyStored) {
          stored = legacyStored
          localStorage.setItem(STORAGE_KEY, legacyStored)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
        }
      }

      const storedToken =
        localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)

      if (stored && storedToken) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.role) {
          const canonical = normalizeRole(parsed.role)
          if (parsed.role !== canonical) {
            parsed.role = canonical
            parsed.roleLabel = getRoleLabel(canonical)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
          }
        }
        setUser(parsed)
        setToken(storedToken)
      } else if (stored && !storedToken) {
        // Incomplete session without token: purge invalid session
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to parse stored session from localStorage', e)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Log in user via authApi gateway
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    setError(null)
    const result = await authApi.login({ email, password })

    if (result.success) {
      setUser(result.user)
      if (result.token) {
        setToken(result.token)
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
        if (result.token) {
          localStorage.setItem(TOKEN_KEY, result.token)
          localStorage.setItem(LEGACY_TOKEN_KEY, result.token)
        }
      } catch (e) {
        console.error('Failed to save session to localStorage', e)
      }

      return { success: true, user: result.user, token: result.token }
    }

    setError(result.error)
    return result
  }

  /**
   * Register a user via authApi gateway
   * - PROPERTY_OWNER returns PENDING state (no active session created)
   * - TENANT & PROPERTY_MANAGER return ACTIVE state with real authenticated session
   * - SUPER_ADMIN is rejected
   */
  const register = async (registrationData) => {
    setError(null)
    const result = await authApi.register(registrationData)

    if (result.success) {
      if (result.isPending || result.status === 'PENDING') {
        // Pending approval: do not create active authenticated session
        return {
          success: true,
          user: result.user,
          status: 'PENDING',
          isPending: true,
        }
      }

      // Active registration: automatically log in to acquire real backend JWT
      if (!result.token && registrationData.email && registrationData.password) {
        try {
          const loginResult = await login(registrationData.email, registrationData.password)
          if (loginResult.success) {
            return {
              success: true,
              user: loginResult.user,
              token: loginResult.token,
              status: 'ACTIVE',
              isPending: false,
            }
          }
        } catch (loginErr) {
          console.warn('Auto-login after registration failed, user must sign in manually', loginErr)
        }
      }

      // Active registration fallback if token was already returned (e.g. mock mode)
      setUser(result.user)
      if (result.token) {
        setToken(result.token)
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user))
        if (result.token) {
          localStorage.setItem(TOKEN_KEY, result.token)
          localStorage.setItem(LEGACY_TOKEN_KEY, result.token)
        }
      } catch (e) {
        console.error('Failed to save session to localStorage', e)
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
        status: 'ACTIVE',
        isPending: false,
      }
    }

    setError(result.error)
    return result
  }

  /**
   * Log out user via authApi gateway and clear session
   */
  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setToken(null)
      setError(null)
      try {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(LEGACY_TOKEN_KEY)
      } catch (e) {
        console.error('Failed to clear session from localStorage', e)
      }
    }
  }

  /**
   * Forgot password via authApi gateway
   */
  const forgotPassword = async (email) => {
    return authApi.forgotPassword(email)
  }

  /**
   * Reset password via authApi gateway
   */
  const resetPassword = async (email, newPassword) => {
    return authApi.resetPassword({ email, password: newPassword })
  }

  const value = {
    user,
    token,
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
