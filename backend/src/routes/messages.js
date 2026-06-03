const router = require('express').Router()
const Chat = require('../models/Chat')
const Message = require('../models/Message')
const { protect } = require('../middleware/auth')

// GET /api/messages/chats — list user's chats
router.get('/chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar isVerified')
      .populate('product', 'title images price')
      .populate('lastMessage', 'text sender createdAt readBy deliveredTo')
      .sort({ lastMessageAt: -1 })
    res.json(chats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/messages/chats — create or find chat
router.post('/chats', protect, async (req, res) => {
  const { recipientId, productId } = req.body
  if (!recipientId) return res.status(400).json({ message: 'recipientId required' })
  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(productId ? { product: productId } : {}),
    })
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, recipientId],
        product: productId || undefined,
      })
    }
    await chat.populate('participants', 'name avatar isVerified')
    await chat.populate('product', 'title images price')
    res.json(chat)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/messages/chats/:chatId — messages in a chat
router.get('/chats/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
    if (!chat) return res.status(404).json({ message: 'Chat not found' })
    if (!chat.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a participant' })
    }
    const limit  = Math.min(parseInt(req.query.limit) || 60, 100)
    const before = req.query.before  // ISO timestamp cursor for older page loads
    const msgFilter = { chat: req.params.chatId }
    if (before) msgFilter.createdAt = { $lt: new Date(before) }

    const messages = await Message.find(msgFilter)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })   // newest first so cursor works, reversed below
      .limit(limit)

    messages.reverse()   // return oldest→newest for UI

    // mark unread as read
    await Message.updateMany(
      { chat: req.params.chatId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    )

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/messages/chats/:chatId — send message (REST fallback)
router.post('/chats/:chatId', protect, async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ message: 'Text required' })
  try {
    const chat = await Chat.findById(req.params.chatId)
    if (!chat) return res.status(404).json({ message: 'Chat not found' })
    if (!chat.participants.map(String).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a participant' })
    }
    const message = await Message.create({
      chat: req.params.chatId,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    })
    await message.populate('sender', 'name avatar')

    chat.lastMessage = message._id
    chat.lastMessageAt = new Date()
    await chat.save()

    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
