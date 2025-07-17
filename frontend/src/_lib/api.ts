import axios from 'axios'
import { API_CONFIG, isProduction } from '../config/index'

const baseURL = isProduction
  ? API_CONFIG.BASE_URL
  : 'http://localhost:3001/api/'

export const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
