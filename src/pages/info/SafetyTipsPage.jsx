import { motion } from 'framer-motion'
import {
  ArrowLeft, AlertTriangle, MapPin, Eye, Lock, PhoneCall,
  ShieldAlert, CheckCircle2, ShieldCheck, ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TIPS = [
  {
    icon: MapPin,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.09)',
    border: 'rgba(249,115,22,0.20)',
    priority: 'HIGH',
    priorityColor: '#f97316',
    title: 'Meet in Public Spaces',
    tips: [
      'Always meet on campus — library entrance, canteen, or admin block.',
      'Avoid meeting at night or in isolated locations.',
      "Let a friend know where you're going and who you're meeting.",
    ],
  },
  {
    icon: Eye,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.16)',
    priority: 'HIGH',
    priorityColor: '#38bdf8',
    title: 'Inspect Before You Pay',
    tips: [
      'Test electronics before handing over money.',
      'Check for physical damage, scratches, or missing parts.',
      'Never pay before seeing and inspecting the actual item.',
    ],
  },
  {
    icon: Lock,
    color: '#7c6af7',
    bg: 'rgba(124,106,247,0.09)',
    border: 'rgba(124,106,247,0.20)',
    priority: 'CRITICAL',
    priorityColor: '#7c6af7',
    title: 'Protect Your Info',
    tips: [
      'Never share your bank account or UPI ID in chat.',
      "Don't share your home address or personal phone number.",
      "Use NextOwner's in-app chat only — no external platforms.",
    ],
  },
  {
    icon: PhoneCall,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.18)',
    priority: 'MEDIUM',
    priorityColor: '#34d399',
    title: 'Verify the Seller',
    tips: [
      'Look for the green Verified badge on seller profiles.',
      'Check their rating and previous transaction history.',
      'Trust your gut — if something feels off, walk away.',
    ],
  },
  {
    icon: ShieldAlert,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.18)',
    priority: 'CRITICAL',
    priorityColor: '#ef4444',
    title: 'Spot & Avoid Scams',
    tips: [
      "Be cautious of items priced unusually low — if it's too good, it probably is.",
      "Never pay via 'advance transfer' to reserve an item.",
      'Sellers asking you to pay outside the platform are a red flag.',
    ],
  },
]

const EMERGENCY = [
  { label: 'Campus Security',        value: '1800-XXX-XXXX',        color: '#ef4444' },
  { label: 'NextOwner Trust & Safety', value: 'safety@nextowner.in', color: '#f97316' },
  { label: 'Emergency Services',     value: '112',                  color: '#34d399' },
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
})

export default function SafetyTipsPage() {
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
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')}>
            Home
          </span>
          <span>/</span>
          <span style={{ color: '#eeeef2' }}>Safety Tips</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-10">

        {/* ── Hero ── */}
        <motion.div {...fade(0.05)} className="pt-14 pb-12 lg:pt-20">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-5"
            style={{
              background: 'rgba(249,115,22,0.09)',
              border: '1px solid rgba(249,115,22,0.22)',
              color: '#fb923c',
            }}
          >
            <ShieldCheck size={11} /> Your Safety, Our Priority
          </div>
          <h1 className="font-black leading-tight mb-4 text-[32px] lg:text-[48px]" style={{ color: '#eeeef2' }}>
            Stay{' '}
            <span className="gradient-text-brand">Safe</span>{' '}
            Always
          </h1>
          <p className="text-[14px] lg:text-[16px] leading-relaxed max-w-xl" style={{ color: '#55555f' }}>
            NextOwner is built on trust — but a few smart precautions go a long way.
            Follow these guidelines for safe, confident transactions every time.
          </p>
        </motion.div>

        {/* ── Safety tips grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-16">
          {TIPS.map(({ icon: Icon, color, bg, border, priority, priorityColor, title, tips }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.08 }}
              className="rounded-[20px] p-5"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>{title}</p>
                </div>
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: bg, color: priorityColor, border: `1px solid ${border}` }}
                >
                  {priority}
                </span>
              </div>
              <ul className="space-y-2.5">
                {tips.map((tip, ti) => (
                  <li key={ti} className="flex items-start gap-2.5">
                    <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" style={{ color }} />
                    <span className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Emergency + report strip (desktop side by side) ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 mb-14">

          {/* Emergency contacts */}
          <motion.div
            {...fade(0.5)}
            className="rounded-[20px] p-5 mb-4 lg:mb-0"
            style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.14)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} style={{ color: '#ef4444' }} />
              <p className="font-bold text-[13px]" style={{ color: '#ef4444' }}>Emergency Contacts</p>
            </div>
            <div className="space-y-3">
              {EMERGENCY.map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: '#8a8a9a' }}>{label}</span>
                  <span className="text-[12px] font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Report reminder */}
          <motion.div
            {...fade(0.55)}
            className="rounded-[20px] p-5"
            style={{
              background: 'linear-gradient(135deg,rgba(124,106,247,0.07) 0%,rgba(52,211,153,0.04) 100%)',
              border: '1px solid rgba(124,106,247,0.14)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} style={{ color: '#7c6af7' }} />
              <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>Report Suspicious Activity</p>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>
              If you ever feel unsafe or encounter a suspicious listing, use the{' '}
              <span style={{ color: '#a79cf9' }}>Report button</span> inside the app.
              Our Trust & Safety team reviews all reports within 2 hours.
            </p>
            <div
              className="mt-4 pt-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[11px]" style={{ color: '#55555f' }}>
                Direct line: <span style={{ color: '#34d399' }}>safety@nextowner.in</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── CTA ── */}
        <motion.div
          {...fade(0.6)}
          className="rounded-[24px] p-8 lg:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg,rgba(52,211,153,0.07) 0%,rgba(124,106,247,0.05) 100%)',
            border: '1px solid rgba(52,211,153,0.16)',
          }}
        >
          <h2 className="font-black text-[22px] lg:text-[28px] mb-3" style={{ color: '#eeeef2' }}>
            Trade with Confidence
          </h2>
          <p className="text-[13px] mb-8" style={{ color: '#55555f' }}>
            Every verified seller is a fellow student. Every transaction is backed by our safety team.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] font-bold text-[13px] text-white"
            style={{
              background: 'linear-gradient(135deg,#34d399,#059669)',
              boxShadow: '0 4px 24px rgba(52,211,153,0.28)',
            }}
          >
            Start Exploring Safely <ArrowRight size={14} />
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}
