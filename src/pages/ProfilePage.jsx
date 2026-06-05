import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BadgeCheck, LogOut, ChevronRight, Edit3, Camera,
  Package, Heart, Tag, MessageSquare, Shield,
  Settings, HelpCircle, X, Check, User, Clock,
  TrendingUp, Eye, Trash2, CheckCircle2, AlertTriangle,
  Share2, MoreVertical, PenLine,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getUserProducts, getProduct, updateProduct,
  deleteProduct, toggleWishlist, uploadImages,
} from '../services/productService'
import { updateProfile, getProfile, uploadAvatar } from '../services/userService'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import UniversitySelect from '../components/ui/UniversitySelect'
import CountryPicker from '../components/ui/CountryPicker'
import toast from 'react-hot-toast'

const CONDITION_COLORS = {
  'Brand New': '#34d399', 'Like New': '#34d399',
  'Good': '#f97316', 'Fair': '#facc15', 'Poor': '#f87171',
}

/* ── Verification badge ── */
function VerifBadge({ status }) {
  const map = {
    verified:     { label: 'Verified',  color: '#4ade80', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.22)'  },
    under_review: { label: 'Pending',   color: '#facc15', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.22)'  },
    rejected:     { label: 'Rejected',  color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.22)'  },
  }
  const s = status === true ? 'verified' : (map[status] ? status : null)
  if (!s) return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(255,255,255,0.06)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
      Not Verified
    </span>
  )
  const { label, color, bg, border } = map[s]
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      {label}
    </span>
  )
}

/* ── Seller listing card — edit / delete / mark-sold inline ── */
function ListingCard({ product: p, onEdit, onDelete, onToggleSold }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const isSold = p.status === 'sold'

  const handleShare = () => {
    const url = `${window.location.origin}/product/${p._id}`
    if (navigator.share) {
      navigator.share({ title: p.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[16px] overflow-hidden group"
      style={{
        background: '#13131a',
        border: `1px solid ${isSold ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* Image */}
      <div
        className="relative cursor-pointer aspect-square overflow-hidden"
        onClick={() => navigate(`/product/${p._id}`)}
      >
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: '#1c1c24' }}>
              <Package size={28} style={{ color: '#44444c' }} />
            </div>
        }
        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <span className="font-black text-[13px] px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.20)', color: '#34d399', border: '1px solid rgba(52,211,153,0.35)' }}>
              SOLD
            </span>
          </div>
        )}
        {/* Views badge */}
        {p.views > 0 && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.65)' }}>
            <Eye size={9} style={{ color: '#a1a1aa' }} />
            <span className="text-[9px]" style={{ color: '#a1a1aa' }}>{p.views}</span>
          </div>
        )}
        {/* Three-dot menu */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.65)' }}
        >
          <MoreVertical size={13} className="text-white" />
        </motion.button>
        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.14 }}
              className="absolute top-9 right-1.5 rounded-[12px] overflow-hidden z-20 min-w-[140px]"
              style={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              {[
                { icon: PenLine,      label: 'Edit listing',   color: '#a79cf9', action: () => { setMenuOpen(false); onEdit(p) } },
                { icon: isSold ? CheckCircle2 : Tag,
                  label: isSold ? 'Mark as Active' : 'Mark as Sold',
                  color: isSold ? '#34d399' : '#f97316',
                  action: () => { setMenuOpen(false); onToggleSold(p) } },
                { icon: Share2,       label: 'Share',          color: '#38bdf8', action: () => { setMenuOpen(false); handleShare() } },
                { icon: Trash2,       label: 'Delete',         color: '#f87171', action: () => { setMenuOpen(false); onDelete(p) } },
              ].map(({ icon: Icon, label, color, action }) => (
                <button key={label} onClick={action}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-semibold text-left hover:bg-white/5 transition-colors"
                  style={{ color }}>
                  <Icon size={13} style={{ color }} />
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details */}
      <div className="p-2.5">
        <p className="font-black text-[13px] leading-none mb-1" style={{ color: '#f97316' }}>
          ₹{Number(p.price).toLocaleString('en-IN')}
          {p.negotiable && <span className="ml-1 text-[9px] font-semibold" style={{ color: '#55555f' }}>Negotiable</span>}
        </p>
        <p className="text-[11px] leading-snug truncate" style={{ color: '#eeeef2' }}>{p.title}</p>
        {p.condition && (
          <p className="text-[9px] mt-0.5 font-semibold" style={{ color: CONDITION_COLORS[p.condition] || '#55555f' }}>
            {p.condition}
          </p>
        )}
      </div>

      {/* Quick edit/sold row */}
      <div className="flex border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => onEdit(p)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors hover:bg-white/5"
          style={{ color: '#a79cf9' }}>
          <PenLine size={10} /> Edit
        </button>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
        <button onClick={() => onToggleSold(p)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors hover:bg-white/5"
          style={{ color: isSold ? '#34d399' : '#f97316' }}>
          <Tag size={10} /> {isSold ? 'Active' : 'Sold'}
        </button>
      </div>
    </motion.div>
  )
}

/* ── Wishlist card — with remove button ── */
function WishlistCard({ product: p, onRemove }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[16px] overflow-hidden group"
      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="relative cursor-pointer aspect-square overflow-hidden"
        onClick={() => navigate(`/product/${p._id}`)}>
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: '#1c1c24' }}>
              <Package size={28} style={{ color: '#44444c' }} />
            </div>
        }
        {/* Remove from wishlist */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={e => { e.stopPropagation(); onRemove(p._id) }}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.85)' }}
        >
          <Heart size={12} className="text-white fill-white" />
        </motion.button>
      </div>
      <div className="p-2.5">
        <p className="font-black text-[13px] leading-none mb-1" style={{ color: '#f97316' }}>
          ₹{Number(p.price).toLocaleString('en-IN')}
        </p>
        <p className="text-[11px] leading-snug truncate" style={{ color: '#eeeef2' }}>{p.title}</p>
        {p.seller?.university && (
          <p className="text-[9px] mt-0.5" style={{ color: '#55555f' }}>🎓 {p.seller.university}</p>
        )}
      </div>
    </motion.div>
  )
}

/* ── Edit Listing Modal ── */
function EditListingModal({ product: p, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       p.title       || '',
    description: p.description || '',
    price:       p.price       || '',
    condition:   p.condition   || 'Good',
    negotiable:  p.negotiable  || false,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title required')
    if (!form.price || isNaN(form.price)) return toast.error('Valid price required')
    setSaving(true)
    try {
      const updated = await updateProduct(p._id, { ...form, price: Number(form.price) })
      onSave(updated)
      toast.success('Listing updated!')
      onClose()
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#eeeef2' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-5 max-h-[90vh] overflow-y-auto"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}>

        <div className="flex items-center justify-between mb-4">
          <p className="font-black text-[16px]" style={{ color: '#eeeef2' }}>Edit Listing</p>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={14} style={{ color: '#8a8a9a' }} />
          </motion.button>
        </div>

        <div className="space-y-3">
          {/* Title */}
          <div className="rounded-[12px] px-4 h-11 flex items-center" style={inputStyle}>
            <input type="text" placeholder="Title" value={form.title}
              onChange={e => set('title', e.target.value)}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder-gray-600" style={{ color: '#eeeef2' }} />
          </div>
          {/* Description */}
          <div className="rounded-[12px] p-3.5" style={inputStyle}>
            <textarea placeholder="Description" value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3} className="w-full bg-transparent text-[12px] outline-none resize-none placeholder-gray-600"
              style={{ color: '#eeeef2' }} />
          </div>
          {/* Price */}
          <div className="rounded-[12px] px-4 h-11 flex items-center gap-2" style={inputStyle}>
            <span className="text-[13px] font-bold" style={{ color: '#f97316' }}>₹</span>
            <input type="number" placeholder="Price" value={form.price}
              onChange={e => set('price', e.target.value)}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder-gray-600" style={{ color: '#eeeef2' }} />
          </div>
          {/* Condition */}
          <div className="flex flex-wrap gap-2">
            {['Brand New','Like New','Good','Fair','Poor'].map(c => (
              <button key={c} type="button" onClick={() => set('condition', c)}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
                style={form.condition === c
                  ? { background: 'rgba(249,115,22,0.15)', color: '#fb923c', borderColor: 'rgba(249,115,22,0.35)' }
                  : { background: 'transparent', color: '#55555f', borderColor: 'rgba(255,255,255,0.08)' }}>
                {c}
              </button>
            ))}
          </div>
          {/* Negotiable toggle */}
          <div className="flex items-center justify-between px-4 h-11 rounded-[12px]" style={inputStyle}>
            <span className="text-[12px]" style={{ color: '#eeeef2' }}>Price is negotiable</span>
            <button type="button" onClick={() => set('negotiable', !form.negotiable)}
              className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
              style={{ background: form.negotiable ? '#f97316' : '#37373f' }}>
              <motion.div animate={{ x: form.negotiable ? 22 : 2 }} transition={{ type:'spring', stiffness:500, damping:32 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-[14px] font-bold text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 20px rgba(124,106,247,0.30)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={15} /> Save Changes</>}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ── Delete confirmation modal ── */
function DeleteModal({ product: p, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xs rounded-[22px] p-6 text-center"
        style={{ background: '#13131a', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.10)' }}>
          <AlertTriangle size={24} style={{ color: '#f87171' }} />
        </div>
        <p className="font-black text-[16px] mb-1" style={{ color: '#eeeef2' }}>Delete listing?</p>
        <p className="text-[12px] mb-5" style={{ color: '#55555f' }}>
          "{p.title}" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
            className="flex-1 py-2.5 rounded-[12px] font-semibold text-[12px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#8a8a9a' }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }}
            className="flex-1 py-2.5 rounded-[12px] font-bold text-[12px] text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            {deleting ? '…' : 'Delete'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Edit Profile Modal ── */
function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name: user.name||'', university: user.university||'', country: user.country||'' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      onSave(updated); toast.success('Profile updated!'); onClose()
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-6"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-black text-[17px]" style={{ color: '#eeeef2' }}>Edit Profile</p>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={14} style={{ color: '#8a8a9a' }} />
          </motion.button>
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 px-4 rounded-[12px] h-11"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <User size={13} style={{ color: '#55555f', flexShrink: 0 }} />
            <input type="text" placeholder="Full name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 bg-transparent placeholder-gray-700 text-[13px] outline-none" style={{ color: '#eeeef2' }} />
          </div>
          <CountryPicker value={form.country} onChange={c => setForm(f => ({ ...f, country: c, university: '' }))} label="Country" />
          {form.country && (
            <UniversitySelect value={form.university} onChange={v => setForm(f => ({ ...f, university: v }))}
              country={form.country} placeholder="University / College" />
          )}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-[14px] font-bold text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 20px rgba(124,106,247,0.30)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={15} /> Save Changes</>}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════ Main ═══════════════════════════════════════════ */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate   = useNavigate()
  const avatarRef  = useRef(null)

  const [products,      setProducts]      = useState([])
  const [wishlist,      setWishlist]      = useState([])
  const [loadingP,      setLoadingP]      = useState(true)
  const [loadingW,      setLoadingW]      = useState(false)
  const [activeTab,     setTab]           = useState('listings')
  const [showEdit,      setShowEdit]      = useState(false)
  const [editTarget,    setEditTarget]    = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [uploading,     setUploading]     = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [pendingFile,   setPendingFile]   = useState(null)

  useEffect(() => {
    if (!user?._id) return
    getUserProducts(user._id)
      .then(setProducts).catch(() => {}).finally(() => setLoadingP(false))
  }, [user?._id])

  useEffect(() => {
    if (activeTab !== 'saved' || !user?._id || wishlist.length) return
    setLoadingW(true)
    getProfile()
      .then(u => {
        const ids = u.wishlist?.map(w => w._id || w).filter(Boolean) || []
        if (!ids.length) { setWishlist([]); return }
        return Promise.all(ids.map(id => getProduct(id))).then(prods => setWishlist(prods.filter(Boolean)))
      })
      .catch(() => {}).finally(() => setLoadingW(false))
  }, [activeTab, user?._id])

  /* Listing actions */
  const handleEditSave = useCallback((updated) => {
    setProducts(ps => ps.map(p => p._id === updated._id ? updated : p))
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget._id)
      setProducts(ps => ps.filter(p => p._id !== deleteTarget._id))
      toast.success('Listing removed')
    } catch { toast.error('Delete failed') }
    finally { setDeleteTarget(null) }
  }, [deleteTarget])

  const handleToggleSold = useCallback(async (p) => {
    const newStatus = p.status === 'sold' ? 'active' : 'sold'
    try {
      const updated = await updateProduct(p._id, { status: newStatus })
      setProducts(ps => ps.map(x => x._id === p._id ? updated : x))
      toast.success(newStatus === 'sold' ? 'Marked as sold 🎉' : 'Back to active')
    } catch { toast.error('Update failed') }
  }, [])

  /* Wishlist remove */
  const handleRemoveWishlist = useCallback(async (productId) => {
    try {
      await toggleWishlist(productId)
      setWishlist(wl => wl.filter(p => p._id !== productId))
      toast.success('Removed from wishlist')
    } catch { toast.error('Failed to remove') }
  }, [])

  /* Avatar */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Max 5 MB'); return }
    setAvatarPreview(URL.createObjectURL(file))
    setPendingFile(file)
    if (avatarRef.current) avatarRef.current.value = ''
  }

  const handleAvatarConfirm = async () => {
    if (!pendingFile) return
    setUploading(true)
    try {
      toast.loading('Uploading…', { id: 'av' })
      const url = await uploadAvatar(pendingFile)
      await updateProfile({ avatar: url })
      updateUser({ avatar: url })
      toast.dismiss('av')
      toast.success('Profile photo updated!')
    } catch {
      toast.dismiss('av')
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setAvatarPreview(null)
      setPendingFile(null)
    }
  }

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 pt-[80px]"
      style={{ background: '#0c0c10' }}>
      <div className="text-6xl mb-5">👤</div>
      <h2 className="font-black text-xl" style={{ color: '#eeeef2' }}>You're not logged in</h2>
      <p className="text-sm mt-2 mb-7 text-center" style={{ color: '#55555f' }}>Sign in to manage your listings and profile</p>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')}
        className="px-10 py-3.5 rounded-2xl gradient-orange text-white font-bold shadow-orange">
        Sign In
      </motion.button>
    </div>
  )

  const verifStatus = user.isVerified ? 'verified' : (user.verificationStatus || 'not_submitted')
  const soldCount   = products.filter(p => p.status === 'sold').length
  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/') }

  const QUICK_ACTIONS = [
    { id: 'listings', label: 'My Listings',         sub: 'Manage your items',          icon: Package,       iconBg: 'rgba(52,211,153,0.10)',  iconColor: '#34d399' },
    { id: 'wishlist', label: 'Wishlist',             sub: 'Items you saved',            icon: Heart,         iconBg: 'rgba(249,115,22,0.10)',  iconColor: '#fb923c' },
    { id: 'messages', label: 'Messages',             sub: 'Chat with buyers & sellers', icon: MessageSquare, iconBg: 'rgba(124,106,247,0.10)', iconColor: '#a79cf9', path: '/messages' },
    { id: 'verify',   label: 'Student Verification', sub: 'Get your campus badge',      icon: Shield,        iconBg: 'rgba(52,211,153,0.10)',  iconColor: '#34d399', path: '/verify' },
  ]
  const ACCOUNT_ACTIONS = [
    { id: 'settings', label: 'Settings',       sub: 'Account, privacy & preferences', icon: Settings,   iconBg: 'rgba(255,255,255,0.05)', iconColor: '#8a8a9a', path: '/settings' },
    { id: 'help',     label: 'Help & Support', sub: 'FAQs, report an issue',          icon: HelpCircle, iconBg: 'rgba(255,255,255,0.05)', iconColor: '#8a8a9a', path: '/help'     },
  ]

  const handleQuickAction = (item) => {
    if (item.path) return navigate(item.path)
    if (item.id === 'listings') return setTab('listings')
    if (item.id === 'wishlist') return setTab('saved')
  }

  function TabContent() {
    return (
      <>
        <div className="flex gap-2 mb-4">
          {[['listings', 'My Listings'], ['saved', 'Wishlist']].map(([id, label]) => (
            <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setTab(id)}
              className="px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all"
              style={activeTab === id
                ? { background: 'rgba(124,106,247,0.12)', color: '#a79cf9', borderColor: 'rgba(124,106,247,0.24)' }
                : { background: 'transparent', color: '#55555f', borderColor: 'rgba(255,255,255,0.08)' }}>
              {label}
            </motion.button>
          ))}
        </div>

        {activeTab === 'listings' && (
          loadingP ? <SkeletonGrid count={4} /> :
          products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📦</div>
              <p className="font-bold" style={{ color: '#eeeef2' }}>No listings yet</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/sell')}
                className="mt-4 px-7 py-2.5 rounded-2xl gradient-orange text-white text-sm font-bold shadow-orange">
                List Something Free
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map(p => (
                <ListingCard
                  key={p._id} product={p}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  onToggleSold={handleToggleSold}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && (
          loadingW ? <SkeletonGrid count={4} /> :
          wishlist.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">❤️</div>
              <p className="font-bold" style={{ color: '#eeeef2' }}>Nothing saved yet</p>
              <p className="text-sm mt-1" style={{ color: '#55555f' }}>Tap the heart on any listing to save it</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}
                className="mt-4 px-7 py-2.5 rounded-2xl gradient-orange text-white text-sm font-bold shadow-orange">
                Browse Products
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {wishlist.map(p => (
                <WishlistCard key={p._id} product={p} onRemove={handleRemoveWishlist} />
              ))}
            </div>
          )
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen pb-[120px] pt-[70px] lg:pt-[80px] lg:pb-10" style={{ background: '#0c0c10' }}>

      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      <AnimatePresence>
        {avatarPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.88, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="w-full max-w-sm rounded-[24px] p-6 text-center"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}>
              <p className="font-black text-[16px] mb-5" style={{ color: '#eeeef2' }}>Use this photo?</p>
              <div className="w-28 h-28 rounded-full mx-auto mb-5 overflow-hidden p-[3px]"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}>
                <img src={avatarPreview} alt="preview" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.96 }}
                  onClick={() => { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); setPendingFile(null) }}
                  disabled={uploading}
                  className="flex-1 py-3 rounded-[12px] font-semibold text-[13px] disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#8a8a9a' }}>
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleAvatarConfirm} disabled={uploading}
                  className="flex-1 py-3 rounded-[12px] text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                  {uploading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</> : '✓ Use This Photo'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showEdit     && <EditProfileModal user={user} onSave={(u) => updateUser(u)} onClose={() => setShowEdit(false)} />}
        {editTarget   && <EditListingModal product={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />}
        {deleteTarget && <DeleteModal product={deleteTarget} onConfirm={handleDeleteConfirm} onClose={() => setDeleteTarget(null)} />}
      </AnimatePresence>

      {/* ── MOBILE ── */}
      <div className="lg:hidden px-4 space-y-3">
        {/* Profile card */}
        <div className="relative overflow-hidden rounded-[22px] p-4"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-[72px] h-[72px] rounded-full p-[2.5px]"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}>
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: '#13131a' }}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="font-black text-2xl text-white">{user.name?.[0]?.toUpperCase() || 'S'}</span>
                  }
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => avatarRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-50"
                style={{ background: '#f97316', border: '2px solid #13131a' }}>
                {uploading ? <div className="w-2.5 h-2.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
                  : <Camera size={11} className="text-white" />}
              </motion.button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="font-black text-[16px] leading-tight truncate" style={{ color: '#eeeef2' }}>{user.name}</p>
                {user.isVerified && <BadgeCheck size={14} style={{ color: '#34d399' }} />}
              </div>
              <p className="text-[11px] truncate" style={{ color: '#55555f' }}>@{user.name?.toLowerCase().replace(/\s+/g,'') || 'user'}</p>
              {user.university && <p className="text-[11px] mt-0.5 truncate" style={{ color: '#8a8a9a' }}>🎓 {user.university}</p>}
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-1.5 text-[9px] font-bold"
                  style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)', color: '#34d399' }}>
                  <Shield size={8} /> Verified Student
                </span>
              )}
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] flex-shrink-0 self-start"
              style={{ border: '1px solid rgba(124,106,247,0.30)', color: '#a79cf9' }}>
              <Edit3 size={11} /><span className="text-[10px] font-semibold">Edit</span>
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Listings', value: products.length, icon: Package, iconBg: 'rgba(52,211,153,0.10)', iconColor: '#34d399', tab: 'listings' },
            { label: 'Saved',    value: user.wishlist?.length || 0, icon: Heart, iconBg: 'rgba(249,115,22,0.10)', iconColor: '#fb923c', tab: 'saved' },
            { label: 'Sold',     value: soldCount, icon: Tag, iconBg: 'rgba(124,106,247,0.10)', iconColor: '#a79cf9', tab: null },
          ].map(({ label, value, icon: Icon, iconBg, iconColor, tab }) => (
            <motion.div key={label} whileTap={{ scale: 0.95 }} onClick={() => tab && setTab(tab)}
              className="rounded-[16px] py-3.5 flex flex-col items-center gap-1.5 cursor-pointer"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: iconBg }}>
                <Icon size={14} style={{ color: iconColor }} />
              </div>
              <p className="font-black text-xl leading-none" style={{ color: '#eeeef2' }}>{value}</p>
              <p className="text-[10px]" style={{ color: '#55555f' }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#55555f' }}>Quick Actions</p>
          <div className="rounded-[18px] overflow-hidden" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
            {QUICK_ACTIONS.map(item => (
              <motion.button key={item.id} whileTap={{ scale: 0.98 }} onClick={() => handleQuickAction(item)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 text-left"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                  <item.icon size={15} style={{ color: item.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: '#eeeef2' }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: '#55555f' }}>{item.sub}</p>
                </div>
                {item.id === 'verify' ? <VerifBadge status={verifStatus} /> : <ChevronRight size={13} style={{ color: '#37373f' }} />}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#55555f' }}>Account</p>
          <div className="rounded-[18px] overflow-hidden" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
            {ACCOUNT_ACTIONS.map(item => (
              <motion.button key={item.id} whileTap={{ scale: 0.98 }} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 text-left"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                  <item.icon size={15} style={{ color: item.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: '#eeeef2' }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: '#55555f' }}>{item.sub}</p>
                </div>
                <ChevronRight size={13} style={{ color: '#37373f' }} />
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.10)' }}>
                <LogOut size={15} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-400 text-[13px] font-bold">Logout</p>
                <p className="text-[11px]" style={{ color: '#55555f' }}>Sign out from your account</p>
              </div>
            </motion.button>
          </div>
        </div>

        <div className="pt-2"><TabContent /></div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex gap-7 px-8 max-w-7xl mx-auto items-start">
        <div className="w-[300px] xl:w-[320px] flex-shrink-0 space-y-4" style={{ position: 'sticky', top: 88 }}>
          <div className="relative overflow-hidden rounded-[22px] p-6"
            style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-[88px] h-[88px] rounded-full p-[3px]"
                  style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}>
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                    style={{ background: '#13131a' }}>
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="font-black text-3xl text-white">{user.name?.[0]?.toUpperCase() || 'S'}</span>
                    }
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => avatarRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-50"
                  style={{ background: '#f97316', border: '2px solid #13131a' }}>
                  <Camera size={12} className="text-white" />
                </motion.button>
              </div>
              <p className="font-black text-[18px] leading-tight" style={{ color: '#eeeef2' }}>{user.name}</p>
              {user.isVerified && (
                <div className="flex items-center gap-1.5 mt-1">
                  <BadgeCheck size={14} style={{ color: '#34d399' }} />
                  <span className="text-[11px] font-semibold" style={{ color: '#34d399' }}>Verified Student</span>
                </div>
              )}
              <p className="text-[12px] mt-1" style={{ color: '#55555f' }}>@{user.name?.toLowerCase().replace(/\s+/g,'') || 'user'}</p>
              {user.university && <p className="text-[12px] mt-1.5" style={{ color: '#8a8a9a' }}>🎓 {user.university}</p>}
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowEdit(true)}
                className="mt-4 flex items-center gap-2 px-5 py-2 rounded-[12px] font-bold text-[12px]"
                style={{ border: '1px solid rgba(124,106,247,0.28)', color: '#a79cf9' }}>
                <Edit3 size={12} /> Edit Profile
              </motion.button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Listings', value: products.length, color: '#34d399', icon: Package },
              { label: 'Saved',    value: user.wishlist?.length || 0, color: '#fb923c', icon: Heart },
              { label: 'Sold',     value: soldCount, color: '#a79cf9', icon: TrendingUp },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="rounded-[14px] py-3.5 flex flex-col items-center gap-1.5"
                style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon size={14} style={{ color }} />
                <p className="font-black text-[18px] leading-none" style={{ color }}>{value}</p>
                <p className="text-[10px]" style={{ color: '#55555f' }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[18px] overflow-hidden" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest px-4 pt-4 pb-2" style={{ color: '#55555f' }}>Navigation</p>
            {[...QUICK_ACTIONS, ...ACCOUNT_ACTIONS].map(item => (
              <motion.button key={item.id} whileTap={{ scale: 0.98 }} onClick={() => handleQuickAction(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-left transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                  <item.icon size={14} style={{ color: item.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold" style={{ color: '#eeeef2' }}>{item.label}</p>
                </div>
                {item.id === 'verify' ? <VerifBadge status={verifStatus} /> : <ChevronRight size={12} style={{ color: '#37373f' }} />}
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.10)' }}>
                <LogOut size={14} className="text-red-400" />
              </div>
              <p className="text-red-400 text-[12px] font-bold">Logout</p>
            </motion.button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-black text-[22px]" style={{ color: '#eeeef2' }}>My Dashboard</h1>
              <p className="text-[12px] mt-0.5" style={{ color: '#55555f' }}>Manage your listings, saved items, and activity</p>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/sell')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-bold text-[13px] text-white"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.25)' }}>
              🚀 List an Item
            </motion.button>
          </div>
          <TabContent />
        </div>
      </div>
    </div>
  )
}
