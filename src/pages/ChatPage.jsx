import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Check, CheckCheck, ImageIcon, MoreVertical } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getChatMessages, getChats, sendMessage } from '../services/messageService'
import toast from 'react-hot-toast'

/* ─── Quick replies ────────────────────────────────────── */
const QUICK_REPLIES = [
  'Hi! Is this still available?',
  "What's your best price?",
  'Can I see more photos?',
  'Is it in good condition?',
  'Can we meet on campus?',
]

/* ─── Helpers ──────────────────────────────────────────── */
const fmt12 = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
const dateLabel = (iso) => {
  if (!iso) return ''
  const d = new Date(iso), now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
}
const sameDay = (a, b) => {
  if (!a || !b) return false
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}
const lastSeenStr = (iso) => {
  if (!iso) return 'Offline'
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000)    return 'just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/* ─── Date separator ───────────────────────────────────── */
function DateSep({ label }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <span className="text-[10px] font-semibold tracking-wider px-1" style={{ color: '#44444c' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
    </div>
  )
}

/* ─── WhatsApp tick ────────────────────────────────────── */
function Tick({ status }) {
  if (status === 'sending')   return <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>●</span>
  if (status === 'sent')      return <Check size={11} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
  if (status === 'delivered') return <CheckCheck size={12} style={{ color: 'rgba(255,255,255,0.38)', flexShrink: 0 }} />
  return <CheckCheck size={12} className="tick-read flex-shrink-0" />
}

/* ─── Small avatar circle ──────────────────────────────── */
function MiniAvatar({ user: u, show }) {
  // Always render a same-size spacer so bubbles stay aligned whether
  // avatar is visible or not
  return (
    <div className="w-[26px] h-[26px] flex-shrink-0 self-end mb-0.5">
      {show && (
        <div
          className="w-[26px] h-[26px] rounded-full overflow-hidden flex items-center justify-center text-white font-bold"
          style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)', fontSize: 10 }}
        >
          {u?.avatar
            ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
            : (u?.name?.[0]?.toUpperCase() ?? '?')
          }
        </div>
      )}
    </div>
  )
}

/* ─── Message bubble ───────────────────────────────────── */
function Bubble({ msg, mine, tail, groupTail, otherUser, otherUserId }) {
  const isSending = !!msg._sending

  const tickStatus = (() => {
    if (!mine) return null
    if (isSending) return 'sending'
    const readBy      = (msg.readBy      || []).map(String)
    const deliveredTo = (msg.deliveredTo || []).map(String)
    if (readBy.includes(String(otherUserId)))      return 'read'
    if (deliveredTo.includes(String(otherUserId))) return 'delivered'
    return 'sent'
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: isSending ? 0.65 : 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
      className={`flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}
      style={{ marginBottom: groupTail ? 10 : 2 }}
    >
      {/* Avatar on the left for the other person's messages only */}
      {!mine && <MiniAvatar user={otherUser} show={tail} />}

      <div
        className="max-w-[72%] lg:max-w-[60%] min-w-[56px] px-3.5 py-2.5 break-words"
        style={mine
          ? {
              background: 'linear-gradient(140deg,#7c6af7 0%,#5c4ef2 100%)',
              color: '#fff',
              borderRadius: tail ? '18px 18px 4px 18px' : '18px 4px 4px 18px',
              boxShadow: '0 2px 14px rgba(124,106,247,0.25)',
            }
          : {
              background: '#1c1c24',
              color: '#dddde4',
              border: '1px solid rgba(255,255,255,0.068)',
              borderRadius: tail ? '18px 18px 18px 4px' : '4px 18px 18px 4px',
            }
        }
      >
        <p className="text-[13.5px] leading-[1.56]">{msg.text}</p>
        <div className={`flex items-center gap-1 mt-[3px] ${mine ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9.5px]" style={{ opacity: mine ? 0.52 : 0.38 }}>{fmt12(msg.createdAt)}</span>
          {mine && <Tick status={tickStatus} />}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main ─────────────────────────────────────────────── */
export default function ChatPage() {
  const { chatId } = useParams()
  const { user }   = useAuth()
  const { socket, onlineUsers } = useSocket()
  const navigate   = useNavigate()

  const [messages,  setMessages]  = useState([])
  const [chat,      setChat]      = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [typing,    setTyping]    = useState(false)

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const typingTimer = useRef(null)
  const sendTimer   = useRef(null)
  const seenIds     = useRef(new Set())
  const myId        = user?._id

  const addMessage = useCallback((msg) => {
    if (!msg?._id) return
    if (seenIds.current.has(msg._id)) return
    seenIds.current.add(msg._id)
    setMessages(prev => [...prev, msg])
  }, [])

  /* Load */
  const loadChat = useCallback(async () => {
    try {
      const [msgs, chats] = await Promise.all([getChatMessages(chatId), getChats()])
      const found = chats.find(c => c._id === chatId) || null
      setChat(found)
      setOtherUser(found?.participants?.find(p => p._id !== myId) || null)
      msgs.forEach(m => seenIds.current.add(m._id))
      setMessages(msgs)
    } catch { toast.error('Could not load chat') }
    finally  { setLoading(false) }
  }, [chatId, myId])
  useEffect(() => { loadChat() }, [loadChat])

  /* Socket */
  useEffect(() => {
    if (!socket) return
    socket.emit('join_chat', chatId)

    const onMessage   = (msg) => {
      const sid = String(msg.sender?._id ?? msg.sender)
      if (sid === String(myId)) return
      addMessage(msg)
    }
    const onTyping    = ({ isTyping }) => setTyping(isTyping)
    const onRead      = ({ chatId: cId }) => {
      if (cId !== chatId) return
      setMessages(prev => prev.map(m => {
        const rid = String(otherUser?._id)
        if ((m.readBy || []).map(String).includes(rid)) return m
        return { ...m, readBy: [...(m.readBy || []), rid] }
      }))
    }
    const onDelivered = ({ chatId: cId }) => {
      if (cId !== chatId) return
      setMessages(prev => prev.map(m => {
        const rid = String(otherUser?._id)
        if ((m.deliveredTo || []).map(String).includes(rid)) return m
        return { ...m, deliveredTo: [...(m.deliveredTo || []), rid] }
      }))
    }

    socket.on('new_message',        onMessage)
    socket.on('typing',             onTyping)
    socket.on('messages_read',      onRead)
    socket.on('messages_delivered', onDelivered)

    return () => {
      socket.emit('leave_chat', chatId)
      socket.off('new_message',        onMessage)
      socket.off('typing',             onTyping)
      socket.off('messages_read',      onRead)
      socket.off('messages_delivered', onDelivered)
    }
  }, [socket, chatId, addMessage, myId, otherUser])

  /* Scroll */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length, typing])
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }))
    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [])

  /* Mark read — on mount, on every new incoming message */
  useEffect(() => {
    if (socket && chatId) socket.emit('mark_read', { chatId })
  }, [socket, chatId, messages.length])

  /* Send */
  const handleSend = useCallback(async (rawText = text) => {
    const msgText = rawText.trim()
    if (!msgText || sending) return
    setText('')
    setSending(true)

    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const optimistic = {
      _id: tempId, chat: chatId,
      sender: { _id: myId, name: user?.name, avatar: user?.avatar },
      text: msgText, createdAt: new Date().toISOString(), _sending: true,
    }
    seenIds.current.add(tempId)
    setMessages(prev => [...prev, optimistic])

    sendTimer.current = setTimeout(() => {
      setSending(false)
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _sending: false } : m))
    }, 8000)

    const replaceOptimistic = (real) => {
      clearTimeout(sendTimer.current)
      setSending(false)
      seenIds.current.add(real._id)
      setMessages(prev => prev.map(m => m._id === tempId ? { ...real } : m))
    }
    const failOptimistic = () => {
      clearTimeout(sendTimer.current)
      setSending(false)
      setMessages(prev => prev.filter(m => m._id !== tempId))
      seenIds.current.delete(tempId)
      setText(msgText)
      toast.error('Failed to send — try again')
    }

    if (socket?.connected) {
      socket.emit('send_message', { chatId, text: msgText }, (ack) => {
        if (ack?.ok && ack.message) replaceOptimistic(ack.message)
        else failOptimistic()
      })
    } else {
      try { replaceOptimistic(await sendMessage(chatId, msgText)) }
      catch { failOptimistic() }
    }

    clearTimeout(typingTimer.current)
    if (socket) socket.emit('typing', { chatId, isTyping: false })
  }, [text, sending, socket, chatId, myId, user])

  const handleChange = (val) => {
    setText(val)
    if (!socket) return
    socket.emit('typing', { chatId, isTyping: true })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => socket.emit('typing', { chatId, isTyping: false }), 1200)
  }

  const isOnline = otherUser && onlineUsers.has(String(otherUser._id))

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0c10' }}>
      <div className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(124,106,247,0.25)', borderTopColor: '#7c6af7' }} />
    </div>
  )

  return (
    <div
      className="flex flex-col h-[100svh] lg:h-full"
      style={{ background: '#0c0c10' }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-3 flex-shrink-0"
        style={{
          height: 64,
          background: 'rgba(11,11,15,0.96)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.052)',
          paddingTop: 'env(safe-area-inset-top,0px)',
        }}
      >
        {/* Back — mobile only */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => navigate('/messages')}
          className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ArrowLeft size={17} style={{ color: '#8a8a9a' }} />
        </motion.button>

        {/* Avatar tap → profile */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={() => otherUser?._id && navigate(`/user/${otherUser._id}`)}
          className="relative flex-shrink-0 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-[14px]"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}
          >
            {otherUser?.avatar
              ? <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
              : (otherUser?.name?.[0]?.toUpperCase() || '?')
            }
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 transition-all"
            style={{
              background: isOnline ? '#34d399' : '#2a2a36',
              borderColor: '#0c0c10',
              boxShadow: isOnline ? '0 0 8px rgba(52,211,153,0.6)' : 'none',
            }}
          />
        </motion.div>

        {/* Name + status */}
        <motion.div
          className="flex-1 min-w-0 cursor-pointer"
          whileTap={{ scale: 0.98 }}
          onClick={() => otherUser?._id && navigate(`/user/${otherUser._id}`)}
        >
          <p className="font-bold text-[14px] leading-tight truncate" style={{ color: '#eeeef2' }}>
            {otherUser?.name || 'Chat'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#34d399' }} />
                <span className="text-[11px] font-medium" style={{ color: '#34d399' }}>Online now</span>
                {otherUser?.university && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full truncate max-w-[110px] flex-shrink-0"
                    style={{ background: 'rgba(124,106,247,0.09)', color: '#a79cf9', border: '1px solid rgba(124,106,247,0.18)' }}
                  >
                    {otherUser.university}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] truncate" style={{ color: '#55555f' }}>
                {otherUser?.lastSeen ? `Last seen ${lastSeenStr(otherUser.lastSeen)}` : otherUser?.university || 'Offline'}
              </span>
            )}
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <MoreVertical size={15} style={{ color: '#44444c' }} />
        </motion.button>
      </div>

      {/* ── Product banner ───────────────────────────────── */}
      {chat?.product && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 flex items-center gap-3 p-3 rounded-[16px] cursor-pointer flex-shrink-0"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.072)' }}
          onClick={() => navigate(`/product/${chat.product._id}`)}
        >
          {chat.product.images?.[0] ? (
            <img src={chat.product.images[0]} alt="" className="w-12 h-12 rounded-[10px] object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,106,247,0.08)' }}>
              <ImageIcon size={16} style={{ color: '#7c6af7' }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: '#d8d8de' }}>{chat.product.title}</p>
            <p className="font-black text-[13px]" style={{ color: '#f97316' }}>
              ₹{Number(chat.product.price || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <span className="text-[10px] flex-shrink-0" style={{ color: '#37373f' }}>View →</span>
        </motion.div>
      )}

      {/* ── Messages ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pt-4 pb-3">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,106,247,0.07)', border: '1px solid rgba(124,106,247,0.14)' }}
            >
              <span className="text-3xl">💬</span>
            </div>
            <p className="font-bold text-sm" style={{ color: '#eeeef2' }}>Start the conversation</p>
            <p className="text-xs mt-1" style={{ color: '#44444c' }}>
              {chat?.product ? `Ask about "${chat.product.title}"` : 'Say hi to get started'}
            </p>
          </motion.div>
        )}

        {messages.map((msg, i) => {
          const prev      = messages[i - 1]
          const next      = messages[i + 1]
          const mine      = String(msg.sender?._id ?? msg.sender) === String(myId)
          const showDate  = i === 0 || !sameDay(prev?.createdAt, msg.createdAt)
          const nextMine  = next && String(next.sender?._id ?? next.sender) === String(myId)
          const tail      = !next || nextMine !== mine || !sameDay(msg.createdAt, next?.createdAt)
          const groupTail = tail
          return (
            <div key={msg._id}>
              {showDate && <DateSep label={dateLabel(msg.createdAt)} />}
              <Bubble msg={msg} mine={mine} tail={tail} groupTail={groupTail} otherUser={otherUser} otherUserId={otherUser?._id} />
            </div>
          )
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="flex justify-start items-end gap-1.5 mb-2"
            >
              {/* Other user's avatar next to typing dots */}
              <div
                className="w-[26px] h-[26px] rounded-full overflow-hidden flex-shrink-0 self-end mb-0.5 flex items-center justify-center text-white font-bold"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)', fontSize: 10 }}
              >
                {otherUser?.avatar
                  ? <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                  : (otherUser?.name?.[0]?.toUpperCase() ?? '?')
                }
              </div>
              <div
                className="px-3.5 py-2.5 rounded-[18px] rounded-bl-[4px] flex gap-1.5 items-center"
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.068)' }}
              >
                {[0,1,2].map(j => (
                  <motion.div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#55555f' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.15, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Quick replies ────────────────────────────────── */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0"
          >
            {QUICK_REPLIES.map(q => (
              <motion.button
                key={q}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSend(q)}
                className="px-3.5 py-2 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{
                  background: 'rgba(124,106,247,0.08)',
                  border: '1px solid rgba(124,106,247,0.18)',
                  color: '#a79cf9',
                  whiteSpace: 'nowrap',
                }}
              >
                {q}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ───────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-3 flex-shrink-0"
        style={{
          background: 'rgba(11,11,15,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.052)',
          paddingTop: 10,
          paddingBottom: 'max(14px, env(safe-area-inset-bottom,14px))',
        }}
      >
        <div
          className="flex-1 flex items-center px-4 rounded-[22px]"
          style={{
            background: '#13131a',
            border: '1px solid rgba(255,255,255,0.082)',
            minHeight: 46,
            transition: 'border-color 0.18s ease',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Message…"
            value={text}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            className="flex-1 bg-transparent text-[13px] py-3"
            style={{ color: '#eeeef2' }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.83 }}
          onClick={() => handleSend()}
          disabled={!text.trim() || sending}
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
          style={{
            background: text.trim()
              ? 'linear-gradient(135deg,#7c6af7,#5c4ef2)'
              : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: text.trim() ? '0 4px 16px rgba(124,106,247,0.35)' : 'none',
          }}
        >
          {sending
            ? <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.28)', borderTopColor: '#fff' }} />
            : <Send size={16} className="text-white ml-0.5" />
          }
        </motion.button>
      </div>
    </div>
  )
}
