import { motion } from 'framer-motion'

const COUNTRIES = [
  { id: 'india', flag: '🇮🇳', label: 'India' },
  { id: 'nepal', flag: '🇳🇵', label: 'Nepal' },
]

/**
 * CountryPicker
 * Renders two flag-pill buttons (India / Nepal).
 * Props:
 *   value    — current country id ('india' | 'nepal' | '')
 *   onChange — (id: string) => void
 *   label    — optional heading text (default 'Select Country')
 */
export default function CountryPicker({ value = '', onChange, label = 'Select Country' }) {
  return (
    <div>
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#55555f' }}>
          {label}
        </p>
      )}
      <div className="flex gap-3">
        {COUNTRIES.map(({ id, flag, label: name }) => {
          const active = value === id
          return (
            <motion.button
              key={id}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => onChange(id)}
              className="flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-[14px] font-semibold text-[13px] transition-all"
              style={active ? {
                background: 'rgba(249,115,22,0.12)',
                border: '1.5px solid rgba(249,115,22,0.40)',
                color: '#fb923c',
                boxShadow: '0 0 0 3px rgba(249,115,22,0.08)',
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#6b7280',
              }}
            >
              <span className="text-[18px] leading-none">{flag}</span>
              <span>{name}</span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: 'rgba(249,115,22,0.25)', color: '#f97316' }}
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
