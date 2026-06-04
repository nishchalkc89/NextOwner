import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, Package, Clock, CheckCircle2, XCircle,
  LogOut, Eye, Trash2, BarChart2, BadgeCheck, Ban,
  LayoutDashboard, AlertCircle, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE = import.meta.env.VITE_API_BASE || '/api'
function adminApi() {
  return axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
  })
}

/* ─── Sidebar nav items ────────────────────────────────── */
const SIDEBAR_NAV = [
  { id: 'overview',      icon: LayoutDashboard, label: 'Overview'      },
  { id: 'verifications', icon: BadgeCheck,      label: 'Verifications' },
  { id: 'products',      icon: Package,         label: 'Products'      },
  { id: 'users',         icon: Users,           label: 'Users'         },
]

/* ─── Stat card ───────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, gradient, sub }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="rounded-[20px] p-5 relative overflow-hidden"
      style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15 blur-xl"
        style={{ background: color }} />
      <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4"
        style={{ background: gradient }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-white font-black text-[28px] leading-none tracking-tight">{value ?? '—'}</p>
      <p className="text-gray-500 text-[12px] mt-1.5 font-medium">{label}</p>
      {sub && <p className="text-gray-700 text-[10px] mt-1">{sub}</p>}
    </motion.div>
  )
}

/* ─── Empty state ─────────────────────────────────────── */
function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Icon size={26} className="text-gray-700" />
      </div>
      <p className="text-white font-bold text-sm">{title}</p>
      <p className="text-gray-600 text-[11px] mt-1">{sub}</p>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate  = useNavigate()
  const [tab,      setTab]     = useState('overview')
  const [pending,  setPending] = useState([])
  const [products, setProducts] = useState([])
  const [users,    setUsers]   = useState([])
  const [stats,    setStats]   = useState({})
  const [loading,  setLoading] = useState(true)
  const [preview,  setPreview] = useState(null)
  const [notes,    setNotes]   = useState({})  // { [userId]: string }

  const a = adminApi()

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) { navigate('/admin'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, v, p, u] = await Promise.all([
        a.get('/admin/stats'),
        a.get('/admin/verifications'),
        a.get('/admin/products?limit=50'),
        a.get('/admin/users?limit=50'),
      ])
      setStats(s.data)
      setPending(v.data)
      setProducts(p.data.products || [])
      setUsers(u.data.users || [])
    } catch {
      toast.error('Could not load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerif = async (userId, action) => {
    try {
      await a.put(`/admin/verifications/${userId}`, { action, notes: notes[userId] || '' })
      setPending(prev => prev.filter(u => u._id !== userId))
      toast.success(action === 'approve' ? '✅ Approved!' : '❌ Rejected')
    } catch { toast.error('Action failed') }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await a.delete(`/admin/products/${productId}`)
      setProducts(prev => prev.filter(p => p._id !== productId))
      toast.success('Product removed')
    } catch { toast.error('Delete failed') }
  }

  const handleBanUser = async (userId) => {
    try {
      await a.put(`/admin/users/${userId}/ban`)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, banned: true } : u))
      toast.success('User banned')
    } catch { toast.error('Ban failed') }
  }

  const handleUnbanUser = async (userId) => {
    try {
      await a.put(`/admin/users/${userId}/unban`)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, banned: false } : u))
      toast.success('User unbanned ✅')
    } catch { toast.error('Unban failed') }
  }

  const logout = () => { localStorage.removeItem('admin_token'); navigate('/admin') }

  /* ── Layout ── */
  return (
    <div className="min-h-screen flex" style={{ background: '#06060c' }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 sticky top-0 h-screen"
        style={{ background: '#080810', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo area */}
        <div className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.4),rgba(251,146,60,0.15))', border: '1px solid rgba(249,115,22,0.35)' }}>
            <Shield size={15} className="text-orange-400" />
          </div>
          <div>
            <p className="text-white font-black text-[13px] leading-none">Admin</p>
            <p className="text-gray-600 text-[9px] mt-0.5">NextOwner Control</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {SIDEBAR_NAV.map(({ id, icon: Icon, label }) => {
            const active = tab === id
            const badge  = id === 'verifications' ? pending.length : 0
            return (
              <motion.button key={id} whileTap={{ scale: 0.95 }}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left transition-colors"
                style={active
                  ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }
                  : { color: '#6b7280', border: '1px solid transparent' }
                }>
                <Icon size={16} strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[12px] font-semibold flex-1">{label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                    style={{ background: '#f97316' }}>{badge > 9 ? '9+' : badge}</span>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] mt-4"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
            <LogOut size={15} />
            <span className="text-[12px] font-semibold">Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-[58px]"
          style={{ background: 'rgba(6,6,12,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Shield size={17} className="text-orange-400" />
            <h1 className="text-white font-black text-[15px]">Admin Panel</h1>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={11} /> Logout
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-7">

          {/* Desktop section title */}
          <div className="hidden lg:flex items-center justify-between mb-7">
            <div>
              <h2 className="text-white font-black text-[22px]">
                {SIDEBAR_NAV.find(n => n.id === tab)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-600 text-[12px] mt-0.5">NextOwner admin panel</p>
            </div>
            <motion.button whileTap={{ scale: 0.93 }} onClick={fetchAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
              Refresh data
            </motion.button>
          </div>

          {/* Mobile tabs */}
          <div className="flex lg:hidden gap-2 mb-5 overflow-x-auto no-scrollbar">
            {SIDEBAR_NAV.map(({ id, label }) => (
              <motion.button key={id} whileTap={{ scale: 0.92 }} onClick={() => setTab(id)}
                className="px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap flex-shrink-0 transition-all"
                style={tab === id
                  ? { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }
                  : { background: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                {label}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 rounded-[20px] animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* ── Overview ── */}
              {tab === 'overview' && (
                <motion.div key="overview"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Users}     label="Total Users"     value={stats.users}    color="#4ade80" gradient="rgba(34,197,94,0.15)"  />
                    <StatCard icon={Package}   label="Total Listings"  value={stats.products} color="#fb923c" gradient="rgba(249,115,22,0.15)" />
                    <StatCard icon={Clock}     label="Pending Verify"  value={pending.length}  color="#facc15" gradient="rgba(234,179,8,0.15)"  />
                    <StatCard icon={BarChart2} label="Messages"        value={stats.messages} color="#c084fc" gradient="rgba(168,85,247,0.15)" />
                  </div>

                  {/* Recent verifications preview */}
                  <div className="rounded-[20px] p-5"
                    style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white font-bold text-sm">Pending Verifications</p>
                      {pending.length > 0 && (
                        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setTab('verifications')}
                          className="text-orange-400 text-[11px] font-semibold flex items-center gap-1">
                          View all <ChevronRight size={12} />
                        </motion.button>
                      )}
                    </div>
                    {pending.length === 0
                      ? <EmptyState icon={CheckCircle2} title="All verified!" sub="No pending verifications" />
                      : pending.slice(0, 3).map(u => (
                        <div key={u._id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[12px] font-semibold truncate">{u.name}</p>
                            <p className="text-gray-600 text-[10px] truncate">{u.university}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleVerif(u._id, 'approve')}
                              className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold"
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                              ✓ Approve
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleVerif(u._id, 'reject')}
                              className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold"
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                              ✗
                            </motion.button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </motion.div>
              )}

              {/* ── Verifications ── */}
              {tab === 'verifications' && (
                <motion.div key="verif"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-3 max-w-2xl">
                  {pending.length === 0
                    ? <EmptyState icon={CheckCircle2} title="All clear!" sub="No pending verifications" />
                    : pending.map((u, idx) => (
                      <motion.div key={u._id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-[20px] p-4"
                        style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {/* ── Header row ── */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-11 h-11 rounded-[13px] flex items-center justify-center flex-shrink-0 font-black text-white"
                            style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-[14px]">{u.name}</p>
                            <p className="text-gray-500 text-[11px]">{u.email}</p>
                            <p className="text-gray-600 text-[10px] mt-0.5 flex items-center gap-1">
                              <BadgeCheck size={10} className="text-orange-400" />
                              {u.university}{u.country ? ` · ${u.country === 'india' ? '🇮🇳' : '🇳🇵'}` : ''}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                            style={{ background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.25)' }}>
                            PENDING
                          </span>
                        </div>

                        {/* ── Student email verification badge ── */}
                        {u.studentEmail && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-3"
                            style={u.studentEmailVerified
                              ? { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)' }
                              : { background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)' }
                            }>
                            {u.studentEmailVerified
                              ? <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                              : <AlertCircle  size={12} className="text-yellow-400 flex-shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold" style={{ color: u.studentEmailVerified ? '#34d399' : '#facc15' }}>
                                {u.studentEmailVerified ? 'Official Email Verified ✓' : 'Email Not Verified'}
                              </p>
                              <p className="text-[11px] truncate" style={{ color: '#8a8a9a' }}>{u.studentEmail}</p>
                            </div>
                          </div>
                        )}

                        {/* ── ID card image ── */}
                        {u.studentIdImage && (
                          <motion.div whileHover={{ scale: 1.01 }}
                            className="mb-3 rounded-[14px] overflow-hidden cursor-pointer relative"
                            onClick={() => setPreview(u.studentIdImage)}>
                            <img src={u.studentIdImage} alt="Student ID" className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.3)' }}>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <Eye size={11} className="text-white" />
                                <span className="text-white text-[10px] font-bold">Tap to enlarge</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* ── Admin notes ── */}
                        <div className="mb-3">
                          <textarea
                            placeholder="Add review notes (optional)…"
                            value={notes[u._id] || ''}
                            onChange={e => setNotes(n => ({ ...n, [u._id]: e.target.value }))}
                            rows={2}
                            className="w-full rounded-[10px] px-3 py-2 text-[12px] resize-none outline-none placeholder-gray-700"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#a1a1aa' }}
                          />
                        </div>

                        {/* ── Action buttons ── */}
                        <div className="flex gap-2">
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleVerif(u._id, 'approve')}
                            className="flex-1 py-2.5 rounded-[12px] text-[12px] font-bold flex items-center justify-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(22,163,74,0.1))', border: '1px solid rgba(34,197,94,0.28)' }}>
                            <CheckCircle2 size={14} className="text-green-400" />
                            <span className="text-green-300">Approve</span>
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleVerif(u._id, 'reject')}
                            className="flex-1 py-2.5 rounded-[12px] text-[12px] font-bold flex items-center justify-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(220,38,38,0.08))', border: '1px solid rgba(239,68,68,0.25)' }}>
                            <XCircle size={14} className="text-red-400" />
                            <span className="text-red-300">Reject</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              )}

              {/* ── Products ── */}
              {tab === 'products' && (
                <motion.div key="prods"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-2">
                  {products.length === 0
                    ? <EmptyState icon={Package} title="No products" sub="Listings will appear here" />
                    : products.map((p, idx) => (
                      <motion.div key={p._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center gap-3 rounded-[16px] p-3.5"
                        style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-12 h-12 rounded-[12px] overflow-hidden flex-shrink-0"
                          style={{ background: '#1a1a24' }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-gray-700" />
                              </div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] font-semibold truncate">{p.title}</p>
                          <p className="text-orange-400 text-[12px] font-black">₹{Number(p.price).toLocaleString('en-IN')}</p>
                          <p className="text-gray-600 text-[10px] truncate">{p.seller?.name} · {p.category}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <motion.button whileTap={{ scale: 0.85 }}
                            onClick={() => window.open(`/product/${p._id}`, '_blank')}
                            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <Eye size={13} className="text-gray-400" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDeleteProduct(p._id)}
                            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <Trash2 size={13} className="text-red-400" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              )}

              {/* ── Users ── */}
              {tab === 'users' && (
                <motion.div key="usrs"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-2">
                  {users.length === 0
                    ? <EmptyState icon={Users} title="No users" sub="Registered users will appear here" />
                    : users.map((u, idx) => (
                      <motion.div key={u._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center gap-3 rounded-[16px] p-3.5"
                        style={{
                          background: '#0e0e16',
                          border: u.banned ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}>
                          {u.avatar
                            ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white text-[13px] font-semibold truncate">{u.name}</p>
                            {u.isVerified && <BadgeCheck size={12} className="text-green-400 flex-shrink-0" />}
                          </div>
                          <p className="text-gray-500 text-[11px] truncate">{u.email}</p>
                          {u.banned
                            ? <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                                <Ban size={8} /> BANNED
                              </span>
                            : <p className="text-gray-700 text-[10px]">{u.university || '—'}</p>
                          }
                        </div>
                        {u.banned ? (
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => handleUnbanUser(u._id)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 flex-shrink-0"
                            style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }}>
                            ✓ Unban
                          </motion.button>
                        ) : (
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => handleBanUser(u._id)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 flex-shrink-0"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <Ban size={10} /> Ban
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Image preview modal ────────────────────────────── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
            onClick={() => setPreview(null)}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="relative max-w-sm w-full"
              onClick={e => e.stopPropagation()}>
              <img src={preview} alt="Student ID" className="w-full rounded-[20px] shadow-2xl" />
              <div className="absolute inset-0 rounded-[20px]"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
              <button
                onClick={() => setPreview(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm"
                style={{ background: '#ef4444', boxShadow: '0 4px 16px rgba(239,68,68,0.5)' }}>
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
