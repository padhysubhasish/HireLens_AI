import api from './api'

export const authService = {
  register: (payload) => api.post('/api/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/api/auth/login', payload).then((r) => r.data),
  me: () => api.get('/api/auth/me').then((r) => r.data),
}

export const resumeService = {
  upload: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total))
        },
      })
      .then((r) => r.data)
  },
  list: () => api.get('/api/resumes').then((r) => r.data),
  get: (id) => api.get(`/api/resumes/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/api/resumes/${id}`),
}

export const screeningService = {
  create: (payload) => api.post('/api/screenings', payload).then((r) => r.data),
  list: () => api.get('/api/screenings').then((r) => r.data),
  get: (id) => api.get(`/api/screenings/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/api/screenings/${id}`),
}

export const dashboardService = {
  stats: () => api.get('/api/dashboard/stats').then((r) => r.data),
}

export const systemService = {
  health: () => api.get('/api/health').then((r) => r.data),
}

export const samplesService = {
  jobDescription: () => api.get('/api/samples/job-description').then((r) => r.data),
  resumeUrl: () => `${api.defaults.baseURL}/api/samples/resume`,
}
