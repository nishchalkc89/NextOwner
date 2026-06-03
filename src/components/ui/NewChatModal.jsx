import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MessageSquarePlus, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { searchUsers, getOrCreateChat } from '../../services/messageService'
import toast from 'react-hot-toast'

const GRADIENTS = [
  'linear-gradient(135deg,#f97316,#ea580c)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#22c55e,#16a34a)',
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#eab308,#ca8a04)',
  'linear-gradient(135deg,#ec4899,#be185d)',
]

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function NewChatModal({ onClose }) {
  const navigate     = useNavigate()
  const [query,  setQuery]   = useState('')
  const [users,  setUsers]   = useState([])
  const [loading, setLoading] = useState(false)
  const [opening, setOpening] = useState(null)  // userId being opened
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [])

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setUsers([]); setLoading(false); return }
    setLoading(true)
    try {
      const res = await searchUsers(q.trim())
      setUsers(res)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 350)
  }

  const handleOpenChat = async (userId, idx) => {
    setOpening(userId)
    try {
      const chat = await getOrCreateChat(userId)
      onClose()
      navigate(`/messages/${chat._id}`)
    } catch {
      toast.error('Could not open chat')
      setOpening(null)
    }
  }

  // Close on backdrop tap
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        className="fixed inset-0 z-[80] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          key="sheet"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          className="w-full max-w-lg glass-modal"
          style={{ maxHeight: '80svh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquarePlus size={17} className="text-orange-400" />
              <span className="text-white font-bold text-[15px]">New Conversation</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.84 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <X size={14} className="text-gray-400" />
            </motion.button>
          </div>

          {/* Search input */}
          <div className="px-4 pb-3 flex-shrink-0">
            <div
              className="flex items-center gap-2.5 px-4 h-11 rounded-[14px]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <Search size={14} className="text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search students by name…"
                value={query}
                onChange={handleChange}
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px]"
              />
              {loading && <Loader size={13} className="text-gray-600 animate-spin flex-shrink-0" />}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} className="flex-shrink-0" />

          {/* Results */}
          <div className="overflow-y-auto flex-1 pb-safe" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}>
            {/* Empty / idle state */}
            {!loading && users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                {query.length >= 2 ? (
                  <>
                    <span className="text-4xl mb-3">🔍</span>
                    <p className="text-white font-bold text-sm">No students found</p>
                    <p className="text-gray-500 text-xs mt-1">Try a different name</p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl mb-3">👤</span>
                    <p className="text-white font-semibold text-sm">Find a student</p>
                    <p className="text-gray-500 text-xs mt-1">Type at least 2 characters to search</p>
                  </>
                )}
              </div>
            )}

            {/* User list */}
            {users.map((u, i) => (
              <motion.button
                key={u._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                disabled={!!opening}
                onClick={() => handleOpenChat(u._id, i)}
                className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left transition-colors"
                style={{
                  background: opening === u._id ? 'rgba(249,115,22,0.06)' : 'transparent',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                >
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    : initials(u.name)
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[13px] truncate">{u.name}</p>
                  {u.university && (
                    <p className="text-gray-500 text-[11px] truncate mt-0.5">{u.university}</p>
                  )}
                </div>

                {/* Action */}
                {opening === u._id ? (
                  <Loader size={15} className="text-orange-400 animate-spin flex-shrink-0" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}
                  >
                    <MessageSquarePlus size={12} className="text-orange-400" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
