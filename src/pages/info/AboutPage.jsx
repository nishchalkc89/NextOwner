import { motion } from 'framer-motion'
import { ArrowLeft, Users, ShieldCheck, Zap, Globe, ArrowRight, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const STATS = [
  { value: '10K+', label: 'Active Students',  color: '#7c6af7' },
  { value: '50+',  label: 'Campuses',          color: '#34d399' },
  { value: '25K+', label: 'Items Sold',        color: '#f97316' },
  { value: '4.9★', label: 'App Rating',        color: '#f59e0b' },
]

const VALUES = [
  {
    icon: Users,
    color: '#7c6af7',
    bg: 'rgba(124,106,247,0.10)',
    border: 'rgba(124,106,247,0.18)',
    title: 'Built for Students',
    desc: 'NextOwner was created by students, for students. Every feature is designed around how campus life actually works — from quick listings to in-campus meetups.',
  },
  {
    icon: ShieldCheck,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.18)',
    title: 'Verified & Safe',
    desc: 'All sellers go through a campus-email verification process. Your safety is our top priority — every badge earned, every transaction protected.',
  },
  {
    icon: Zap,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.09)',
    border: 'rgba(249,115,22,0.18)',
    title: 'Instant Listings',
    desc: 'List your item in under 60 seconds. Photos, price, done. Your item reaches thousands of students instantly with zero fees.',
  },
  {
    icon: Globe,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.16)',
    title: 'Growing Network',
    desc: "We're expanding to every major university in India. Buy and sell across campuses nationwide — your community, scaled.",
  },
]

const TRUST = [
  'Zero listing fees — always free',
  'Campus email verification',
  'In-app secure messaging',
  'Report & moderation system',
  'Student ID verified sellers',
  'Real-time buyer notifications',
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
})

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0c0c10' }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8 h-[58px]"
        style={{
          background: 'rgba(12,12,16,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={15} className="text-white" />
        </motion.button>
        <div className="flex items-center gap-2 text-[13px]" style={{ color: '#55555f' }}>
          <span
            className="hover:text-white cursor-pointer transition-colors"
            onClick={() => navigate('/')}
          >Home</span>
          <span>/</span>
          <span style={{ color: '#eeeef2' }}>About Us</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-10">

        {/* ── Hero ── */}
        <motion.div {...fade(0.05)} className="pt-14 pb-12 lg:pt-20 lg:pb-16 text-center">
          <img
            src="/logo.png"
            alt="NextOwner"
            className="mx-auto mb-8"
            style={{ height: 68, width: 'auto' }}
          />
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-6"
            style={{
              background: 'rgba(124,106,247,0.09)',
              border: '1px solid rgba(124,106,247,0.22)',
              color: '#a79cf9',
            }}
          >
            India's First Student Marketplace
          </div>
          <h1 className="font-black leading-tight mb-5 text-[32px] lg:text-[48px]" style={{ color: '#eeeef2' }}>
            The Campus{' '}
            <span className="gradient-text-brand">Marketplace</span>
            <br className="hidden lg:block" /> Built for Students
          </h1>
          <p className="text-[14px] lg:text-[16px] leading-relaxed max-w-2xl mx-auto" style={{ color: '#55555f' }}>
            NextOwner is India's first dedicated student-to-student marketplace — making it
            effortless to buy, sell, and swap items within your university community.
            No middlemen. No hefty fees. Just community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-6 py-3 rounded-[14px] font-bold text-[13px]"
              style={{
                background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(124,106,247,0.35)',
              }}
            >
              Explore Marketplace <ArrowRight size={14} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/how-it-works')}
              className="flex items-center gap-2 px-6 py-3 rounded-[14px] font-bold text-[13px]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#8a8a9a',
              }}
            >
              How it works
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div {...fade(0.12)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {STATS.map(({ value, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-[20px] py-6 px-4"
              style={{
                background: '#13131a',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="font-black text-[24px] leading-none" style={{ color }}>{value}</span>
              <span className="text-[11px] font-medium text-center" style={{ color: '#55555f' }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Our Story ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center mb-16">
          <motion.div {...fade(0.18)}>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7c6af7' }}>Our Story</span>
            <h2 className="font-black text-[24px] lg:text-[30px] mt-3 mb-5 leading-tight" style={{ color: '#eeeef2' }}>
              Born from a Real<br />Student Problem
            </h2>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#55555f' }}>
              It started with a simple problem — students had tons of stuff they no longer
              needed, and other students needed those exact things. Yet everyone was posting
              on generic classifieds, dealing with strangers, and worrying about scams.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#55555f' }}>
              We built NextOwner to solve this — a trusted, campus-first marketplace where
              every buyer and seller is a fellow student. Your campus, your community,
              your marketplace.
            </p>
          </motion.div>

          <motion.div {...fade(0.24)}>
            <div
              className="rounded-[24px] p-6 mt-8 lg:mt-0"
              style={{
                background: 'linear-gradient(135deg,rgba(124,106,247,0.07) 0%, rgba(52,211,153,0.04) 100%)',
                border: '1px solid rgba(124,106,247,0.14)',
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: '#7c6af7' }}>
                Why Students Trust Us
              </p>
              <div className="space-y-3">
                {TRUST.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span className="text-[13px]" style={{ color: '#8a8a9a' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Values ── */}
        <motion.div {...fade(0.28)} className="mb-16">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7c6af7' }}>Our Values</span>
            <h2 className="font-black text-[24px] lg:text-[30px] mt-3" style={{ color: '#eeeef2' }}>
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, color, bg, border, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 + i * 0.08 }}
                className="flex gap-4 rounded-[20px] p-5"
                style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon size={19} style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-[14px] mb-2" style={{ color: '#eeeef2' }}>{title}</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA Strip ── */}
        <motion.div
          {...fade(0.4)}
          className="rounded-[24px] p-8 lg:p-12 text-center mb-8"
          style={{
            background: 'linear-gradient(135deg,rgba(124,106,247,0.10) 0%,rgba(249,115,22,0.07) 100%)',
            border: '1px solid rgba(124,106,247,0.18)',
          }}
        >
          <h2 className="font-black text-[22px] lg:text-[28px] mb-3" style={{ color: '#eeeef2' }}>
            Ready to Join the Community?
          </h2>
          <p className="text-[13px] mb-8" style={{ color: '#55555f' }}>
            10,000+ students already buying, selling, and swapping on NextOwner.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/')}
              className="px-8 py-3.5 rounded-[14px] font-bold text-[13px] text-white"
              style={{
                background: 'linear-gradient(135deg,#f97316,#ea580c)',
                boxShadow: '0 4px 24px rgba(249,115,22,0.32)',
              }}
            >
              🚀 Start Exploring for Free
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
