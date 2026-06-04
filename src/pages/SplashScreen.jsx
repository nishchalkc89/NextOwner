import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center"
    >
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-orange-500/10 blur-[80px]" />
        <div className="absolute w-48 h-48 rounded-full bg-green-500/10 blur-[60px]" />
      </div>

      {/* Logo animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        {/* Logo PNG */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="drop-shadow-2xl"
        >
          <img
            src="/logo.png"
            alt="NextOwner"
            className="object-contain"
            style={{ height: 150, width: 'auto', maxWidth: 280 }}
          />
        </motion.div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-orange-400"
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
