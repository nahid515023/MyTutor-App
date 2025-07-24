import axios from 'axios'
import { API_CONFIG, isProduction } from '../config/index'

const baseURL = isProduction
  ? API_CONFIG.BASE_URL
  : 'http://localhost:3001/api/'

export const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Add any request preprocessing here
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/home'
    }
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
