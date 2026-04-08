import api from './api'

const appointmentService = {
  getDoctors: async (params = {}) => {
    const { data } = await api.get('/appointments/doctors/', { params })
    return data
  },

  getDoctor: async (id) => {
    const { data } = await api.get(`/appointments/doctors/${id}/`)
    return data
  },

  getAppointments: async () => {
    const { data } = await api.get('/appointments/')
    return data
  },

  book: async (appointmentData) => {
    const { data } = await api.post('/appointments/book/', appointmentData)
    return data
  },

  cancel: async (id) => {
    const { data } = await api.post(`/appointments/${id}/cancel/`)
    return data
  },
}

export default appointmentService
