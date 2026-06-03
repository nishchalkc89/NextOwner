import api from './api'

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password })
  persist(data)
  return data
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  persist(data)
  return data
}

export async function loginGoogle(profile) {
  const { data } = await api.post('/auth/google', profile)
  persist(data)
  return data
}

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export function logout() {
  localStorage.removeItem('no_token')
  localStorage.removeItem('no_user')
}

function persist({ token, user }) {
  if (token) localStorage.setItem('no_token', token)
  if (user) localStorage.setItem('no_user', JSON.stringify(user))
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('no_user')) } catch { return null }
}

export function getStoredToken() {
  return localStorage.getItem('no_token')
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token, password) {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password })
  return data
}

export async function submitSupportContact({ name, email, subject, message, type }) {
  const { data } = await api.post('/support/contact', { name, email, subject, message, type })
  return data
}
