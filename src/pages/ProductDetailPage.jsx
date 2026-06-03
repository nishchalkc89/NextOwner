import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Share2, MapPin, BadgeCheck, MessageCircle, Phone, ChevronLeft, ChevronRight, Eye, Clock, Tag, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProduct, toggleWishlist } from '../services/productService'
import { getOrCreateChat } from '../services/messageService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function ago(date) {
  if (!date) return ''
  const s = (Date.now() - new Date(date)) / 1000
  if (s < 60)    return 'Just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const COND_COLOR = {
  'Brand New': { bg: '#22c55e18', text: '#4ade80', border: '#22c55e28' },
  'Like New':  { bg: '#84cc1618', text: '#a3e635', border: '#84cc1628' },
  'Good':      { bg: '#eab30818', text: '#facc15', border: '#eab30828' },
  'Fair':      { bg: '#f9731618', text: '#fb923c', border: '#f9731628' },
  'Poor':      { bg: '#ef444418', text: '#f87171', border: '#ef444428' },
}

export default function ProductDetailPage() {
  const { id }       = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx,     setImgIdx]     = useState(0)
  const [liked,      setLiked]      = useState(false)
  const [chatLoading,setChatLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    getProduct(id)
      .then(p => { setProduct(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleWishlist = async () => {
    if (!user) { toast.error('Login to save'); navigate('/login'); return }
    try {
      const res = await toggleWishlist(id)
      setLiked(res.wishlisted)
      toast.success(res.wishlisted ? 'Saved ❤️' : 'Removed from saved')
    } catch { toast.error('Try again') }
  }

  const handleChat = async () => {
    if (!user) { toast.error('Login to chat'); navigate('/login'); return }
    if (!product?.seller?._id) { toast.error('Seller info missing'); return }
    if (user._id === product.seller._id || user._id === product.seller) {
      toast.error("You can't message yourself")
      return
    }
    setChatLoading(true)
    try {
      const chat = await getOrCreateChat(product.seller._id || product.seller, product._id)
      navigate(`/messages/${chat._id}`)
    } catch {
      toast.error('Could not open chat. Is the backend running?')
    } finally {
      setChatLoading(false)
    }
  }

  const handleShare = async () => {
    const url  = window.location.href
    const text = `Check out "${product?.title}" for ₹${Number(product?.price).toLocaleString('en-IN')} on NextOwner!`
    if (navigator.share) {
      try { await navigator.share({ title: product?.title, text, url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      } catch {
        toast.error('Could not copy link')
      }
    }
  }

  /* Loading skeleton */
  if (loading) return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="skeleton w-full" style={{ aspectRatio: '1/1' }} />
      <div className="p-5 space-y-4">
        <div className="skeleton h-6 w-3/4 rounded-2xl" />
        <div className="skeleton h-8 w-1/3 rounded-2xl" />
        <div className="skeleton h-4 w-full rounded-2xl" />
        <div className="skeleton h-4 w-5/6 rounded-2xl" />
      </div>
    </div>
  )

  /* Not found */
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: '#0a0a0a' }}>
      <div>
        <p className="text-5xl mb-4">😕</p>
        <p className="text-white font-bold text-lg">Product not found</p>
        <p className="text-gray-500 text-sm mt-1 mb-5">It may have been removed or sold</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-full gradient-orange text-white text-sm font-semibold shadow-orange"
        >
          Go Back
        </motion.button>
      </div>
    </div>
  )

  const images = product.images?.length
    ? product.images
    : [`https://picsum.photos/seed/${product._id}/600/600`]
  const seller  = product.seller || {}
  const cond    = COND_COLOR[product.condition]

  return (
    <div className="min-h-screen pb-[96px]" style={{ background: '#0a0a0a' }}>

      {/* ── Image viewer ── */}
      <div className="relative bg-[#131316]" style={{ aspectRatio: '1/1', maxHeight: '62vw' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={images[imgIdx]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Bottom image fade */}
        <div className="absolute inset-x-0 bottom-0 h-20"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85), transparent)' }} />

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setImgIdx(i => Math.max(0, i - 1))}
              disabled={imgIdx === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronLeft size={18} className="text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
              disabled={imgIdx === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronRight size={18} className="text-white" />
            </motion.button>
          </>
        )}

        {/* Top action bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between p-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          >
            <ArrowLeft size={17} className="text-white" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleShare}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <Share2 size={15} className="text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleWishlist}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <Heart size={15} className={liked ? 'text-red-400 fill-red-400' : 'text-white'} />
            </motion.button>
          </div>
        </div>

        {/* Image counter dot */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-4 flex items-center gap-1">
            {images.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setImgIdx(i)}
                animate={{ width: i === imgIdx ? 16 : 5, opacity: i === imgIdx ? 1 : 0.4 }}
                className="h-[4px] rounded-full bg-white"
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 px-4 py-3 overflow-x-auto no-scrollbar bg-[#0d0d10]">
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => setImgIdx(i)}
              className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all"
              style={{
                border: i === imgIdx ? '2px solid #f97316' : '2px solid transparent',
                opacity: i === imgIdx ? 1 : 0.55,
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Details ── */}
      <div className="px-4 pt-5 space-y-4 max-w-lg mx-auto">

        {/* Title + Price */}
        <div>
          <h1 className="text-white font-black text-xl leading-snug">{product.title}</h1>
          <p className="gradient-text-orange font-black text-3xl mt-2 leading-none">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {product.category && (
              <span className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                <Tag size={9} /> {product.category}
              </span>
            )}
            {product.condition && cond && (
              <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold"
                style={{ background: cond.bg, color: cond.text, border: `1px solid ${cond.border}` }}>
                {product.condition}
              </span>
            )}
            {product.university && (
              <span className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                <MapPin size={9} /> {product.university}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock size={11} />
              <span className="text-[11px]">{ago(product.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Eye size={11} />
              <span className="text-[11px]">{product.views || 0} views</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="glass-card p-4">
            <p className="text-white font-bold text-sm mb-2.5">About this item</p>
            <p className="text-gray-400 text-[13px] leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Seller card */}
        <div className="glass-card p-4 flex items-center gap-3.5">
          {seller.avatar ? (
            <img src={seller.avatar} alt={seller.name}
              className="w-[52px] h-[52px] rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-[52px] h-[52px] rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-orange">
              <span className="text-white font-black text-xl">{(seller.name || 'S')[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-white font-semibold text-[13px]">{seller.name || 'Student'}</span>
              {seller.isVerified && (
                <BadgeCheck size={13} className="text-green-400" />
              )}
            </div>
            <p className="text-gray-500 text-xs">{seller.university || 'Campus'}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/user/${seller._id}`)}
            className="text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            View
          </motion.button>
        </div>
      </div>

      {/* ── Fixed CTA bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 z-40"
        style={{ background: 'linear-gradient(to top, #0a0a0a 60%, transparent)' }}
      >
        <div className="max-w-lg mx-auto flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleChat}
            disabled={chatLoading}
            className="flex-1 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#1c1c22', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            {chatLoading
              ? <Loader2 size={16} className="animate-spin" />
              : <MessageCircle size={16} />
            }
            {chatLoading ? 'Opening…' : 'Chat'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleChat}
            disabled={chatLoading}
            className="flex-1 py-3.5 rounded-2xl gradient-orange text-white font-bold text-sm flex items-center justify-center gap-2 shadow-orange disabled:opacity-60"
          >
            <Phone size={16} /> Contact
          </motion.button>
        </div>
      </div>
    </div>
  )
}
