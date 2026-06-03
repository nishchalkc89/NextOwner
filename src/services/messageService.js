import api from './api'

export async function getChats() {
  const { data } = await api.get('/messages/chats')
  return data
}

export async function getOrCreateChat(recipientId, productId) {
  const { data } = await api.post('/messages/chats', { recipientId, productId })
  return data
}

export async function getChatMessages(chatId) {
  const { data } = await api.get(`/messages/chats/${chatId}`)
  return data
}

export async function sendMessage(chatId, text) {
  const { data } = await api.post(`/messages/chats/${chatId}`, { text })
  return data
}

export async function searchUsers(q) {
  const { data } = await api.get(`/users/search/users?q=${encodeURIComponent(q)}`)
  return data
}
