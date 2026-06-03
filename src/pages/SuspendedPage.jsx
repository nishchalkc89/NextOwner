import { motion } from 'framer-motion'
import { ShieldX, Mail, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SuspendedPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#0a0a0a' }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-7"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.08))',
          border: '1px solid rgba(239,68,68,0.3)',
          boxShadow: '0 0 40px rgba(239,68,68,0.15)',
        }}
      >
        <ShieldX size={42} className="text-red-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <h1 className="text-white font-black text-2xl leading-tight mb-3">
          Account Suspended
        </h1>
        <p className="text-gray-400 text-[14px] leading-relaxed max-w-xs">
          Your NextOwner account has been suspended due to a violation of our community guidelines.
        </p>
        <p className="text-gray-600 text-[12px] mt-3 max-w-xs">
          If you believe this is a mistake, please reach out to our support team.
        </p>
      </motion.div>

      {/* Contact support */}
      <motion.a
        href="mailto:nishchalkc370@gmail.com?subject=NextOwner Account Appeal&body=Hello NextOwner Support,%0D%0A%0D%0AMy account has been suspended and I would like to appeal this decision.%0D%0A%0D%0APlease review my case.%0D%0A%0D%0AThank you."
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="mt-8 flex items-center gap-2.5 px-7 py-3.5 rounded-[16px] font-bold text-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.08))',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171',
        }}
      >
        <Mail size={15} />
        Contact Support
      </motion.a>

      {/* Back / logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => { logout(); navigate('/login') }}
        className="mt-4 flex items-center gap-1.5 text-gray-600 text-[12px] font-medium"
      >
        <ArrowLeft size={13} />
        Back to Login
      </motion.button>
    </div>
  )
}
