import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, Clock, TrendingUp, SlidersHorizontal,
  ChevronRight, MapPin, Navigation, BadgeCheck, ChevronDown,
  RotateCcw, Check,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import { getProducts } from '../services/productService'

/* ── Constants ────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'All',              emoji: '🏷️', color: '#7c6af7' },
  { label: 'Electronics',     emoji: '💻', color: '#3b82f6' },
  { label: 'Furniture',       emoji: '🪑', color: '#8b5cf6' },
  { label: 'Books',           emoji: '📚', color: '#f97316' },
  { label: 'Appliances',      emoji: '🔌', color: '#22c55e' },
  { label: 'Vehicles',        emoji: '🚲', color: '#eab308' },
  { label: 'Hostel Essentials', emoji: '🛏️', color: '#14b8a6' },
  { label: 'Others',          emoji: '📦', color: '#6b7280' },
]

const PRICE_RANGES = [
  { label: 'Under ₹500',  value: '0-500'     },
  { label: '₹500–₹2k',   value: '500-2000'   },
  { label: '₹2k–₹10k',   value: '2000-10000' },
  { label: '₹10k+',      value: '10000-'     },
]

const CONDITIONS   = ['Any', 'Brand New', 'Like New', 'Good', 'Fair']
const SORT_OPTIONS = [
  { label: 'Newest',     value: 'newest'     },
  { label: 'Price ↑',   value: 'price_asc'  },
  { label: 'Price ↓',   value: 'price_desc' },
  { label: 'Trending',  value: 'trending'   },
]
const RECENT = ['MacBook Air', 'iPhone 14', 'Cycle', 'Engineering Books', 'Guitar']
const POPULAR = [
  { label: 'Laptops',  emoji: '💻' }, { label: 'Mobiles', emoji: '📱' },
  { label: 'Cycles',   emoji: '🚲' }, { label: 'Books',   emoji: '📚' },
  { label: 'Cameras',  emoji: '📷' }, { label: 'Tables',  emoji: '🪑' },
]

/* ── Filter options shared between sidebar and drawer ── */
function FilterOptions({ category, setCategory, priceF, setPriceF, condF, setCondF, sortF, setSortF, verifiedF, setVerifiedF, onReset }) {
  return (
    <div className="space-y-5">
      {/* Reset */}
      <div className="flex items-center justify-between">
        <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>Filters</p>
        <button onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: '#7c6af7' }}>
          <RotateCcw size={10} /> Reset all
        </button>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#37373f' }}>Sort By</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SORT_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setSortF(s.value)}
              className="py-1.5 rounded-[8px] text-[11px] font-semibold text-center transition-all"
              style={sortF === s.value
                ? { background: 'rgba(124,106,247,0.14)', border: '1px solid rgba(124,106,247,0.30)', color: '#a79cf9' }
                : { background: '#13131a', border: '1px solid rgba(255,255,255,0.065)', color: '#55555f' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#37373f' }}>Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map(c => (
            <button key={c.label}
              onClick={() => setCategory(c.label === 'All' ? '' : c.label)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[9px] text-left transition-all"
              style={category === (c.label === 'All' ? '' : c.label)
                ? { background: 'rgba(124,106,247,0.10)', color: '#a79cf9' }
                : { color: '#55555f' }}>
              <span style={{ fontSize: 13 }}>{c.emoji}</span>
              <span className="text-[12px] font-medium">{c.label}</span>
              {category === (c.label === 'All' ? '' : c.label) && (
                <Check size={11} style={{ color: '#7c6af7', marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#37373f' }}>Price Range</p>
        <div className="space-y-1.5">
          {PRICE_RANGES.map(r => (
            <button key={r.value} onClick={() => setPriceF(v => v === r.value ? '' : r.value)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[9px] text-left text-[12px] font-medium transition-all"
              style={priceF === r.value
                ? { background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.22)', color: '#fb923c' }
                : { background: '#13131a', border: '1px solid rgba(255,255,255,0.055)', color: '#55555f' }}>
              {r.label}
              {priceF === r.value && <Check size={11} style={{ color: '#f97316' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#37373f' }}>Condition</p>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map(c => (
            <button key={c} onClick={() => setCondF(c)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={condF === c
                ? { background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' }
                : { background: '#13131a', border: '1px solid rgba(255,255,255,0.065)', color: '#55555f' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Only */}
      <button onClick={() => setVerifiedF(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-all"
        style={verifiedF
          ? { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)' }
          : { background: '#13131a', border: '1px solid rgba(255,255,255,0.065)' }}>
        <div className="flex items-center gap-2">
          <BadgeCheck size={14} style={{ color: verifiedF ? '#34d399' : '#37373f' }} />
          <span className="text-[12px] font-semibold" style={{ color: verifiedF ? '#34d399' : '#55555f' }}>
            Verified Sellers Only
          </span>
        </div>
        {/* Toggle pill */}
        <div className="w-9 h-5 rounded-full flex items-center px-0.5 transition-all"
          style={{ background: verifiedF ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.08)' }}>
          <motion.div
            animate={{ x: verifiedF ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-4 h-4 rounded-full"
            style={{ background: verifiedF ? '#34d399' : '#55555f' }}
          />
        </div>
      </button>
    </div>
  )
}

/* ── Mobile filter drawer (bottom sheet) ── */
function FilterDrawer({ onClose, ...filterProps }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        onClick={e => e.stopPropagation()}
        className="rounded-t-[28px] overflow-hidden"
        style={{
          background: '#0f0f14',
          border: '1px solid rgba(255,255,255,0.09)',
          maxHeight: '88vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }} />
        </div>
        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(88vh - 32px)' }}>
          <FilterOptions {...filterProps} />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-[14px] font-bold text-[14px] text-white mt-6"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 20px rgba(124,106,247,0.30)' }}>
            Show Results
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Main component ── */
export default function SearchPage() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()

  // Search state
  const [query,    setQuery]    = useState(params.get('q') || '')
  const [inputVal, setInputVal] = useState(params.get('q') || '')
  const inputRef = useRef(null)

  // Filter state
  const [category, setCategory] = useState(params.get('category') || '')
  const [priceF,   setPriceF]   = useState('')
  const [condF,    setCondF]    = useState('Any')
  const [sortF,    setSortF]    = useState('newest')
  const [verifiedF,setVerifiedF]= useState(false)

  // UI state
  const [showFilters, setShowFilters] = useState(false)

  // Results state
  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(false)

  // Location params
  const lat  = params.get('lat')
  const lng  = params.get('lng')
  const near = params.get('near') === '1'
  const loc  = params.get('loc') || ''

  const isDiscovery = !query && !category && !near

  // Active filter count for badge
  const activeFilterCount = [
    priceF,
    condF !== 'Any' ? condF : '',
    sortF !== 'newest' ? sortF : '',
    category,
    verifiedF ? 'v' : '',
  ].filter(Boolean).length

  const resetFilters = () => {
    setPriceF(''); setCondF('Any'); setSortF('newest')
    setCategory(''); setVerifiedF(false)
  }

  const fetchProducts = useCallback(async () => {
    if (!query && !category && !near) { setProducts([]); setLoading(false); return }
    setLoading(true)
    try {
      const p = { sort: sortF, limit: 40 }
      if (query)    p.q        = query
      if (category) p.category = category
      if (lat)      p.lat      = lat
      if (lng)      p.lng      = lng
      if (verifiedF) p.verified = '1'
      const data = await getProducts(p)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [query, category, sortF, lat, lng, near, verifiedF])

  useEffect(() => {
    const t = setTimeout(fetchProducts, query ? 380 : 0)
    return () => clearTimeout(t)
  }, [fetchProducts])

  useEffect(() => {
    setCategory(params.get('category') || '')
  }, [params])

  // Debounce input → query
  useEffect(() => {
    const t = setTimeout(() => setQuery(inputVal), 380)
    return () => clearTimeout(t)
  }, [inputVal])

  const filterProps = { category, setCategory, priceF, setPriceF, condF, setCondF, sortF, setSortF, verifiedF, setVerifiedF, onReset: resetFilters }

  return (
    <div className="min-h-screen pb-[100px] lg:pb-10" style={{ background: '#0c0c10' }}>

      {/* ── Sticky search bar ── */}
      <div className="sticky top-0 z-30 px-4 pt-[74px] lg:pt-[84px] pb-3"
        style={{ background: 'rgba(12,12,16,0.96)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        <div className="flex items-center gap-2 rounded-[14px] px-3.5 h-11"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}>
          <Search size={14} style={{ color: '#7c6af7', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, categories…"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-[13px]"
            style={{ color: '#eeeef2' }}
          />
          <AnimatePresence>
            {inputVal && (
              <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => { setInputVal(''); setQuery('') }}>
                <X size={14} style={{ color: '#55555f' }} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Main layout (sidebar + content) ── */}
      <div className="flex">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block flex-shrink-0 overflow-y-auto no-scrollbar"
          style={{
            width: 232,
            position: 'sticky',
            top: 121,                          /* sticky search bar height */
            height: 'calc(100vh - 121px)',
            padding: '20px 16px 32px 20px',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}>
          <FilterOptions {...filterProps} />
        </aside>

        {/* ── Content area ── */}
        <main className="flex-1 min-w-0 px-4 lg:px-5 xl:px-6 pt-4">

          {/* Mobile: filter bar */}
          <div className="lg:hidden flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
            {/* Filter button with count */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowFilters(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold flex-shrink-0"
              style={{
                background: activeFilterCount > 0 ? 'rgba(124,106,247,0.12)' : '#13131a',
                border: `1px solid ${activeFilterCount > 0 ? 'rgba(124,106,247,0.28)' : 'rgba(255,255,255,0.072)'}`,
                color: activeFilterCount > 0 ? '#a79cf9' : '#55555f',
              }}>
              <SlidersHorizontal size={11} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: '#7c6af7' }}>
                  {activeFilterCount}
                </span>
              )}
            </motion.button>

            {/* Near You chip */}
            {near && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.22)', color: '#34d399' }}>
                <Navigation size={10} /> {loc || 'Near You'}
                <button onClick={() => navigate('/search')} className="ml-0.5">
                  <X size={9} style={{ color: '#34d399' }} />
                </button>
              </div>
            )}

            {/* Active filter pills */}
            {category && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.22)', color: '#fb923c' }}>
                {category}
                <button onClick={() => setCategory('')}><X size={9} style={{ color: '#fb923c' }} /></button>
              </div>
            )}
            {condF !== 'Any' && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)', color: '#34d399' }}>
                {condF}
                <button onClick={() => setCondF('Any')}><X size={9} style={{ color: '#34d399' }} /></button>
              </div>
            )}
            {priceF && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                style={{ background: 'rgba(124,106,247,0.10)', border: '1px solid rgba(124,106,247,0.22)', color: '#a79cf9' }}>
                {PRICE_RANGES.find(r => r.value === priceF)?.label}
                <button onClick={() => setPriceF('')}><X size={9} style={{ color: '#a79cf9' }} /></button>
              </div>
            )}
          </div>

          {/* Desktop: near you banner */}
          {near && !query && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-[14px] mb-5"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.16)' }}>
              <Navigation size={15} style={{ color: '#34d399' }} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-bold" style={{ color: '#34d399' }}>Items Near You</span>
                {loc && <span className="text-[11px] ml-2" style={{ color: '#55555f' }}>{loc}</span>}
              </div>
              <button onClick={() => navigate('/search')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#55555f' }}>
                Clear
              </button>
            </motion.div>
          )}

          {/* ── Discovery state (no search/filter active) ── */}
          <AnimatePresence mode="wait">
            {isDiscovery && (
              <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6">

                {/* Recent searches */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>Recent Searches</p>
                    <button className="text-[11px] font-semibold" style={{ color: '#7c6af7' }}>Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RECENT.map(r => (
                      <motion.button key={r} whileTap={{ scale: 0.92 }}
                        onClick={() => setInputVal(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.072)', color: '#8a8a9a' }}>
                        <Clock size={10} style={{ color: '#37373f' }} />
                        {r}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick categories */}
                <div>
                  <p className="font-bold text-[13px] mb-3" style={{ color: '#eeeef2' }}>Browse Categories</p>
                  <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                    {CATEGORIES.filter(c => c.label !== 'All').map((c, i) => (
                      <motion.button key={c.label}
                        whileTap={{ scale: 0.90 }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setCategory(c.label)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-[14px]"
                        style={{ background: `${c.color}14`, border: `1px solid ${c.color}25` }}>
                        <span style={{ fontSize: 22 }}>{c.emoji}</span>
                        <p className="text-[9.5px] font-semibold leading-none text-center px-1" style={{ color: c.color }}>
                          {c.label.split(' ')[0]}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Popular searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={13} style={{ color: '#f97316' }} />
                    <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>Trending Now</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map(p => (
                      <motion.button key={p.label} whileTap={{ scale: 0.92 }}
                        onClick={() => setInputVal(p.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                        style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', color: '#fb923c' }}>
                        {p.emoji} {p.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* ── Results state ── */}
            {!isDiscovery && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Result count + desktop sort */}
                {!loading && products.length > 0 && (
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <p className="text-[11px] font-medium" style={{ color: '#55555f' }}>
                      <span style={{ color: '#eeeef2', fontWeight: 700 }}>{total || products.length}</span> result{products.length !== 1 ? 's' : ''}
                      {query && <> for "<span style={{ color: '#7c6af7' }}>{query}</span>"</>}
                      {near && !query && <span style={{ color: '#34d399' }}> near you</span>}
                    </p>
                    {/* Desktop inline sort */}
                    <div className="hidden lg:flex items-center gap-1.5">
                      {SORT_OPTIONS.map(s => (
                        <button key={s.value} onClick={() => setSortF(s.value)}
                          className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all"
                          style={sortF === s.value
                            ? { background: 'rgba(124,106,247,0.13)', border: '1px solid rgba(124,106,247,0.28)', color: '#a79cf9' }
                            : { background: '#13131a', border: '1px solid rgba(255,255,255,0.065)', color: '#55555f' }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading ? (
                  <SkeletonGrid count={8} />
                ) : products.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-5xl mb-4">{near ? '📍' : '🔍'}</div>
                    <p className="font-bold text-[17px]" style={{ color: '#eeeef2' }}>
                      {near ? 'No items found nearby' : 'Nothing found'}
                    </p>
                    <p className="text-[12px] mt-2 max-w-xs" style={{ color: '#55555f' }}>
                      {near
                        ? 'Be the first to list something in your area!'
                        : 'Try different keywords or browse categories'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      {near && (
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/sell')}
                          className="px-6 py-2.5 rounded-full text-[12px] font-bold gradient-orange text-white shadow-orange">
                          🚀 List Something Here
                        </motion.button>
                      )}
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setInputVal(''); setQuery(''); setCategory('') }}
                        className="px-6 py-2.5 rounded-full text-[12px] font-semibold"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#8a8a9a' }}>
                        Browse All Listings
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mkt-grid">
                    {products.map((p, i) => (
                      <ProductCard key={p._id} product={p} index={i} />
                    ))}
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <FilterDrawer onClose={() => setShowFilters(false)} {...filterProps} />
        )}
      </AnimatePresence>

    </div>
  )
}
