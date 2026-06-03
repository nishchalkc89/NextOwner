import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bell, MessageCircle, BadgeCheck, Package, CheckCheck, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const ICON_MAP = {
  message:                { icon: MessageCircle, color: '#c084fc', bg: 'rgba(168,85,247,0.12)' },
  verification_approved:  { icon: BadgeCheck,    color: '#4ade80', bg: 'rgba(34,197,94,0.12)'  },
  verification_rejected:  { icon: BadgeCheck,    color: '#f87171', bg: 'rgba(239,68,68,0.12)'  },
  product_sold:           { icon: Package,       color: '#fb923c', bg: 'rgba(249,115,22,0.12)' },
  system:                 { icon: Bell,          color: '#9ca3af', bg: 'rgba(255,255,255,0.06)' },
}

function timeAgo(iso) {
  if (!iso) return ''
  const s = (Date.now() - new Date(iso)) / 1000
  if (s < 60)    return 'Just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800)return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const { socket }        = useSocket()
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get('/notifications')
      .then(r => setNotifs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  /* real-time: new notification from socket */
  useEffect(() => {
    if (!socket) return
    const handler = (notif) => {
      setNotifs(prev => [notif, ...prev])
    }
    socket.on('notification', handler)
    return () => socket.off('notification', handler)
  }, [socket])

  const markRead = async (id) => {
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    try { await api.put(`/notifications/${id}/read`) } catch {}
  }

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    try { await api.put('/notifications/read') } catch {}
    toast.success('All marked as read')
  }

  const handleTap = (notif) => {
    markRead(notif._id)
    if (notif.link) navigate(notif.link)
  }

  const unreadCount = notifs.filter(n => !n.read).length

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="text-center px-6">
        <Bell size={40} className="text-gray-700 mx-auto mb-4" />
        <p className="text-white font-bold">Sign in to see notifications</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2.5 rounded-full gradient-orange text-white text-sm font-semibold shadow-orange">
          Sign In
        </motion.button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-12" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 h-[58px]"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={16} className="text-white" />
        </motion.button>
        <h1 className="text-white font-bold text-[16px] flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
            {unreadCount} new
          </span>
        )}
        {notifs.length > 0 && (
          <motion.button whileTap={{ scale: 0.88 }} onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
            <CheckCheck size={13} /> All read
          </motion.button>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-[18px]" />)}
          </div>
        ) : notifs.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Bell size={24} className="text-gray-700" />
            </div>
            <p className="text-white font-bold mb-1">No notifications yet</p>
            <p className="text-gray-600 text-[12px] max-w-xs leading-relaxed">
              You'll see messages, verification updates, and alerts here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifs.map((notif, i) => {
                const meta  = ICON_MAP[notif.type] || ICON_MAP.system
                const Icon  = meta.icon
                return (
                  <motion.div
                    key={notif._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleTap(notif)}
                    className="flex items-start gap-3 rounded-[18px] p-4 cursor-pointer relative overflow-hidden"
                    style={{
                      background: notif.read ? '#17171b' : 'rgba(249,115,22,0.06)',
                      border: notif.read ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(249,115,22,0.15)',
                    }}>
                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400" />
                    )}

                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}>
                      <Icon size={17} style={{ color: meta.color }} />
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-white text-[13px] font-semibold leading-snug mb-0.5">{notif.title}</p>
                      {notif.body && <p className="text-gray-500 text-[11px] leading-relaxed truncate">{notif.body}</p>}
                      <p className="text-gray-700 text-[10px] mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
