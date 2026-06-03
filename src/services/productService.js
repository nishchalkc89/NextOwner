import api from './api'

export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function createProduct(productData) {
  const { data } = await api.post('/products', productData)
  return data
}

export async function getUserProducts(userId) {
  const { data } = await api.get(`/products/user/${userId}`)
  return data.products
}

export async function toggleWishlist(productId) {
  const { data } = await api.post(`/products/${productId}/wishlist`)
  return data
}

export async function uploadImages(files) {
  const formData = new FormData()
  files.forEach(f => formData.append('images', f))
  const { data } = await api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.urls
}
