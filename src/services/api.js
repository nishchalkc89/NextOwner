import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
})

const WAKE_DELAY = 6000 // show toast after 6s of no response

api.interceptors.request.use(config => {
  const token = localStorage.getItem('no_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Show "waking up" toast if server takes too long (Render free tier cold start)
  const timer = setTimeout(() => {
    config._wakeToastId = toast.loading('Server is waking up, please wait…', {
      duration: 60000,
      style: {
        background: '#1c1c22',
        color: '#f1f5f5',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        fontSize: '13px',
      },
    })
  }, WAKE_DELAY)

  config._wakeTimer = timer
  return config
})

api.interceptors.response.use(
  res => {
    clearTimeout(res.config._wakeTimer)
    if (res.config._wakeToastId) toast.dismiss(res.config._wakeToastId)
    return res
  },
  err => {
    clearTimeout(err.config?._wakeTimer)
    if (err.config?._wakeToastId) toast.dismiss(err.config._wakeToastId)

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
