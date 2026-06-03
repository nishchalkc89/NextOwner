import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SquarePen, CheckCheck, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getChats } from '../services/messageService'
import NewChatModal from '../components/ui/NewChatModal'

const FILTERS = ['All', 'Unread']

const GRADIENTS = [
  'linear-gradient(135deg,#7c6af7,#5c4ef2)',
  'linear-gradient(135deg,#f97316,#ea580c)',
  'linear-gradient(135deg,#34d399,#059669)',
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ec4899,#be185d)',
]
const gradient = (i) => GRADIENTS[i % GRADIENTS.length]

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso), now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return d.toLocaleDateString('en-IN', { weekday: 'short' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function ChatSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] p-3.5"
      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.052)' }}>
      <div className="w-12 h-12 rounded-full skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded skeleton" />
        <div className="h-2.5 w-20 rounded skeleton" />
        <div className="h-2.5 w-40 rounded skeleton" />
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { user }   = useAuth()
  const { socket } = useSocket()
  const navigate   = useNavigate()

  const [chats,       setChats]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeFilter,setFilter]      = useState('All')
  const [search,      setSearch]      = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getChats().then(setChats).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!socket) return

    const onChatUpdated = ({ chatId, lastMessage, lastMessageAt }) => {
      setChats(prev => {
        const idx = prev.findIndex(c => c._id === chatId)
        if (idx === -1) { getChats().then(setChats).catch(() => {}); return prev }
        const updated = [...prev]
        updated[idx] = { ...updated[idx], lastMessage, lastMessageAt }
        updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        return updated
      })
    }

    // Other user read MY messages — server sends { chatId, userId }
    const onMessagesRead = ({ chatId: cId, userId }) => {
      if (!cId) return
      setChats(prev => prev.map(c => {
        if (c._id !== cId || !c.lastMessage) return c
        const existing = (c.lastMessage.readBy || []).map(String)
        if (userId && existing.includes(String(userId))) return c
        return {
          ...c,
          lastMessage: {
            ...c.lastMessage,
            readBy: userId ? [...existing, String(userId)] : existing,
          },
        }
      }))
    }

    socket.on('chat_updated',  onChatUpdated)
    socket.on('messages_read', onMessagesRead)
    return () => {
      socket.off('chat_updated',  onChatUpdated)
      socket.off('messages_read', onMessagesRead)
    }
  }, [socket])

  /* Always compare as strings — MongoDB readBy can contain ObjectId objects */
  const myIdStr = String(user?._id || '')
  const isReadByMe = (readBy) => (readBy || []).map(String).includes(myIdStr)

  const unreadCount = chats.reduce((acc, c) => {
    const last = c.lastMessage
    if (!last || isReadByMe(last.readBy)) return acc
    return acc + 1
  }, 0)

  const getOther = (chat) => chat.participants?.find(p => p._id !== user?._id)

  const filtered = chats.filter(c => {
    if (activeFilter === 'Unread') {
      const last = c.lastMessage
      if (!last || isReadByMe(last.readBy)) return false
    }
    if (search) {
      const other = getOther(c)
      const name = other?.name || '', product = c.product?.title || ''
      if (!name.toLowerCase().includes(search.toLowerCase()) && !product.toLowerCase().includes(search.toLowerCase())) return false
    }
    return true
  })

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
      style={{ background: '#0c0c10', paddingTop: 80 }}>
      <div className="text-6xl mb-5">💬</div>
      <h2 className="font-black text-xl" style={{ color: '#eeeef2' }}>Sign in to message</h2>
      <p className="text-sm mt-2 mb-7 text-center" style={{ color: '#55555f' }}>Chat with buyers and sellers</p>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')}
        className="px-10 py-3.5 rounded-2xl gradient-orange text-white font-bold shadow-orange">
        Sign In
      </motion.button>
    </div>
  )

  return (
    <div className="min-h-screen pb-[120px] pt-[70px] lg:pt-[80px] lg:pb-10" style={{ background: '#0c0c10' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <h1 className="font-black text-[22px] leading-none" style={{ color: '#eeeef2' }}>Messages</h1>
          <p className="text-xs mt-1 leading-snug" style={{ color: '#55555f' }}>
            Chat with buyers, sellers and swap partners.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.86 }}
          onClick={() => setShowNewChat(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] flex-shrink-0"
          style={{
            background: 'rgba(124,106,247,0.09)',
            border: '1px solid rgba(124,106,247,0.20)',
            color: '#a79cf9',
          }}
        >
          <SquarePen size={13} />
          <span className="text-xs font-bold">New Chat</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div
          className="flex items-center gap-2.5 rounded-[14px] px-4 h-11"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.082)' }}
        >
          <Search size={14} style={{ color: '#7c6af7', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px]"
            style={{ color: '#eeeef2' }}
          />
          <SlidersHorizontal size={14} style={{ color: '#37373f', flexShrink: 0 }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-3">
        {FILTERS.map(f => {
          const isActive = f === activeFilter
          return (
            <motion.button
              key={f}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
              style={isActive
                ? { background: 'rgba(124,106,247,0.12)', color: '#a79cf9', border: '1px solid rgba(124,106,247,0.22)' }
                : { background: '#13131a', color: '#44444c', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: isActive ? '#7c6af7' : '#f97316' }}
                >
                  {unreadCount}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Chat list */}
      <div className="px-4 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ChatSkeleton key={i} />)
        ) : (
          <AnimatePresence>
            {filtered.map((chat, i) => {
              const other   = getOther(chat)
              const lastMsg = chat.lastMessage
              const isUnread = lastMsg && !isReadByMe(lastMsg.readBy)

              return (
                <motion.button
                  key={chat._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    // Optimistically mark as read → badge disappears instantly
                    setChats(prev => prev.map(c => {
                      if (c._id !== chat._id || !c.lastMessage) return c
                      const readArr = (c.lastMessage.readBy || []).map(String)
                      if (readArr.includes(String(user?._id))) return c
                      return {
                        ...c,
                        lastMessage: {
                          ...c.lastMessage,
                          readBy: [...(c.lastMessage.readBy || []), String(user._id)],
                        },
                      }
                    }))
                    navigate(`/messages/${chat._id}`)
                  }}
                  className="w-full flex items-center gap-3.5 rounded-[18px] p-3.5 text-left"
                  style={{
                    background: isUnread ? 'rgba(124,106,247,0.04)' : '#13131a',
                    border: isUnread
                      ? '1px solid rgba(124,106,247,0.14)'
                      : '1px solid rgba(255,255,255,0.052)',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: gradient(i) }}
                  >
                    {other?.avatar
                      ? <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                      : initials(other?.name)
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-[13px]" style={{ color: '#eeeef2' }}>
                        {other?.name || 'Unknown'}
                      </span>
                      <span className="text-[11px]" style={{ color: '#37373f' }}>
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    {chat.product && (
                      <p className="text-[11px] font-semibold mb-0.5 truncate" style={{ color: '#7c6af7' }}>
                        {chat.product.title}
                      </p>
                    )}
                    <p className="text-[12px] truncate leading-snug" style={{ color: '#44444c' }}>
                      {lastMsg?.text || 'No messages yet'}
                    </p>
                  </div>

                  {/* Status indicator */}
                  {isUnread ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#7c6af7', boxShadow: '0 0 8px rgba(124,106,247,0.5)' }}
                    >
                      <span className="text-white text-[9px] font-black">1</span>
                    </div>
                  ) : (
                    <CheckCheck size={14} style={{ color: '#34d399', flexShrink: 0, opacity: 0.65 }} />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-bold" style={{ color: '#eeeef2' }}>No conversations yet</p>
            <p className="text-sm mt-1" style={{ color: '#55555f' }}>
              {search ? 'No results for your search' : 'Browse products and message a seller to start chatting'}
            </p>
            {!search && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}
                className="mt-5 px-6 py-2.5 rounded-full text-sm font-semibold gradient-orange text-white shadow-orange">
                Browse Products
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      </AnimatePresence>
    </div>
  )
}
