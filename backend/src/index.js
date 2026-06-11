const express      = require('express')
const http         = require('http')
const { Server }   = require('socket.io')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const dotenv       = require('dotenv')
const connectDB    = require('./config/db')
const jwt          = require('jsonwebtoken')
const User         = require('./models/User')
const Message      = require('./models/Message')
const Chat         = require('./models/Chat')
const Notification = require('./models/Notification')

dotenv.config()
connectDB()

const app = express()

// Required for Render + express-rate-limit
app.set('trust proxy', 1)

const server = http.createServer(app)

// ── CORS — add VITE_CLIENT_URL / CLIENT_URL from env for production ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://next-owner-two.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : []),
]

console.log('CLIENT_URL:', process.env.CLIENT_URL)
console.log('Allowed Origins:', allowedOrigins)

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
})

// ── Security headers ──
app.use(helmet({ contentSecurityPolicy: false }))   // CSP off — frontend uses inline styles

app.use(cors({ origin: allowedOrigins, credentials: true }))

// ── Reduce body size limits (images go via multipart, not JSON) ──
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// ── Rate limiting ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // 20 attempts per window
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  message: { message: 'Too many OTP requests, please try again later.' },
})
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 120,
  message: { message: 'Too many requests.' },
})

// ── REST Routes ──
app.use('/api/auth',          authLimiter, require('./routes/auth'))
app.use('/api/verify',        otpLimiter,  require('./routes/verify'))
app.use('/api/products',      generalLimiter, require('./routes/products'))
app.use('/api/users',         generalLimiter, require('./routes/users'))
app.use('/api/upload',        require('./routes/upload'))
app.use('/api/messages',      generalLimiter, require('./routes/messages'))
app.use('/api/notifications', generalLimiter, require('./routes/notifications'))
app.use('/api/admin',         authLimiter, require('./routes/admin'))
app.use('/api/support',       require('./routes/support'))
// Seed route: disabled in production via internal NODE_ENV check inside the route itself
app.use('/api/seed',          require('./routes/seed'))

app.get('/api/health', (_, res) => res.json({ status: 'ok', message: 'NextOwner API running ✅' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Server error' })
})

// ── Socket.io Auth Middleware ──
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    const { id } = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    const user = await User.findById(id).select('name avatar')
    if (!user) return next(new Error('User not found'))
    socket.user = user
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

// ── Online users map: userId -> socketId ──
const onlineUsers = new Map()

// ── Socket.io Events ──
io.on('connection', async (socket) => {
  const uid = socket.user._id.toString()

  // Join personal room
  socket.join(`user:${uid}`)

  // Track online presence
  onlineUsers.set(uid, socket.id)
  socket.broadcast.emit('user_status', { userId: uid, online: true })
  socket.emit('online_users', [...onlineUsers.keys()])

  // Mark all pending messages as delivered now that user is online
  try {
    const chats = await Chat.find({ participants: socket.user._id }).select('_id')
    const chatIds = chats.map(c => c._id)
    // Find messages sent to this user that haven't been marked delivered yet
    const msgs = await Message.find({
      chat:        { $in: chatIds },
      sender:      { $ne: socket.user._id },
      deliveredTo: { $ne: socket.user._id },
    }).select('_id chat sender')

    if (msgs.length > 0) {
      await Message.updateMany(
        { _id: { $in: msgs.map(m => m._id) } },
        { $addToSet: { deliveredTo: socket.user._id } }
      )
      // Group by chat to notify each sender
      const chatGroups = {}
      msgs.forEach(m => {
        const cId = m.chat.toString()
        if (!chatGroups[cId]) chatGroups[cId] = new Set()
        chatGroups[cId].add(m.sender.toString())
      })
      Object.entries(chatGroups).forEach(([chatId, senders]) => {
        senders.forEach(senderId => {
          io.to(`user:${senderId}`).emit('messages_delivered', { chatId, by: uid })
        })
      })
    }
  } catch {}


  socket.on('join_chat', (chatId) => socket.join(chatId))
  socket.on('leave_chat', (chatId) => socket.leave(chatId))

  socket.on('send_message', async ({ chatId, text }, ack) => {
    try {
      if (!text?.trim()) return
      const chat = await Chat.findById(chatId).populate('participants', 'name avatar')
      if (!chat) return
      const participantIds = chat.participants.map(p => p._id.toString())
      if (!participantIds.includes(uid)) return

      const recipient = chat.participants.find(p => p._id.toString() !== uid)
      const recipientId = recipient?._id?.toString()
      const isRecipientOnline = recipientId && onlineUsers.has(recipientId)

      const message = await Message.create({
        chat:        chatId,
        sender:      socket.user._id,
        text:        text.trim(),
        readBy:      [socket.user._id],
        // If recipient is online right now, mark as delivered immediately
        deliveredTo: isRecipientOnline
          ? [socket.user._id, recipient._id]
          : [socket.user._id],
      })
      await message.populate('sender', 'name avatar')

      chat.lastMessage   = message._id
      chat.lastMessageAt = new Date()
      await chat.save()

      // Broadcast to chat room (both sender and receiver if both in room)
      io.to(chatId).emit('new_message', message)

      // Build the shared lastMessage payload — includes readBy so clients can
      // correctly decide whether the badge should show or not
      const lastMessagePayload = {
        text:        text.trim(),
        sender:      uid,
        createdAt:   message.createdAt,
        readBy:      message.readBy.map(String),
        deliveredTo: message.deliveredTo.map(String),
      }

      // Update sender's own conversation list immediately
      io.to(`user:${uid}`).emit('chat_updated', {
        chatId,
        lastMessage:   lastMessagePayload,
        lastMessageAt: chat.lastMessageAt,
      })

      // Relay to recipient's personal room so MessagesPage updates live
      if (recipient) {
        // If recipient is online → immediately emit delivered back to sender
        if (isRecipientOnline) {
          io.to(`user:${uid}`).emit('messages_delivered', { chatId, by: recipientId })
        }
        io.to(`user:${recipient._id}`).emit('chat_updated', {
          chatId,
          lastMessage:   lastMessagePayload,
          lastMessageAt: chat.lastMessageAt,
        })

        // Notification
        const notif = await Notification.create({
          user:  recipient._id,
          type:  'message',
          title: `${socket.user.name} sent you a message`,
          body:  text.trim().substring(0, 60),
          link:  `/messages/${chatId}`,
        })
        io.to(`user:${recipient._id}`).emit('notification', notif)
      }

      if (ack) ack({ ok: true, message })
    } catch (err) {
      if (ack) ack({ ok: false, error: err.message })
    }
  })

  socket.on('mark_read', async ({ chatId }) => {
    try {
      await Message.updateMany(
        { chat: chatId, readBy: { $ne: socket.user._id } },
        { $addToSet: { readBy: socket.user._id } }
      )
      // Tell everyone else in the room their messages were read
      socket.to(chatId).emit('messages_read', { chatId, userId: uid })
      // Also tell THIS user's own conversation list to clear the badge immediately
      socket.emit('my_chat_read', { chatId })
    } catch {}
  })

  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('typing', { userId: uid, isTyping })
  })

  socket.on('disconnect', async () => {
    onlineUsers.delete(uid)
    socket.broadcast.emit('user_status', { userId: uid, online: false })
    try { await User.findByIdAndUpdate(uid, { lastSeen: new Date() }) } catch {}
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 NextOwner API running on port ${PORT}`))
