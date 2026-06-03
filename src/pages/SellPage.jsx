import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Image as ImageIcon, Tag, MapPin, AlignLeft,
  Sparkles, ChevronDown, ToggleLeft, ToggleRight,
  Package, X, Star,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { uploadImages, createProduct } from '../services/productService'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { label: 'Electronics',       emoji: '💻' },
  { label: 'Furniture',         emoji: '🪑' },
  { label: 'Books',             emoji: '📚' },
  { label: 'Appliances',        emoji: '🔌' },
  { label: 'Vehicles',          emoji: '🚲' },
  { label: 'Hostel Essentials', emoji: '🛏️' },
  { label: 'Others',            emoji: '📦' },
]

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor']

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[22px] p-5 ${className}`}
      style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-white font-bold text-[13px] mb-3">{children}</p>
  )
}

function GlassInput({ icon: Icon, iconColor = '#6b7280', ...props }) {
  return (
    <div className="flex items-center gap-3 px-4 rounded-[14px] h-12"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {Icon && <Icon size={14} style={{ color: iconColor }} className="flex-shrink-0" />}
      <input
        {...props}
        className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] outline-none"
      />
    </div>
  )
}

export default function SellPage() {
  const [images,     setImages]     = useState([])
  const [form,       setForm]       = useState({
    title: '', description: '', price: '',
    category: '', location: '', condition: 'Good',
    brand: '', usageDuration: '',
  })
  const [negotiable, setNegotiable] = useState(false)
  const [showCatDD,  setShowCatDD]  = useState(false)
  const [showCondDD, setShowCondDD] = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files || [])
    const newImgs = files.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setImages(prev => [...prev, ...newImgs].slice(0, 5))
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!images.length)     return toast.error('Add at least one photo')
    if (!form.category)     return toast.error('Select a category')
    if (!form.title.trim()) return toast.error('Add a title')
    setUploading(true)
    try {
      const files = images.map(i => i.file).filter(Boolean)
      let imageUrls = images.filter(i => i.url?.startsWith('http')).map(i => i.url)
      if (files.length) {
        toast.loading('Uploading photos…', { id: 'upload' })
        const uploaded = await uploadImages(files)
        toast.dismiss('upload')
        imageUrls = [...imageUrls, ...uploaded]
      }
      if (!imageUrls.length) return toast.error('Image upload failed')
      const product = await createProduct({
        ...form,
        price: Number(form.price),
        images: imageUrls,
        negotiable,
      })
      toast.success('Listed successfully! 🎉')
      navigate(`/product/${product._id}`)
    } catch (err) {
      toast.dismiss('upload')
      toast.error(err.response?.data?.message || 'Failed to list product')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen pb-[120px]" style={{ background: '#0a0a0a', paddingTop: 70 }}>

      {/* ── Hero ── */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-black leading-tight">
            <span className="text-white">Sell </span>
            <span style={{
              background: 'linear-gradient(90deg, #f97316, #22c55e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Your Item</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1 leading-snug">
            List for free · Reach 10,000+ students nearby
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(34,197,94,0.15))', border: '1px solid rgba(249,115,22,0.2)' }}
        >
          <Package size={22} className="text-orange-400" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-4 max-w-md mx-auto">

        {/* ── Upload Photos ── */}
        <Card>
          <SectionLabel>Upload Photos</SectionLabel>

          {/* Photo slots */}
          <div className="flex gap-2.5 mb-4 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5">
            {/* Add button */}
            <label
              className="w-[72px] h-[72px] rounded-[16px] flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer"
              style={{ border: '2px dashed rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.06)' }}
            >
              <input type="file" accept="image/*" multiple onChange={handleImagePick} className="hidden" />
              <Camera size={20} className="text-orange-400" />
              <span className="text-orange-400 text-[9px] font-bold">
                {images.length}/5
              </span>
            </label>

            {/* Preview slots */}
            {images.map((img, i) => (
              <div key={i} className="relative flex-shrink-0 w-[72px] h-[72px]">
                <img
                  src={img.preview || img.url}
                  alt=""
                  className="w-full h-full object-cover rounded-[16px]"
                />
                {i === 0 && (
                  <div
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                    style={{ background: '#f97316' }}
                  >
                    <Star size={7} className="text-white" fill="white" />
                    <span className="text-white text-[8px] font-black">Cover</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#ef4444', border: '2px solid #0a0a0a' }}
                >
                  <X size={9} className="text-white" />
                </button>
              </div>
            ))}

            {/* Empty dashed slots */}
            {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-[72px] h-[72px] rounded-[16px] flex-shrink-0"
                style={{ border: '2px dashed rgba(255,255,255,0.08)' }}
              />
            ))}
          </div>

          {/* Camera / Gallery buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <label
              className="flex items-center justify-center gap-2 py-3 rounded-[14px] cursor-pointer"
              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.22)' }}
            >
              <input type="file" accept="image/*" capture="environment" onChange={handleImagePick} className="hidden" />
              <Camera size={14} className="text-orange-400" />
              <span className="text-orange-400 text-xs font-bold">Take Photo</span>
            </label>
            <label
              className="flex items-center justify-center gap-2 py-3 rounded-[14px] cursor-pointer"
              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <input type="file" accept="image/*" multiple onChange={handleImagePick} className="hidden" />
              <ImageIcon size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-bold">Gallery</span>
            </label>
          </div>
        </Card>

        {/* ── Item Details ── */}
        <Card>
          <SectionLabel>Item Details</SectionLabel>
          <div className="space-y-3">

            {/* Title */}
            <GlassInput
              icon={Tag}
              iconColor="#fb923c"
              type="text"
              placeholder="Item title (e.g. MacBook Air M2)"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              maxLength={80}
            />

            {/* Description */}
            <div
              className="flex gap-3 px-4 py-3.5 rounded-[14px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <AlignLeft size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
              <textarea
                placeholder="Describe your item — condition, what's included, age…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                required
                rows={3}
                maxLength={800}
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] resize-none leading-relaxed outline-none"
              />
            </div>

            {/* Category dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowCatDD(v => !v); setShowCondDD(false) }}
                className="w-full flex items-center justify-between px-4 h-12 rounded-[14px] text-[13px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: form.category ? '#fff' : '#4b5563' }}
              >
                <span>
                  {form.category
                    ? `${CATEGORIES.find(c => c.label === form.category)?.emoji} ${form.category}`
                    : 'Select Category'}
                </span>
                <ChevronDown size={14} className="text-gray-500" style={{ transform: showCatDD ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <AnimatePresence>
                {showCatDD && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-[16px] overflow-hidden z-20"
                    style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                  >
                    {CATEGORIES.map(c => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => { set('category', c.label); setShowCatDD(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-left border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.04]"
                        style={{ color: form.category === c.label ? '#fb923c' : '#d1d5db' }}
                      >
                        <span>{c.emoji}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Condition dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowCondDD(v => !v); setShowCatDD(false) }}
                className="w-full flex items-center justify-between px-4 h-12 rounded-[14px] text-[13px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
              >
                <span>{form.condition}</span>
                <ChevronDown size={14} className="text-gray-500" style={{ transform: showCondDD ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <AnimatePresence>
                {showCondDD && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-[16px] overflow-hidden z-20"
                    style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                  >
                    {CONDITIONS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { set('condition', c); setShowCondDD(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-left border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.04]"
                        style={{ color: form.condition === c ? '#4ade80' : '#d1d5db' }}
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price */}
            <div
              className="flex items-center gap-2.5 px-4 rounded-[14px] h-12"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-orange-400 font-black text-base leading-none flex-shrink-0">₹</span>
              <input
                type="number"
                placeholder="Set your price"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                required
                min={0}
                className="flex-1 min-w-0 bg-transparent text-white placeholder-gray-600 text-[13px] outline-none"
              />
            </div>

            {/* Negotiable toggle — full row, no overflow */}
            <button
              type="button"
              onClick={() => setNegotiable(v => !v)}
              className="w-full flex items-center justify-between px-4 h-12 rounded-[14px] transition-all"
              style={negotiable
                ? { background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.28)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <div className="flex items-center gap-2.5">
                {negotiable
                  ? <ToggleRight size={18} className="text-green-400 flex-shrink-0" />
                  : <ToggleLeft size={18} className="text-gray-600 flex-shrink-0" />
                }
                <span className="text-[13px] font-semibold" style={{ color: negotiable ? '#4ade80' : '#6b7280' }}>
                  Negotiable Price
                </span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={negotiable
                  ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                  : { background: 'rgba(255,255,255,0.06)', color: '#6b7280' }
                }>
                {negotiable ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </Card>

        {/* ── Location ── */}
        <Card>
          <SectionLabel>Location</SectionLabel>
          <GlassInput
            icon={MapPin}
            iconColor="#fb923c"
            type="text"
            placeholder="e.g. Block A, Hostel 3, Gate 2"
            value={form.location}
            onChange={e => set('location', e.target.value)}
          />
        </Card>

        {/* ── Additional Info ── */}
        <Card>
          <SectionLabel>Additional Information <span className="text-gray-600 font-normal text-[11px]">(Optional)</span></SectionLabel>
          <div className="space-y-3">
            <GlassInput
              type="text"
              placeholder="Brand (e.g. Apple, Samsung)"
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
            />
            <GlassInput
              type="text"
              placeholder="Usage Duration (e.g. 1 year)"
              value={form.usageDuration}
              onChange={e => set('usageDuration', e.target.value)}
            />
          </div>
        </Card>

        {/* ── CTA ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={uploading}
          className="w-full py-4 rounded-[20px] text-white font-black text-[15px] disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #22c55e 100%)',
            boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
          }}
        >
          <Sparkles size={17} />
          {uploading ? 'Publishing…' : 'Preview & Post Listing'}
        </motion.button>

        <div className="h-2" />
      </form>
    </div>
  )
}
