import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const CATS = [
  { name: 'Electronics',      emoji: '💻', bg: '#0b1f0f', ring: '#22c55e'  },
  { name: 'Furniture',        emoji: '🪑', bg: '#1f0d00', ring: '#f97316'  },
  { name: 'Books',            emoji: '📚', bg: '#1a0d28', ring: '#a855f7'  },
  { name: 'Appliances',       emoji: '🔌', bg: '#1f1800', ring: '#eab308'  },
  { name: 'Vehicles',         emoji: '🚲', bg: '#200808', ring: '#ef4444'  },
  { name: 'Hostel Essentials',emoji: '🛏️', bg: '#071a1a', ring: '#06b6d4'  },
  { name: 'Clothes',          emoji: '👕', bg: '#0d0a1f', ring: '#8b5cf6'  },
  { name: 'Others',           emoji: '📦', bg: '#141416', ring: '#9ca3af'  },
]

export default function CategorySlider({ active = '' }) {
  const navigate = useNavigate()

  return (
    <div>
      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-bold text-[14px]" style={{ color: '#eeeef2' }}>Categories</h2>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
          {CATS.map(({ name, emoji, bg, ring }, i) => {
            const isActive = active === name
            return (
              <motion.button
                key={name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035, type: 'spring', stiffness: 320, damping: 26 }}
                whileTap={{ scale: 0.82 }}
                onClick={() => navigate(`/search?category=${encodeURIComponent(name)}`)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px]"
                  style={{
                    background: bg,
                    border: isActive ? `2px solid ${ring}` : '1.5px solid rgba(255,255,255,0.06)',
                    boxShadow: isActive ? `0 0 0 3px ${ring}20, 0 4px 16px ${ring}28` : 'none',
                  }}
                >
                  {emoji}
                </div>
                <span className="text-[10px] font-medium leading-none"
                  style={{ color: isActive ? ring : '#55555f' }}>
                  {name.split(' ')[0]}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Desktop: compact pill grid */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[14px]" style={{ color: '#eeeef2' }}>Categories</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map(({ name, emoji, bg, ring }, i) => {
            const isActive = active === name
            return (
              <motion.button
                key={name}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate(`/search?category=${encodeURIComponent(name)}`)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{
                  background: isActive ? bg : 'rgba(255,255,255,0.035)',
                  border: isActive ? `1px solid ${ring}55` : '1px solid rgba(255,255,255,0.07)',
                  color: isActive ? ring : '#55555f',
                }}
              >
                <span style={{ fontSize: 14 }}>{emoji}</span>
                {name.split(' ')[0]}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
