import axiosClient from './axiosClient'

/**
 * Authentication API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot auth endpoint (e.g. POST /auth/login)
export const login = async (credentials) => {
  // return axiosClient.post('/auth/login', credentials)
  throw new Error('TODO: Connect to Spring Boot backend /auth/login')
}

// TODO: Replace with Spring Boot registration endpoint (e.g. POST /auth/register)
export const register = async (userData) => {
  // return axiosClient.post('/auth/register', userData)
  throw new Error('TODO: Connect to Spring Boot backend /auth/register')
}

// TODO: Replace with Spring Boot logout endpoint (e.g. POST /auth/logout)
export const logout = async () => {
  // return axiosClient.post('/auth/logout')
  localStorage.removeItem('token')
  localStorage.removeItem('homesphere_token')
}

// TODO: Replace with Spring Boot forgot password endpoint (e.g. POST /auth/forgot-password)
export const forgotPassword = async (email) => {
  // return axiosClient.post('/auth/forgot-password', { email })
  throw new Error('TODO: Connect to Spring Boot backend /auth/forgot-password')
}

// TODO: Replace with Spring Boot reset password endpoint (e.g. POST /auth/reset-password)
export const resetPassword = async (data) => {
  // return axiosClient.post('/auth/reset-password', data)
  throw new Error('TODO: Connect to Spring Boot backend /auth/reset-password')
}

// TODO: Replace with Spring Boot current user endpoint (e.g. GET /auth/me)
export const getCurrentUser = async () => {
  // return axiosClient.get('/auth/me')
  throw new Error('TODO: Connect to Spring Boot backend /auth/me')
}
