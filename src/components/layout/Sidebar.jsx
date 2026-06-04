import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Search, PackagePlus, MessageSquare, User,
  Bell, Settings, BadgeCheck, ChevronRight,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const NAV = [
  { icon: Home,          label: 'Home',     path: '/'          },
  { icon: Search,        label: 'Explore',  path: '/search'    },
  { icon: PackagePlus,   label: 'Sell',     path: '/sell',  isSell: true },
  { icon: MessageSquare, label: 'Messages', path: '/messages'  },
  { icon: User,          label: 'Profile',  path: '/profile'   },
]

export default function Sidebar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    api.get('/notifications')
      .then(r => setUnread(r.data.filter(n => !n.read).length))
      .catch(() => {})
  }, [user])

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 w-[240px]"
      style={{
        background: '#0a0a0e',
        borderRight: '1px solid rgba(255,255,255,0.052)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5 flex-shrink-0"
        style={{ height: 68, borderBottom: '1px solid rgba(255,255,255,0.052)' }}
      >
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="NextOwner" style={{ height: 52, width: 'auto', maxWidth: 176 }} />
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path, isSell }) => {
          const active = path === '/'
            ? pathname === '/'
            : pathname === path || pathname.startsWith(path + '/')

          if (isSell) return (
            <motion.button
              key={path}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left my-1"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.14), rgba(234,88,12,0.08))',
                border: '1px solid rgba(249,115,22,0.22)',
                color: '#fb923c',
              }}
            >
              <Icon size={16} strokeWidth={2.1} />
              <span className="text-[13px] font-semibold">{label}</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full sell-btn-dot"
                style={{ background: '#f97316', boxShadow: '0 0 6px rgba(249,115,22,0.8)' }} />
            </motion.button>
          )

          return (
            <motion.button
              key={path}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left relative transition-colors"
              style={active
                ? {
                    background: 'rgba(124,106,247,0.09)',
                    color: '#a79cf9',
                    border: '1px solid rgba(124,106,247,0.18)',
                  }
                : {
                    color: '#55555f',
                    border: '1px solid transparent',
                  }
              }
            >
              {active && (
                <motion.div
                  layoutId="sidebar-bg"
                  className="absolute inset-0 rounded-[12px]"
                  style={{ background: 'rgba(124,106,247,0.09)', zIndex: -1 }}
                />
              )}
              <Icon size={16} strokeWidth={active ? 2.3 : 1.8} />
              <span className="text-[13px] font-semibold">{label}</span>
              {/* unread badge */}
              {path === '/messages' && unread > 0 && !active && (
                <span
                  className="ml-auto min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black text-white px-1"
                  style={{ background: '#7c6af7' }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.052)' }}>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/notifications')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left transition-colors relative"
          style={{ color: '#55555f', border: '1px solid transparent' }}
        >
          <div className="relative">
            <Bell size={16} strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                style={{ background: '#7c6af7' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <span className="text-[13px] font-semibold">Notifications</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left"
          style={{ color: '#55555f', border: '1px solid transparent' }}
        >
          <Settings size={16} strokeWidth={1.8} />
          <span className="text-[13px] font-semibold">Settings</span>
        </motion.button>

        {/* User card */}
        {user && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-[12px] mt-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}
            >
              {user.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user.name?.[0]?.toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1">
                <p className="text-[12px] font-semibold truncate" style={{ color: '#eeeef2' }}>{user.name}</p>
                {user.isVerified && <BadgeCheck size={10} style={{ color: '#34d399', flexShrink: 0 }} />}
              </div>
              <p className="text-[10px] truncate" style={{ color: '#55555f' }}>
                {user.university || 'NextOwner'}
              </p>
            </div>
            <ChevronRight size={12} style={{ color: '#37373f', flexShrink: 0 }} />
          </motion.button>
        )}
      </div>
    </aside>
  )
}
