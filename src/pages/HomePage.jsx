import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, TrendingUp, Loader, ShieldCheck, Zap, Users, X, Navigation, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import HeroBanner          from '../components/ui/HeroBanner'
import CategorySlider      from '../components/ui/CategorySlider'
import ProductCard         from '../components/product/ProductCard'
import { SkeletonGrid }    from '../components/ui/SkeletonCard'
import Footer              from '../components/layout/Footer'
import LocationMapPicker   from '../components/ui/LocationMapPicker'
import { getProducts }     from '../services/productService'
import { useAuth }         from '../context/AuthContext'

const DEMO = [
  { _id:'d1', title:'AirPods Pro 2nd Gen',      price:6999,  university:'IIT Hyderabad',    seller:{isVerified:true},  images:['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80'], createdAt: new Date(Date.now()-120000).toISOString() },
  { _id:'d2', title:'MacBook Air M1',            price:45000, university:'IIT Delhi',        seller:{isVerified:true},  images:['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'], createdAt: new Date(Date.now()-3600000).toISOString() },
  { _id:'d3', title:'Hero MTB 26" Cycle',        price:4200,  university:'VIT Vellore',      seller:{isVerified:true},  images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'], createdAt: new Date(Date.now()-7200000).toISOString() },
  { _id:'d4', title:'Sony WF-1000XM4 Earbuds',  price:8999,  university:'BITS Pilani',      seller:{isVerified:true},  images:['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80'], createdAt: new Date(Date.now()-900000).toISOString() },
  { _id:'d5', title:'Apple Watch SE 44mm',       price:10500, university:'Sharda University',seller:{isVerified:false}, images:['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80'], createdAt: new Date(Date.now()-7200000).toISOString() },
  { _id:'d6', title:'Canon EOS 200D Camera',     price:28000, university:'Manipal University',seller:{isVerified:true},images:['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80'], createdAt: new Date(Date.now()-18000000).toISOString() },
  { _id:'d7', title:'Engineering Books Set',     price:1500,  university:'Amity University', seller:{isVerified:false}, images:['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80'], createdAt: new Date(Date.now()-86400000).toISOString() },
  { _id:'d8', title:'iPhone 12 128GB Blue',      price:22000, university:'VIT Vellore',      seller:{isVerified:true},  images:['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'], createdAt: new Date(Date.now()-1800000).toISOString() },
]

function greet() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function SectionHead({ title, path, icon: Icon, count }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between px-4 lg:px-0 mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} style={{ color: '#7c6af7' }} />}
        <h2 className="font-bold text-[14px] tracking-tight" style={{ color: '#eeeef2' }}>{title}</h2>
        {count > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(124,106,247,0.12)', color: '#7c6af7' }}>
            {count}
          </span>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => navigate(path)}
        className="flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: '#7c6af7' }}
      >
        View All <ArrowRight size={10} strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}

/* Compact 2-col grid on mobile, 3–4 col on desktop */
function ProductGrid({ products, loading, count = 6 }) {
  if (loading) return (
    <div className="px-4 lg:px-0">
      <SkeletonGrid count={count} />
    </div>
  )
  return (
    <div className="px-4 lg:px-0 mkt-grid">
      {products.map((p, i) => (
        <ProductCard key={p._id || i} product={p} index={i} />
      ))}
    </div>
  )
}

/* ── Desktop hero section ── */
function DesktopHero({ user, navigate, locating, onNearYou }) {
  return (
    <section className="hidden lg:block mb-12">
      <div
        className="relative rounded-[28px] overflow-hidden px-12 py-14"
        style={{
          background: 'linear-gradient(135deg,#0d0d16 0%,#0c0c10 60%,#0a1520 100%)',
          border: '1px solid rgba(124,106,247,0.12)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(124,106,247,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-0 left-0 w-[350px] h-[200px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 0%, rgba(249,115,22,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-8 mb-8">
            {/* Left: headline */}
            <div className="flex-1 max-w-xl">
              <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="text-[13px] font-medium mb-3" style={{ color: '#55555f' }}>
                {greet()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="font-black leading-[1.1] mb-4"
                style={{ color: '#eeeef2', fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Find Your{' '}
                <span className="gradient-text-brand">Next Owner</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                className="text-[14px] leading-relaxed mb-7" style={{ color: '#55555f' }}>
                India's campus marketplace. Buy, sell, and swap with fellow students —
                zero fees, instant listings, verified sellers.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }} className="flex items-center gap-3 flex-wrap">
                <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 px-6 py-3 rounded-[12px] font-bold text-[13px] text-white"
                  style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 24px rgba(124,106,247,0.32)' }}>
                  Explore Listings <ArrowRight size={14} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => navigate('/sell')}
                  className="flex items-center gap-2 px-6 py-3 rounded-[12px] font-bold text-[13px]"
                  style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.22)', color: '#fb923c' }}>
                  🚀 List for Free
                </motion.button>
              </motion.div>
            </div>

            {/* Right: stats grid 2×2 */}
            <div className="hidden xl:grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { val: '10K+', label: 'Active Students', icon: Users,       color: '#7c6af7', bg: 'rgba(124,106,247,0.09)' },
                { val: '25K+', label: 'Items Sold',       icon: TrendingUp,  color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
                { val: '50+',  label: 'Campuses',         icon: ShieldCheck, color: '#f97316', bg: 'rgba(249,115,22,0.09)'  },
                { val: '<60s', label: 'To List',          icon: Zap,         color: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
              ].map(({ val, label, icon: Icon, color, bg }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.07 }}
                  className="flex flex-col items-center gap-2 rounded-[16px] px-5 py-4 text-center"
                  style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', minWidth: 120 }}>
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <p className="font-black text-[18px] leading-none" style={{ color }}>{val}</p>
                  <p className="text-[10px]" style={{ color: '#55555f' }}>{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="relative z-10 flex items-center gap-6 mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
        >
          {[
            { icon: ShieldCheck, label: 'Campus-verified sellers', color: '#34d399' },
            { icon: Zap,         label: 'Zero listing fees',        color: '#f97316' },
            { icon: Users,       label: '10,000+ student community', color: '#7c6af7' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} style={{ color }} />
              <span className="text-[12px]" style={{ color: '#55555f' }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── Location permission denied modal ── */
function LocationDeniedModal({ onClose }) {
  const isIOS    = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)

  const steps = isIOS
    ? [
        { icon: '⚙️', text: 'Open iPhone Settings → Safari (or Chrome)' },
        { icon: '📍', text: 'Tap "Location" → select "While Using"' },
        { icon: '🔄', text: 'Come back and tap "Items Near You" again' },
      ]
    : isAndroid
    ? [
        { icon: '🔒', text: 'Tap the lock icon in your browser address bar' },
        { icon: '📍', text: 'Tap "Permissions" → turn on Location' },
        { icon: '🔄', text: 'Reload the page and try again' },
      ]
    : [
        { icon: '🔒', text: 'Click the lock/info icon in your browser address bar' },
        { icon: '📍', text: 'Set "Location" permission to "Allow"' },
        { icon: '🔄', text: 'Refresh the page and tap "Items Near You" again' },
      ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[28px] overflow-hidden"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {/* Top accent strip */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#f97316,#fb923c)' }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[16px] flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)' }}>
                <MapPin size={22} style={{ color: '#f97316' }} />
              </div>
              <div>
                <h3 className="font-black text-[16px] leading-tight" style={{ color: '#eeeef2' }}>Location Blocked</h3>
                <p className="text-[11px] mt-0.5" style={{ color: '#55555f' }}>Permission denied</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={12} style={{ color: '#8a8a9a' }} />
            </motion.button>
          </div>

          <p className="text-[13px] leading-relaxed mb-5" style={{ color: '#8a8a9a' }}>
            Enable location to discover nearby campus listings — apartments, hostels, universities, and more.
          </p>

          <div className="space-y-3 mb-5">
            {steps.map(({ icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[12px] px-3.5 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-base leading-none flex-shrink-0 mt-0.5">{icon}</span>
                <p className="text-[12px] leading-relaxed" style={{ color: '#8a8a9a' }}>{text}</p>
              </div>
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full py-3 rounded-[14px] font-bold text-[13px]"
            style={{
              background: 'linear-gradient(135deg,rgba(249,115,22,0.16),rgba(234,88,12,0.10))',
              border: '1px solid rgba(249,115,22,0.25)',
              color: '#fb923c',
            }}>
            Got it — I'll enable it
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Reverse geocoding via OpenStreetMap Nominatim — building-level (zoom=18) ──
 *  Priority: specific named place → named building → locality → city
 *  Examples: "Near Sharda University, Greater Noida"
 *            "Near La Galaxia Apartments, Kathmandu"
 *            "Near Imadol, Mahalaxmi"
 */
async function reverseGeocode(lat, lng) {
  try {
    // zoom=18 → building-level precision (max detail)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    const res  = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'NextOwner-App/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const a    = data.address || {}

    // Generic building values to skip (not useful as a place name)
    const GENERIC_BUILDING = new Set([
      'yes', 'residential', 'apartments', 'house', 'building',
      'retail', 'commercial', 'industrial', 'construction', 'roof',
    ])

    // 1. Specific named destination — most precise
    //    Nominatim fills amenity for universities, malls, hospitals, restaurants…
    const amenity = a.amenity || a.leisure || a.tourism || a.shop || a.office || ''

    // 2. Named building (skip generic type-words)
    const rawBuilding  = a.building || ''
    const buildingName = GENERIC_BUILDING.has(rawBuilding.toLowerCase()) ? '' : rawBuilding

    // 3. Estate / housing-society name sometimes lives in "allotments"
    const estate = a.allotments || a.residential || ''

    // Best place name from the above
    const place = amenity || buildingName || estate

    // 4. Micro-area: neighbourhood → suburb → village → quarter → city_district
    const area = a.neighbourhood || a.suburb || a.village || a.quarter || a.city_district || ''

    // 5. City-level anchor
    const city = a.city || a.town || a.county || a.state_district || ''

    // Build the "Near X, Y" string — most specific wins
    if (place && city)  return `Near ${place}, ${city}`
    if (place && area)  return `Near ${place}, ${area}`
    if (place)          return `Near ${place}`
    if (area && city)   return `Near ${area}, ${city}`
    if (area)           return `Near ${area}`
    if (city)           return `Near ${city}`

    // Last resort — first two tokens of the full display_name
    const parts = (data.display_name || '').split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length >= 2) return `Near ${parts[0]}, ${parts[1]}`
    return `Near ${parts[0] || 'your location'}`
  } catch {
    return null
  }
}

export default function HomePage() {
  const { user }                   = useAuth()
  const navigate                   = useNavigate()
  const [featured, setFeatured]     = useState([])
  const [recent,   setRecent]       = useState([])
  const [loadF,    setLoadF]        = useState(true)
  const [loadR,    setLoadR]        = useState(true)
  const [locating,    setLocating]    = useState(false)
  const [locDenied,   setLocDenied]   = useState(false)
  const [showMap,     setShowMap]     = useState(false)
  const [gpsCoords,   setGpsCoords]   = useState({ lat: 28.6139, lng: 77.2090 })
  const [cachedCoords, setCachedCoords] = useState(() => {
    // Load cached coords from sessionStorage on mount
    try {
      const s = sessionStorage.getItem('nextowner_coords')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  // Clear cache + re-detect (Refresh Location button)
  const handleRefreshLocation = useCallback((e) => {
    e.stopPropagation()
    try { sessionStorage.removeItem('nextowner_coords') } catch {}
    setCachedCoords(null)
  }, [])

  const handleNearYou = useCallback(async () => {
    // Use cached coords if fresh (< 30 min old) — skip map
    if (cachedCoords) {
      const age = Date.now() - cachedCoords.timestamp
      if (age < 30 * 60 * 1000) {
        const locParam = cachedCoords.address ? `&loc=${encodeURIComponent(cachedCoords.address)}` : ''
        navigate(`/search?lat=${cachedCoords.lat}&lng=${cachedCoords.lng}&near=1${locParam}`)
        return
      }
      try { sessionStorage.removeItem('nextowner_coords') } catch {}
      setCachedCoords(null)
    }

    if (!navigator.geolocation) {
      // No GPS → open map at default (Delhi) so user can drag manually
      setShowMap(true)
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setLocating(false)
        setGpsCoords({ lat, lng })
        setShowMap(true)          // open map centred on GPS position
      },
      (err) => {
        setLocating(false)
        if (err.code === 1) {
          setLocDenied(true)      // permission denied → show help modal
        } else {
          setShowMap(true)        // other error → open map at default
        }
      },
      { timeout: 12000, maximumAge: 0, enableHighAccuracy: true }
    )
  }, [cachedCoords, navigate])

  /* Called when user taps "Use This Location" in the map picker */
  const handleMapConfirm = useCallback(({ lat, lng, address }) => {
    const latStr = Number(lat).toFixed(6)
    const lngStr = Number(lng).toFixed(6)
    const coords = { lat: latStr, lng: lngStr, address, timestamp: Date.now() }
    setCachedCoords(coords)
    try { sessionStorage.setItem('nextowner_coords', JSON.stringify(coords)) } catch {}
    setShowMap(false)
    const locParam = address ? `&loc=${encodeURIComponent(address)}` : ''
    navigate(`/search?lat=${latStr}&lng=${lngStr}&near=1${locParam}`)
  }, [navigate])

  useEffect(() => {
    // Deduplicate helper — prevents showing same _id twice
    const uniq = (arr) => {
      const seen = new Set()
      return arr.filter(p => { if (seen.has(p._id)) return false; seen.add(p._id); return true })
    }

    getProducts({ featured: '1', limit: 8 })
      .then(d => setFeatured(uniq(d.products?.length ? d.products : DEMO.slice(0, 4))))
      .catch(()  => setFeatured(DEMO.slice(0, 4)))
      .finally(() => setLoadF(false))

    getProducts({ sort: 'newest', limit: 8 })
      .then(d => setRecent(uniq(d.products?.length ? d.products : DEMO)))
      .catch(()  => setRecent(DEMO))
      .finally(() => setLoadR(false))
  }, [])

  return (
    <div className="min-h-screen pb-[120px]" style={{ background: '#0c0c10' }}>

      {/* Location map picker */}
      <AnimatePresence>
        {showMap && (
          <LocationMapPicker
            initialLat={gpsCoords.lat}
            initialLng={gpsCoords.lng}
            onConfirm={handleMapConfirm}
            onClose={() => setShowMap(false)}
          />
        )}
      </AnimatePresence>

      {/* Location permission denied modal */}
      <AnimatePresence>
        {locDenied && <LocationDeniedModal onClose={() => setLocDenied(false)} />}
      </AnimatePresence>

      {/* ── Mobile: greeting + search + banner + categories ── */}
      <div className="lg:hidden">
        {/* Greeting + Search */}
        <div className="pt-safe-header px-4 pb-3">
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="text-[12px] font-medium mb-1" style={{ color: '#55555f' }}>
            {greet()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-black text-[22px] leading-tight mb-3" style={{ color: '#eeeef2' }}>
            Find Your <span className="gradient-text-brand">Next Owner</span>
          </motion.h1>

          {/* Hero search bar — tap to open /search (OLX style) */}
          <motion.button
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/search')}
            className="w-full flex items-center gap-2.5 h-12 rounded-[14px] px-4"
            style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <Search size={15} style={{ color: '#7c6af7', flexShrink: 0 }} />
            <span className="text-[13px]" style={{ color: '#44444c' }}>
              Search products, categories…
            </span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-[6px]"
              style={{ background: 'rgba(124,106,247,0.10)', color: '#7c6af7', border: '1px solid rgba(124,106,247,0.18)', flexShrink: 0 }}>
              Search
            </span>
          </motion.button>
        </div>

        <section className="mb-5">
          <HeroBanner />
        </section>

        <section className="mb-5">
          <CategorySlider />
        </section>
      </div>

      {/* ── Desktop: premium hero + content ── */}
      <div className="hidden lg:block px-6 xl:px-8 pt-[80px]">
        <DesktopHero user={user} navigate={navigate} locating={locating} onNearYou={handleNearYou} />

        {/* Desktop categories */}
        <section className="mb-10">
          <CategorySlider />
        </section>
      </div>

      {/* ── Shared: Featured + Recent ── */}
      <div className="lg:px-6 xl:px-8">

        {/* Featured Products */}
        <section className="mb-6">
          <SectionHead title="Featured" path="/search?featured=1" icon={TrendingUp} count={featured.length} />
          <ProductGrid products={featured} loading={loadF} count={6} />
        </section>

        {/* Recently Added */}
        <section className="mb-6">
          <SectionHead title="Recently Added" path="/search" count={recent.length} />
          <ProductGrid products={recent} loading={loadR} count={6} />
        </section>

        {/* ── Near You card ── */}
        <section className="px-4 lg:px-0 mb-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[22px]"
            style={{
              background: 'linear-gradient(135deg,#0d1f17 0%,#091410 100%)',
              border: `1px solid ${cachedCoords ? 'rgba(52,211,153,0.28)' : 'rgba(52,211,153,0.12)'}`,
              boxShadow: cachedCoords
                ? '0 0 0 1px rgba(52,211,153,0.06), 0 8px 32px rgba(52,211,153,0.10)'
                : '0 4px 20px rgba(0,0,0,0.35)',
            }}
          >
            {/* Ambient glow when address is known */}
            {cachedCoords?.address && (
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 0% 50%, rgba(52,211,153,0.07) 0%, transparent 70%)' }} />
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNearYou}
              disabled={locating}
              className="w-full flex items-center gap-4 px-5 py-4 text-left disabled:cursor-wait"
            >
              {/* Icon with animated pulse ring while locating */}
              <div className="relative flex-shrink-0">
                {locating && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ background: 'rgba(52,211,153,0.25)' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{ scale: [1, 1.9, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                      style={{ background: 'rgba(52,211,153,0.15)' }}
                    />
                  </>
                )}
                <div
                  className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: locating ? 'rgba(52,211,153,0.14)' : 'rgba(52,211,153,0.08)',
                    border: `1px solid ${locating ? 'rgba(52,211,153,0.35)' : 'rgba(52,211,153,0.16)'}`,
                  }}
                >
                  {locating
                    ? <Loader size={20} style={{ color: '#34d399' }} className="animate-spin" />
                    : cachedCoords
                      ? <Navigation size={20} style={{ color: '#34d399' }} />
                      : <MapPin size={20} style={{ color: '#34d399' }} />
                  }
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <p className="font-bold text-[14px] leading-snug" style={{ color: '#eeeef2' }}>
                  {locating ? 'Detecting location…' : 'Items Near You'}
                </p>

                {/* Address or skeleton or prompt */}
                {locating ? (
                  <div className="mt-1.5 space-y-1.5">
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="h-2.5 w-44 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.18)' }}
                    />
                    <motion.div
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className="h-2 w-32 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.10)' }}
                    />
                  </div>
                ) : cachedCoords?.address ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {/* Live pulse dot */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#34d399' }}
                    />
                    <p className="text-[11px] truncate font-medium" style={{ color: '#34d399' }}>
                      {cachedCoords.address}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#44444c' }}>
                    {cachedCoords
                      ? 'Tap to browse nearby listings'
                      : 'Discover apartments, hostels & campus items near you'}
                  </p>
                )}
              </div>

              {/* Right badge / arrow */}
              {!locating && (
                <div className="flex-shrink-0">
                  {cachedCoords?.address ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }}>
                      📍 Live
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.18)' }}>
                      <ArrowRight size={14} style={{ color: '#34d399' }} />
                    </div>
                  )}
                </div>
              )}
            </motion.button>

            {/* Refresh location row — shown only when address is cached */}
            <AnimatePresence>
              {!locating && cachedCoords && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 pb-3.5 pt-0"
                    style={{ borderTop: '1px solid rgba(52,211,153,0.08)' }}>
                    <p className="text-[10px]" style={{ color: '#37373f' }}>
                      {cachedCoords.timestamp
                        ? `Updated ${Math.round((Date.now() - cachedCoords.timestamp) / 60000)} min ago`
                        : 'Location cached'
                      }
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleRefreshLocation}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(52,211,153,0.08)',
                        border: '1px solid rgba(52,211,153,0.16)',
                        color: '#34d399',
                      }}
                    >
                      <Navigation size={9} /> Refresh location
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Sell CTA */}
        <section className="px-4 lg:px-0 mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/sell')}
            className="w-full py-3.5 rounded-[18px] gradient-orange text-white font-black text-[14px] shadow-orange flex items-center justify-center gap-2"
          >
            <Plus size={16} /> List Something for Free
          </motion.button>
        </section>

      </div>

      <Footer />
    </div>
  )
}
