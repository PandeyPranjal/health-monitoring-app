import api from './api'

const fitbitService = {
  getStatus: async () => {
    const { data } = await api.get('/health/fitbit/status/')
    return data
  },

  getConnectUrl: async () => {
    const { data } = await api.get('/health/fitbit/connect/')
    return data
  },

  sync: async () => {
    const { data } = await api.post('/health/fitbit/sync/')
    return data
  },

  disconnect: async () => {
    const { data } = await api.post('/health/fitbit/disconnect/')
    return data
  },

  getSteps: async (date = 'today') => {
    const { data } = await api.get(`/health/fitbit/steps/?date=${date}`)
    return data
  },

  getHeartRate: async (date = 'today') => {
    const { data } = await api.get(`/health/fitbit/heart-rate/?date=${date}`)
    return data
  },
}

export default fitbitService
