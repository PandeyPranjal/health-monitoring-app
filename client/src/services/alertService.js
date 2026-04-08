import api from './api'

const alertService = {
  getAlerts: async (params = {}) => {
    const { data } = await api.get('/alerts/', { params })
    return data
  },

  getCount: async () => {
    const { data } = await api.get('/alerts/count/')
    return data
  },

  markRead: async (id) => {
    const { data } = await api.patch(`/alerts/${id}/read/`)
    return data
  },

  markAllRead: async () => {
    const { data } = await api.post('/alerts/read-all/')
    return data
  },

  dismiss: async (id) => {
    const { data } = await api.patch(`/alerts/${id}/dismiss/`)
    return data
  },
}

export default alertService
