import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('no_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const code   = err.response?.data?.code

    if (status === 401) {
      localStorage.removeItem('no_token')
      localStorage.removeItem('no_user')
      window.dispatchEvent(new Event('auth:logout'))
    }

    if (status === 403 && code === 'BANNED') {
      localStorage.removeItem('no_token')
      localStorage.removeItem('no_user')
      window.dispatchEvent(new Event('auth:banned'))
    }

    return Promise.reject(err)
  }
)

export default api
