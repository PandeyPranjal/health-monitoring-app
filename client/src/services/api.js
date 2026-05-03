import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Automatically attach user's local timezone
    try {
      config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch { /* Fallback strictly to UTC */ }

    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor — handle 401s & silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401, not a retry, and not an auth endpoint
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/api/users/login') ||
        originalRequest.url?.includes('/api/users/register')

      if (isAuthEndpoint) return Promise.reject(error)

      if (isRefreshing) {
        // Pause incoming requests into queue while refreshing
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('access_token')
        window.dispatchEvent(new Event('auth:session-expired'))
        return Promise.reject(error)
      }

      try {
        // Attempt token refresh
        const { data } = await api.post('/api/users/token/refresh/', {
          refresh: refreshToken
        })

        const newAccess = data.access
        localStorage.setItem('access_token', newAccess)

        // Setup new token
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        // Replay all paused requests
        processQueue(null, newAccess)
        return api(originalRequest)

      } catch (err) {
        // Refresh completely failed (e.g., refresh token expired too)
        processQueue(err, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Graceful logout event instead of hard reload to preserve app state
        window.dispatchEvent(new Event('auth:session-expired'))
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
