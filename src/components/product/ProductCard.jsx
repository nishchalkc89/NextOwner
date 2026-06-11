import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MapPin, BadgeCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toggleWishlist } from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function timeAgo(date) {
  if (!date) return ''
  const s = (Date.now() - new Date(date)) / 1000
  if (s < 60)        return 'Just now'
  if (s < 3600)      return `${Math.floor(s / 60)}m ago`
  if (s < 86400)     return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const COND = {
  'Brand New': { bg: 'rgba(34,197,94,0.22)',  color: '#4ade80',  border: 'rgba(34,197,94,0.32)'  },
  'Like New':  { bg: 'rgba(132,204,22,0.22)', color: '#a3e635',  border: 'rgba(132,204,22,0.32)' },
  'Good':      { bg: 'rgba(234,179,8,0.22)',  color: '#fbbf24',  border: 'rgba(234,179,8,0.32)'  },
  'Fair':      { bg: 'rgba(249,115,22,0.22)', color: '#fb923c',  border: 'rgba(249,115,22,0.32)' },
  'Poor':      { bg: 'rgba(239,68,68,0.18)',  color: '#f87171',  border: 'rgba(239,68,68,0.28)'  },
}

export default function ProductCard({ product = {}, index = 0, compact = false }) {
  const {
    _id, productId,
    title     = 'Product',
    price     = 0,
    images    = [],
    university = '',
    condition  = '',
    seller     = {},
    createdAt,
  } = product

  const id    = _id || productId
  const img   = images?.[0] || `https://picsum.photos/seed/${id || index}/400/400`
  const isNew = createdAt && (Date.now() - new Date(createdAt)) < 86400000
  const cond  = COND[condition]

  const { user } = useAuth()
  const [liked, setLiked] = useState(() =>
    user?.wishlist ? user.wishlist.some(wid => String(wid) === String(id)) : false
  )
  const [imgLoaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  const handleWishlist = async (e) => {
    e.stopPropagation()
    if (!user) { toast.error('Login to save items'); navigate('/login'); return }
    try {
      const res = await toggleWishlist(id)
      setLiked(res.wishlisted)
    } catch { toast.error('Try again') }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.975 }}
      transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/product/${id}`)}
      className="pcard cursor-pointer group"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '1 / 1' }}>
        <div className="absolute inset-0" style={{ background: '#0e0e16' }}>
          {!imgLoaded && <div className="skeleton absolute inset-0" style={{ borderRadius: 0 }} />}
          <img
            src={img} alt={title} loading="lazy" decoding="async"
            onLoad={() => setLoaded(true)}
            className="w-full h-full object-cover"
            style={{
              opacity:    imgLoaded ? 1 : 0,
              transition: 'opacity 0.22s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
              transform:  'scale(1)',
            }}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.45),transparent)' }} />
          <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.28),transparent)' }} />

          {/* Top-left: verified OR new badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {seller?.isVerified ? (
              <div className="flex items-center gap-1 rounded-full px-1.5 py-[3px]"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}>
                <BadgeCheck size={9} style={{ color: '#34d399' }} />
                <span className="text-[8px] font-black tracking-wide" style={{ color: '#34d399' }}>VERIFIED</span>
              </div>
            ) : isNew ? (
              <div className="rounded-full px-1.5 py-[3px]"
                style={{ background: 'rgba(124,106,247,0.80)', backdropFilter: 'blur(8px)' }}>
                <span className="text-[8px] font-black text-white tracking-wide">NEW</span>
              </div>
            ) : null}
          </div>

          {/* Bottom-left: condition */}
          {cond && (
            <div className="absolute bottom-2 left-2 rounded-full px-1.5 py-[3px]"
              style={{ background: cond.bg, border: `1px solid ${cond.border}`, backdropFilter: 'blur(8px)' }}>
              <span className="text-[8px] font-bold" style={{ color: cond.color }}>{condition}</span>
            </div>
          )}

          {/* Top-right: wishlist */}
          <motion.button
            whileTap={{ scale: 0.55 }}
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-[26px] h-[26px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(8px)' }}
          >
            <Heart
              size={11}
              strokeWidth={liked ? 0 : 2}
              className={liked ? 'fill-rose-400 text-rose-400' : 'text-white/65'}
            />
          </motion.button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-[5px]">
        {/* Price — first, most important (OLX pattern) */}
        <p className="font-black leading-none" style={{ color: '#f97316', fontSize: compact ? 12 : 13 }}>
          ₹{Number(price).toLocaleString('en-IN')}
        </p>

        {/* Title */}
        <p className="font-medium leading-[1.3]"
          style={{
            color: '#b4b4be',
            fontSize: compact ? 10 : 11,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
          {title}
        </p>

        {/* Location + time */}
        <div className="flex items-center justify-between gap-1 mt-0.5">
          {university && (
            <div className="flex items-center gap-[3px] min-w-0">
              <MapPin size={7} style={{ color: '#37373f', flexShrink: 0 }} />
              <span className="truncate" style={{ color: '#3d3d48', fontSize: 9.5 }}>
                {university.split(' ')[0]}
              </span>
            </div>
          )}
          <span className="flex-shrink-0 ml-auto" style={{ color: '#37373f', fontSize: 9.5 }}>
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
