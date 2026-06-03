import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, MapPin, Calendar, Package, MessageCircle, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPublicProfile } from '../services/userService'
import { getOrCreateChat } from '../services/messageService'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import toast from 'react-hot-toast'

function joinedDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function SellerProfilePage() {
  const { userId }                    = useParams()
  const navigate                      = useNavigate()
  const { user: me }                  = useAuth()
  const [profile,  setProfile]        = useState(null)
  const [products, setProducts]       = useState([])
  const [loading,  setLoading]        = useState(true)
  const [chatLoad, setChatLoad]       = useState(false)

  useEffect(() => {
    setLoading(true)
    getPublicProfile(userId)
      .then(({ user, products }) => {
        setProfile(user)
        setProducts(products)
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleMessage = async () => {
    if (!me) { toast.error('Login to message'); navigate('/login'); return }
    if (me._id === userId) { toast.error("That's you!"); return }
    setChatLoad(true)
    try {
      const chat = await getOrCreateChat(userId)
      navigate(`/messages/${chat._id}`)
    } catch {
      toast.error('Could not open chat')
    } finally {
      setChatLoad(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 h-[58px]"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={16} className="text-white" />
        </motion.button>
        <div className="skeleton h-4 w-32 rounded-lg" />
      </div>
      <div className="px-4 pt-6 space-y-4">
        <div className="skeleton h-32 rounded-[22px]" />
        <SkeletonGrid count={4} />
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="text-center px-6">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-white font-bold text-lg">User not found</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)}
          className="mt-5 px-6 py-2.5 rounded-full gradient-orange text-white text-sm font-semibold shadow-orange">
          Go Back
        </motion.button>
      </div>
    </div>
  )

  const isSelf = me?._id === userId

  return (
    <div className="min-h-screen pb-10" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 h-[58px]"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={16} className="text-white" />
        </motion.button>
        <h1 className="text-white font-bold text-[16px] truncate flex-1">{profile.name}</h1>
        {profile.isVerified && <BadgeCheck size={18} className="text-green-400 flex-shrink-0" />}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[22px] p-5 mb-5"
          style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-full p-[2.5px] flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #22c55e)' }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[#17171b] flex items-center justify-center">
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : <span className="text-white font-black text-2xl">{profile.name?.[0]?.toUpperCase()}</span>
                }
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-white font-black text-[17px] truncate">{profile.name}</h2>
                {profile.isVerified && <BadgeCheck size={15} className="text-green-400 flex-shrink-0" />}
              </div>
              {profile.university && (
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={11} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-400 text-[12px] truncate">{profile.university}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={11} className="text-gray-600 flex-shrink-0" />
                <span className="text-gray-600 text-[11px]">Joined {joinedDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.isVerified && (
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                <BadgeCheck size={10} /> Verified Student
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
              <Package size={10} /> {products.length} {products.length === 1 ? 'Listing' : 'Listings'}
            </span>
          </div>

          {/* CTA */}
          {!isSelf && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleMessage}
              disabled={chatLoad}
              className="w-full py-3.5 rounded-[16px] text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}>
              {chatLoad ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
              {chatLoad ? 'Opening Chat…' : 'Send Message'}
            </motion.button>
          )}
          {isSelf && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/profile')}
              className="w-full py-3.5 rounded-[16px] text-white font-bold text-[13px] flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}>
              View My Profile
            </motion.button>
          )}
        </motion.div>

        {/* Listings */}
        <div>
          <p className="text-white font-bold text-[14px] mb-3 px-1">
            {isSelf ? 'My Listings' : `${profile.name?.split(' ')[0]}'s Listings`}
          </p>
          {products.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-400 text-sm">No active listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
