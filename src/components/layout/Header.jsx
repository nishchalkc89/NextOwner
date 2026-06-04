import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import api from '../../services/api'

export default function Header({ desktopMode = false }) {
  const navigate         = useNavigate()
  const { user }         = useAuth()
  const { socket }       = useSocket()
  const [unread, setUnread] = useState(0)

  // Fetch unread count
  useEffect(() => {
    if (!user) { setUnread(0); return }
    api.get('/notifications')
      .then(r => setUnread(r.data.filter(n => !n.read).length))
      .catch(() => {})
  }, [user])

  // Real-time increment
  useEffect(() => {
    if (!socket) return
    const handler = () => setUnread(n => n + 1)
    socket.on('notification', handler)
    return () => socket.off('notification', handler)
  }, [socket])

  /* ── Desktop top bar ── */
  if (desktopMode) {
    return (
      <div className="flex items-center justify-between w-full h-full px-6">

        {/* Search */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/search')}
          className="flex items-center gap-2.5 px-4 h-9 rounded-[12px] text-[12px] transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#44444c',
            minWidth: 240,
          }}
        >
          <Search size={13} style={{ color: '#55555f' }} />
          <span>Search products, universities…</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-[6px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#37373f', border: '1px solid rgba(255,255,255,0.06)' }}>
            ⌘K
          </span>
        </motion.button>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">

          {/* List CTA */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/sell')}
            className="flex items-center gap-1.5 px-4 h-9 rounded-[10px] font-bold text-[12px]"
            style={{
              background: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(234,88,12,0.12))',
              border: '1px solid rgba(249,115,22,0.28)',
              color: '#fb923c',
            }}
          >
            <Plus size={13} />
            List for Free
          </motion.button>

          {/* Bell */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { setUnread(0); navigate('/notifications') }}
            className="relative w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Bell size={15} style={{ color: '#8a8a9a' }} />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 text-white font-black"
                style={{ background: '#7c6af7', fontSize: 9, boxShadow: '0 0 8px rgba(124,106,247,0.5)' }}
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </motion.button>

          {/* Avatar */}
          {user && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}
            >
              {user.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user.name?.[0]?.toUpperCase()
              }
            </motion.button>
          )}

          {!user && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate('/login')}
              className="px-4 h-9 rounded-[10px] font-bold text-[12px]"
              style={{
                background: 'rgba(124,106,247,0.10)',
                border: '1px solid rgba(124,106,247,0.22)',
                color: '#a79cf9',
              }}
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    )
  }

  /* ── Mobile header ── */
  return (
    <header
      className="glass-header fixed top-0 left-0 right-0 z-50"
      style={{
        /* Extend background behind notch / status bar on iOS */
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div
        className="max-w-lg mx-auto flex items-center justify-between px-5"
        style={{ height: 56 }}
      >
        {/* Logo */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/')}
          className="flex items-center -ml-1"
        >
          <img
            src="/logo.png"
            alt="NextOwner"
            className="object-contain"
            style={{ height: 48, width: 'auto', maxWidth: 160 }}
          />
        </motion.button>

        {/* Bell */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => { setUnread(0); navigate('/notifications') }}
          className="relative w-10 h-10 rounded-[12px] flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Bell size={17} style={{ color: '#c4c4cc' }} />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 text-white font-black"
              style={{ background: '#7c6af7', fontSize: 9, boxShadow: '0 0 10px rgba(124,106,247,0.7)' }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </motion.button>

      </div>
    </header>
  )
}
