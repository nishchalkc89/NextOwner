import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, X, TrendingUp, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const trending = ['iPhone 13', 'Study Table', 'Calculus Book', 'Mini Fridge', 'Cycle', 'Hoodie']
const recentSearches = ['MacBook Air', 'Desk Lamp', 'Physics Notes']

export default function SearchScreen({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleSearch = (q) => {
    const term = q || query
    if (!term.trim()) return
    onClose()
    navigate(`/search?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe mt-2 pb-3 border-b border-white/5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
          <ArrowLeft size={22} className="text-gray-300" />
        </motion.button>
        <div className="flex-1 flex items-center gap-2 glass rounded-2xl px-4 h-11">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, categories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={14} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Recent searches */}
        {recentSearches.length > 0 && !query && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Clock size={14} className="text-gray-400" /> Recent
              </h3>
              <button className="text-orange-400 text-xs">Clear all</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearch(s)}
                  className="glass px-3 py-1.5 rounded-full text-gray-300 text-sm flex items-center gap-1.5"
                >
                  <Clock size={11} className="text-gray-500" />
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {!query && (
          <div>
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-orange-400" /> Trending on Campus
            </h3>
            <div className="flex flex-wrap gap-2">
              {trending.map((t, i) => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearch(t)}
                  className="glass px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                >
                  <span className="text-orange-400 font-bold text-xs">{i + 1}</span>
                  <span className="text-gray-200">{t}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Live suggestions */}
        {query && (
          <div className="space-y-1">
            {trending
              .filter(t => t.toLowerCase().includes(query.toLowerCase()))
              .map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch(s)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Search size={14} className="text-gray-500" />
                  <span className="text-gray-200 text-sm">{s}</span>
                </motion.button>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
