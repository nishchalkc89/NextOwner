import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-dismissed')
    if (dismissed) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setVisible(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto glass rounded-2xl p-4 z-50 border border-orange-500/20"
        >
          <button onClick={handleDismiss} className="absolute top-3 right-3">
            <X size={16} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Install NextOwner</p>
              <p className="text-gray-400 text-xs">Add to home screen for the best experience</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleInstall}
            className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Download size={15} /> Install App
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
