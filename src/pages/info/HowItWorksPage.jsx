import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Camera, MessageCircle, Handshake, Search, Tag, BadgeCheck, ChevronDown, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SELLING_STEPS = [
  {
    icon: Camera,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.09)',
    border: 'rgba(249,115,22,0.20)',
    step: '01',
    title: 'Snap & List',
    desc: 'Take a few photos, set your price, write a short description. Done in under 60 seconds — no complicated forms.',
    time: '~60 sec',
  },
  {
    icon: MessageCircle,
    color: '#7c6af7',
    bg: 'rgba(124,106,247,0.09)',
    border: 'rgba(124,106,247,0.20)',
    step: '02',
    title: 'Get Messages',
    desc: 'Interested buyers message you directly through the app. Chat safely inside NextOwner — no personal contact info needed.',
    time: 'Real-time',
  },
  {
    icon: Handshake,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.18)',
    step: '03',
    title: 'Meet & Sell',
    desc: 'Agree on a meetup spot on campus — hand over the item, collect the cash. Simple, safe, and zero platform fees.',
    time: 'On campus',
  },
]

const BUYING_STEPS = [
  {
    icon: Search,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.16)',
    step: '01',
    title: 'Browse or Search',
    desc: 'Explore categories or search for exactly what you need. Filter by price, condition, and location to find the perfect deal.',
    time: 'Instant',
  },
  {
    icon: Tag,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.09)',
    border: 'rgba(249,115,22,0.20)',
    step: '02',
    title: 'Find a Deal',
    desc: "View photos, read descriptions, check the seller's verification badge for peace of mind. Compare prices effortlessly.",
    time: 'Browse freely',
  },
  {
    icon: MessageCircle,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.18)',
    step: '03',
    title: 'Chat & Collect',
    desc: 'Message the seller, negotiate, agree on a time and place. Pick it up on campus — safe, fast, trusted.',
    time: 'Same day',
  },
]

const FAQS = [
  { q: 'Is NextOwner free to use?',                     a: 'Absolutely. Listing and buying on NextOwner is 100% free, always. No commissions, no hidden fees.' },
  { q: 'How do I know a seller is trustworthy?',        a: "Look for the green Verified badge — sellers who've verified their campus email earn it. Always meet in public spaces on campus and inspect before paying." },
  { q: "What happens if an item isn't as described?",   a: "Inspect items before paying. If there's an issue, use the Report button to flag the listing and we'll step in to help resolve it quickly." },
  { q: 'Can I sell outside my campus?',                 a: "Yes! You can list for any campus or set it to 'All Campuses' to reach buyers everywhere across NextOwner's growing network." },
  { q: 'What can I sell on NextOwner?',                 a: 'Electronics, books, furniture, appliances, vehicles, hostel essentials — anything a student would need or no longer needs.' },
  { q: 'How do I get verified?',                        a: 'Go to your profile, tap Verify Account, and follow the campus email verification steps. Takes under 2 minutes.' },
]

function StepTimeline({ steps, color }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-[22px] top-8 bottom-8 w-px hidden lg:block"
        style={{ background: `linear-gradient(to bottom, ${color}44, transparent)` }}
      />
      <div className="space-y-4">
        {steps.map(({ icon: Icon, color: c, bg, border, step, title, desc, time }, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-4 lg:gap-5"
          >
            {/* Icon + step */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon size={18} style={{ color: c }} />
              </div>
              <span className="text-[9px] font-black" style={{ color: c }}>{step}</span>
            </div>
            {/* Content */}
            <div
              className="flex-1 rounded-[18px] p-4 lg:p-5"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-bold text-[14px]" style={{ color: '#eeeef2' }}>{title}</p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: bg, color: c, border: `1px solid ${border}` }}
                >
                  {time}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FAQItem({ q, a, i }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.06 }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-[16px] p-4 text-left transition-colors"
        style={{
          background: open ? 'rgba(124,106,247,0.06)' : '#13131a',
          border: open ? '1px solid rgba(124,106,247,0.18)' : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="font-semibold text-[13px]" style={{ color: open ? '#a79cf9' : '#eeeef2' }}>{q}</p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} style={{ color: '#55555f', flexShrink: 0 }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4">
              <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HowItWorksPage() {
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
          <span style={{ color: '#eeeef2' }}>How it Works</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-10">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-14 pb-12 lg:pt-20"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-5"
            style={{
              background: 'rgba(124,106,247,0.09)',
              border: '1px solid rgba(124,106,247,0.22)',
              color: '#a79cf9',
            }}
          >
            Get Started in Minutes
          </div>
          <h1 className="font-black leading-tight mb-4 text-[32px] lg:text-[48px]" style={{ color: '#eeeef2' }}>
            Simple. Fast.{' '}
            <span className="gradient-text-brand">Trusted.</span>
          </h1>
          <p className="text-[14px] lg:text-[16px] leading-relaxed max-w-xl" style={{ color: '#55555f' }}>
            NextOwner is designed to make campus buying and selling as smooth as possible —
            whether you're clearing out your hostel room or hunting for a deal.
          </p>
        </motion.div>

        {/* ── Two-column steps on desktop ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 mb-16">

          {/* Selling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.22)' }}
              >
                <span className="text-[11px] font-black" style={{ color: '#f97316' }}>S</span>
              </div>
              <div>
                <h3 className="font-bold text-[15px]" style={{ color: '#eeeef2' }}>Selling in 3 Steps</h3>
                <p className="text-[11px]" style={{ color: '#55555f' }}>From listing to cash in minutes</p>
              </div>
            </div>
            <StepTimeline steps={SELLING_STEPS} color="#f97316" />
          </motion.div>

          {/* Buying */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 lg:mt-0"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)' }}
              >
                <span className="text-[11px] font-black" style={{ color: '#38bdf8' }}>B</span>
              </div>
              <div>
                <h3 className="font-bold text-[15px]" style={{ color: '#eeeef2' }}>Buying in 3 Steps</h3>
                <p className="text-[11px]" style={{ color: '#55555f' }}>Find great deals nearby</p>
              </div>
            </div>
            <StepTimeline steps={BUYING_STEPS} color="#38bdf8" />
          </motion.div>
        </div>

        {/* ── Verified badge callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-4 rounded-[22px] p-5 lg:p-6 mb-14"
          style={{
            background: 'linear-gradient(135deg,rgba(52,211,153,0.06) 0%,rgba(52,211,153,0.02) 100%)',
            border: '1px solid rgba(52,211,153,0.16)',
          }}
        >
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)' }}
          >
            <BadgeCheck size={22} style={{ color: '#34d399' }} />
          </div>
          <div>
            <p className="font-bold text-[14px] mb-1.5" style={{ color: '#eeeef2' }}>The Verified Badge</p>
            <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>
              Sellers who verify their .edu or campus email get a green Verified badge displayed on
              their profile and listings. Always prioritise verified sellers for safer, more trusted
              transactions — it's our commitment to campus safety.
            </p>
          </div>
        </motion.div>

        {/* ── FAQs ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-14"
        >
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7c6af7' }}>FAQ</span>
            <h2 className="font-black text-[24px] lg:text-[30px] mt-3" style={{ color: '#eeeef2' }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-2.5">
            {FAQS.map(({ q, a }, i) => (
              <FAQItem key={i} q={q} a={a} i={i} />
            ))}
          </div>
        </motion.div>

        {/* ── CTA strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-[24px] p-8 lg:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg,rgba(249,115,22,0.09) 0%,rgba(124,106,247,0.07) 100%)',
            border: '1px solid rgba(249,115,22,0.18)',
          }}
        >
          <h2 className="font-black text-[22px] lg:text-[28px] mb-3" style={{ color: '#eeeef2' }}>
            Ready to List Your First Item?
          </h2>
          <p className="text-[13px] mb-8" style={{ color: '#55555f' }}>
            It takes under 60 seconds. Zero fees. Thousands of student buyers waiting.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/sell')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] font-bold text-[13px] text-white"
            style={{
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              boxShadow: '0 4px 24px rgba(249,115,22,0.32)',
            }}
          >
            🚀 List Something for Free <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
