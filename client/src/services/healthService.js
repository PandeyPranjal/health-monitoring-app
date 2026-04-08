import api from './api'

/**
 * Health Data API service.
 */
const healthService = {
  /** Get paginated health records with optional filters */
  getRecords: async (params = {}) => {
    const response = await api.get('/health/records/', { params })
    return response.data
  },

  /** Create a new health record */
  createRecord: async (data) => {
    const response = await api.post('/health/records/', data)
    return response.data
  },

  /** Get the latest health reading */
  getLatest: async () => {
    const response = await api.get('/health/latest/')
    return response.data
  },

  /** Get aggregated summary (period: 'today' | 'week' | 'month') */
  getSummary: async (period = 'today') => {
    const response = await api.get('/health/summary/', { params: { period } })
    return response.data
  },
}

export default healthService
