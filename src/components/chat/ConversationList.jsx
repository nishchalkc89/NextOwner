/**
 * ConversationList — shared between MessagesPage (mobile full-screen)
 * and the desktop split-pane left panel.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SquarePen, CheckCheck, SlidersHorizontal } from 'lucide-react'
import { useNavigate, useMatch } from 'react-router-dom'
import { useAuth }   from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getChats }  from '../../services/messageService'
import NewChatModal  from '../ui/NewChatModal'

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
  if (diff < 7)   return d.toLocaleDateString('en-IN', { weekday: 'short' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function ChatSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-[14px]"
      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.052)' }}>
      <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded skeleton" />
        <div className="h-2.5 w-40 rounded skeleton" />
      </div>
    </div>
  )
}

/**
 * @param {object}  props
 * @param {boolean} props.compact   — true when rendered inside the desktop split panel (narrower)
 * @param {string}  props.activeChatId — currently open chatId (to highlight in list)
 */
export default function ConversationList({ compact = false, activeChatId }) {
  const { user }   = useAuth()
  const { socket } = useSocket()
  const navigate   = useNavigate()

  const [chats,       setChats]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeFilter,setFilter]      = useState('All')
  const [search,      setSearch]      = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  // ── MUST be defined before any useEffect that references it ──
  // (placing it after would cause a TDZ ReferenceError in the dep array)
  const myIdStr = String(user?._id || '')

  // Refs mirror the latest values so socket callbacks never go stale
  const myIdRef         = useRef(myIdStr)
  const activeChatIdRef = useRef(activeChatId)
  useEffect(() => { myIdRef.current         = myIdStr    }, [myIdStr])
  useEffect(() => { activeChatIdRef.current = activeChatId }, [activeChatId])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getChats().then(setChats).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  /* Clear unread badge for the active chat whenever it changes (desktop split-pane) */
  useEffect(() => {
    if (!activeChatId || !user?._id) return
    setChats(prev => prev.map(c => {
      if (c._id !== activeChatId || !c.lastMessage) return c
      const readArr = (c.lastMessage.readBy || []).map(String)
      if (readArr.includes(String(user._id))) return c
      return {
        ...c,
        lastMessage: {
          ...c.lastMessage,
          readBy: [...(c.lastMessage.readBy || []).map(String), String(user._id)],
        },
      }
    }))
  }, [activeChatId, user?._id])

  useEffect(() => {
    if (!socket) return

    // New message → update last message + re-sort
    // If this chat is currently open, immediately patch readBy so badge stays clear
    const onChatUpdated = ({ chatId, lastMessage, lastMessageAt }) => {
      setChats(prev => {
        const idx = prev.findIndex(c => c._id === chatId)
        if (idx === -1) { getChats().then(setChats).catch(() => {}); return prev }

        let patchedMsg = lastMessage
        const me = myIdRef.current
        if (chatId === activeChatIdRef.current && me) {
          const rb = [...(lastMessage?.readBy || []).map(String)]
          if (!rb.includes(me)) rb.push(me)
          patchedMsg = { ...lastMessage, readBy: rb }
        }

        const updated = [...prev]
        updated[idx] = { ...updated[idx], lastMessage: patchedMsg, lastMessageAt }
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

  const isReadByMe = (readBy) =>
    (readBy || []).map(String).includes(myIdStr)

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
      if (!name.toLowerCase().includes(search.toLowerCase()) &&
          !product.toLowerCase().includes(search.toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <div>
          <h1 className="font-black leading-none"
            style={{ color: '#eeeef2', fontSize: compact ? 16 : 22 }}>
            Messages
          </h1>
          {!compact && (
            <p className="text-xs mt-1" style={{ color: '#55555f' }}>
              Chat with buyers, sellers and swap partners.
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.86 }}
          onClick={() => setShowNewChat(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[11px] flex-shrink-0"
          style={{
            background: 'rgba(124,106,247,0.09)',
            border: '1px solid rgba(124,106,247,0.20)',
            color: '#a79cf9',
          }}
        >
          <SquarePen size={12} />
          {!compact && <span className="text-xs font-bold">New</span>}
        </motion.button>
      </div>

      {/* ── Search ── */}
      <div className="px-3 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-[12px] px-3 h-10"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.082)' }}>
          <Search size={13} style={{ color: '#7c6af7', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[12px]"
            style={{ color: '#eeeef2' }}
          />
          {!compact && <SlidersHorizontal size={13} style={{ color: '#37373f', flexShrink: 0 }} />}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 px-3 pb-3 flex-shrink-0">
        {FILTERS.map(f => {
          const isActive = f === activeFilter
          return (
            <motion.button key={f} whileTap={{ scale: 0.9 }} onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
              style={isActive
                ? { background: 'rgba(124,106,247,0.12)', color: '#a79cf9', border: '1px solid rgba(124,106,247,0.22)' }
                : { background: '#13131a', color: '#44444c', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: isActive ? '#7c6af7' : '#f97316' }}>
                  {unreadCount}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ChatSkeleton key={i} />)
        ) : (
          <AnimatePresence>
            {filtered.map((chat, i) => {
              const other    = getOther(chat)
              const lastMsg  = chat.lastMessage
              const isUnread = lastMsg && !isReadByMe(lastMsg.readBy)
              const isActive = chat._id === activeChatId

              return (
                <motion.button
                  key={chat._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 320, damping: 28 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    navigate(`/messages/${chat._id}`)
                    // Optimistically mark this chat as read so the badge disappears immediately
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
                  }}
                  className="w-full flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-all"
                  style={{
                    background: isActive
                      ? 'rgba(124,106,247,0.10)'
                      : isUnread ? 'rgba(124,106,247,0.04)' : '#13131a',
                    border: isActive
                      ? '1px solid rgba(124,106,247,0.24)'
                      : isUnread ? '1px solid rgba(124,106,247,0.12)' : '1px solid rgba(255,255,255,0.052)',
                  }}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: gradient(i) }}>
                    {other?.avatar
                      ? <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                      : initials(other?.name)
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="font-semibold text-[12px] truncate" style={{ color: '#eeeef2' }}>
                        {other?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] flex-shrink-0" style={{ color: '#37373f' }}>
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    {chat.product && (
                      <p className="text-[10px] font-semibold truncate" style={{ color: '#7c6af7' }}>
                        {chat.product.title}
                      </p>
                    )}
                    <p className="text-[11px] truncate leading-snug" style={{ color: '#44444c' }}>
                      {lastMsg?.text || 'No messages yet'}
                    </p>
                  </div>

                  {/* Status */}
                  {isUnread ? (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#7c6af7' }}>
                      <span className="text-white text-[8px] font-black">1</span>
                    </div>
                  ) : isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7c6af7' }} />
                  ) : (
                    <CheckCheck size={12} style={{ color: '#34d399', flexShrink: 0, opacity: 0.55 }} />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-10">
            <div className="text-3xl mb-2">💬</div>
            <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>No conversations</p>
            <p className="text-[11px] mt-1" style={{ color: '#55555f' }}>
              {search ? 'No results' : 'Start a new chat above'}
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      </AnimatePresence>
    </div>
  )
}
