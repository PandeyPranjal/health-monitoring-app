import api from './api'

/**
 * Auth API service — handles all authentication requests.
 */
const authService = {
  /**
   * Register a new user.
   * @param {Object} data - { username, email, password, password_confirm, first_name, last_name }
   * @returns {Object} { message, user, tokens }
   */
  register: async (data) => {
    const response = await api.post('/users/register/', data)
    return response.data
  },

  /**
   * Login an existing user.
   * @param {Object} credentials - { username, password }
   * @returns {Object} { access, refresh, user }
   */
  login: async (credentials) => {
    const response = await api.post('/users/login/', credentials)
    return response.data
  },

  /**
   * Logout — blacklist the refresh token.
   * @param {string} refreshToken
   */
  logout: async (refreshToken) => {
    const response = await api.post('/users/logout/', { refresh: refreshToken })
    return response.data
  },

  /**
   * Get current user's profile.
   * @returns {Object} user profile data
   */
  getProfile: async () => {
    const response = await api.get('/users/profile/')
    return response.data
  },

  /**
   * Update current user's profile.
   * @param {Object} data - fields to update
   */
  updateProfile: async (data) => {
    const response = await api.patch('/users/profile/', data)
    return response.data
  },

  /**
   * Refresh the access token.
   * @param {string} refreshToken
   * @returns {Object} { access }
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/users/token/refresh/', { refresh: refreshToken })
    return response.data
  },

  // ── Token storage helpers ───────────────────────

  saveTokens: ({ access, refresh }) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },

  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),

  clearTokens: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isAuthenticated: () => !!localStorage.getItem('access_token'),
}

export default authService
