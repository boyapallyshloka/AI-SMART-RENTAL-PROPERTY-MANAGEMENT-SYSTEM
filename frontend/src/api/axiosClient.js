import axios from 'axios'

/**
 * Axios client configured for HomeSphere Spring Boot REST API
 * Base URL is read from Vite environment variable VITE_API_BASE_URL
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Attach JWT token from localStorage if available
axiosClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('homesphere_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Basic error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Standardized error representation for consuming services
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred'

    console.error('API Error:', {
      status: error.response?.status,
      message,
      url: error.config?.url,
    })

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    })
  }
)

export default axiosClient
