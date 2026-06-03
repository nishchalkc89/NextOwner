import api from './api'

export async function updateProfile(data) {
  const res = await api.put('/users/profile', data)
  return res.data
}

export async function getProfile() {
  const { data } = await api.get('/users/profile')
  return data
}

export async function getPublicProfile(userId) {
  const { data } = await api.get(`/users/${userId}`)
  return data
}

export async function submitVerification(formData) {
  const { data } = await api.post('/users/verify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/** Upload a single avatar image — returns the Cloudinary URL */
export async function uploadAvatar(file) {
  const form = new FormData()
  form.append('avatar', file)
  const { data } = await api.post('/upload/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url          // { url: 'https://res.cloudinary.com/...' }
}
