import axiosClient from './axiosClient.js'

/**
 * User Management API Service (Spring Boot Integration)
 * Controller: UserController (/api/users)
 * Access: SUPER_ADMIN
 */

// GET /api/users
export const getAllUsers = async () => {
  return axiosClient.get('/users')
}

// GET /api/users/{id}
export const getUserById = async (id) => {
  return axiosClient.get(`/users/${id}`)
}

// GET /api/users/email?email=...
export const getUserByEmail = async (email) => {
  return axiosClient.get('/users/email', {
    params: { email },
  })
}

// PUT /api/users/{id}
export const updateUser = async (id, userData) => {
  return axiosClient.put(`/users/${id}`, userData)
}

// DELETE /api/users/{id}
export const deleteUser = async (id) => {
  return axiosClient.delete(`/users/${id}`)
}

// GET /api/users/role/{role}
export const getUsersByRole = async (role) => {
  return axiosClient.get(`/users/role/${role}`)
}

// GET /api/users/status/{status}
export const getUsersByStatus = async (status) => {
  return axiosClient.get(`/users/status/${status}`)
}

// GET /api/users/filter?role=...&status=...
export const getUsersByRoleAndStatus = async (role, status) => {
  return axiosClient.get('/users/filter', {
    params: { role, status },
  })
}

// PUT /api/users/{id}/status?status=...
export const updateUserStatus = async (id, status) => {
  return axiosClient.put(`/users/${id}/status`, null, {
    params: { status },
  })
}
