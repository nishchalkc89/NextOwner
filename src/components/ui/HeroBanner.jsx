import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    id: 1,
    eyebrow: 'Campus Marketplace',
    title: 'Buy, Sell & Swap\nWithin Your Campus',
    sub: 'Trusted by students across 50+ universities.',
    cta: 'Explore Now',
    path: '/search',
    bg: 'linear-gradient(145deg, #0a2d18 0%, #061710 55%, #030d09 100%)',
    accent: '#22c55e',
    accentDim: '#22c55e22',
    items: [
      { emoji: '💻', top: '10%', right: '6%',  size: 40, rotate: 14  },
      { emoji: '🎧', top: '42%', right: '2%',  size: 32, rotate: -10 },
      { emoji: '📦', bottom: '18%', right: '10%', size: 36, rotate: 7 },
    ],
    figureColor: '#22c55e',
  },
  {
    id: 2,
    eyebrow: 'List in 2 Minutes',
    title: 'Turn Old Stuff\nInto Cash Fast',
    sub: 'Camera upload, instant listing, direct chat.',
    cta: 'Start Selling',
    path: '/sell',
    bg: 'linear-gradient(145deg, #2a1100 0%, #180900 55%, #0c0500 100%)',
    accent: '#f97316',
    accentDim: '#f9731622',
    items: [
      { emoji: '📱', top: '10%',  right: '8%',  size: 38, rotate: -12 },
      { emoji: '💰', top: '46%',  right: '4%',  size: 30, rotate: 10  },
      { emoji: '🛍️', bottom: '18%', right: '8%', size: 34, rotate: -6 },
    ],
    figureColor: '#f97316',
  },
  {
    id: 3,
    eyebrow: 'Verified Only',
    title: 'Every Seller\nStudent Verified',
    sub: 'Safe, secure deals verified with student ID.',
    cta: 'Get Verified',
    path: '/verify',
    bg: 'linear-gradient(145deg, #091628 0%, #050d18 55%, #020710 100%)',
    accent: '#60a5fa',
    accentDim: '#60a5fa22',
    items: [
      { emoji: '🎓', top: '10%',  right: '8%',  size: 36, rotate: 10  },
      { emoji: '🛡️', top: '44%',  right: '4%',  size: 30, rotate: -8  },
      { emoji: '✅', bottom: '18%', right: '10%', size: 32, rotate: 6  },
    ],
    figureColor: '#60a5fa',
  },
]

function StudentFigure({ color }) {
  return (
    <div
      className="absolute right-3 bottom-0 pointer-events-none select-none"
      style={{ width: 100, height: 148 }}
    >
      <svg viewBox="0 0 90 148" className="w-full h-full" fill="none">
        <ellipse cx="45" cy="145" rx="24" ry="3" fill={color} opacity="0.18" />
        <path d="M34 128 L30 146" stroke={color} strokeWidth="9" strokeLinecap="round" opacity="0.22" />
        <path d="M56 128 L60 146" stroke={color} strokeWidth="9" strokeLinecap="round" opacity="0.22" />
        <ellipse cx="45" cy="110" rx="23" ry="26" fill={color} opacity="0.12" />
        <path d="M22 94 Q45 76 68 94 L65 130 Q45 140 25 130 Z" fill={color} opacity="0.25" />
        <path d="M27 94 Q45 78 63 94" stroke={color} strokeWidth="2" opacity="0.45" fill="none" />
        <circle cx="45" cy="66" r="17" fill={color} opacity="0.20" />
        <ellipse cx="45" cy="51" rx="17" ry="9" fill={color} opacity="0.30" />
        <ellipse cx="45" cy="66" rx="10" ry="12" fill="white" opacity="0.05" />
        <path d="M22 97 Q9 106 11 120" stroke={color} strokeWidth="7" strokeLinecap="round" opacity="0.28" />
        <rect x="4" y="114" width="13" height="19" rx="2" fill={color} opacity="0.48" />
        <rect x="6" y="116" width="9" height="12" rx="1" fill="white" opacity="0.28" />
        <path d="M68 97 Q80 108 77 120" stroke={color} strokeWidth="7" strokeLinecap="round" opacity="0.28" />
        <rect x="53" y="86" width="19" height="30" rx="5" fill={color} opacity="0.20" />
        <rect x="55" y="90" width="15" height="7" rx="2" fill={color} opacity="0.14" />
      </svg>
    </div>
  )
}

export default function HeroBanner() {
  const [idx, setIdx] = useState(0)
  const navigate      = useNavigate()
  const slide         = SLIDES[idx]

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 4800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="px-4">
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{ background: slide.bg, minHeight: 188 }}
      >
        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 80% at 85% 50%, ${slide.accentDim} 0%, transparent 70%)`,
          }}
        />

        {/* Bottom city silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-9 pointer-events-none" style={{ opacity: 0.07 }}>
          <svg viewBox="0 0 375 36" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0 36 L0 26 L14 26 L14 16 L24 16 L24 8 L34 8 L34 16 L48 16 L48 22
                 L62 22 L62 10 L76 10 L76 18 L92 18 L92 26 L116 26 L116 14 L132 14
                 L132 6 L142 6 L142 14 L158 14 L158 26 L178 26 L178 20 L193 20
                 L193 12 L208 12 L208 20 L228 20 L228 26 L253 26 L253 16 L268 16
                 L268 8 L278 8 L278 16 L294 16 L294 22 L308 22 L308 26 L328 26
                 L328 18 L344 18 L344 26 L375 26 L375 36 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Floating emoji items — no mode="wait", multiple children is fine */}
        <AnimatePresence>
          {slide.items.map((item, i) => (
            <motion.div
              key={`${slide.id}-${i}`}
              initial={{ opacity: 0, scale: 0.4, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 220, damping: 20 }}
              className="absolute select-none"
              style={{
                top: item.top, right: item.right, bottom: item.bottom,
                fontSize: item.size,
                transform: `rotate(${item.rotate}deg)`,
                filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.55))',
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Student figure */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`fig-${slide.id}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35 }}
          >
            <StudentFigure color={slide.figureColor} />
          </motion.div>
        </AnimatePresence>

        {/* Text content */}
        <div className="relative z-10 px-5 pt-6 pb-12" style={{ maxWidth: '60%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32 }}
              className="space-y-1.5"
            >
              {/* Eyebrow */}
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: slide.accent, opacity: 0.85 }}
              >
                {slide.eyebrow}
              </p>

              {/* Title */}
              <h2
                className="text-white font-black leading-[1.2] whitespace-pre-line"
                style={{ fontSize: 18 }}
              >
                {slide.title}
              </h2>

              {/* Subtitle */}
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.50)' }}
              >
                {slide.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(slide.path)}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold"
            style={{
              background: slide.accent,
              boxShadow: `0 4px 18px ${slide.accent}55`,
            }}
          >
            {slide.cta}
            <ArrowRight size={11} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3.5 left-5 flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setIdx(i)}
              animate={{
                width: i === idx ? 20 : 5,
                opacity: i === idx ? 1 : 0.3,
                background: i === idx ? slide.accent : '#ffffff',
              }}
              transition={{ duration: 0.28 }}
              className="h-[4px] rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
