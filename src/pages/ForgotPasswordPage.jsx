import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPassword } from '../services/authService'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(124,106,247,0.10) 0%, transparent 60%)' }}
      />

      {/* Back button */}
      <div className="px-5 pt-14 pb-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/login')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ArrowLeft size={17} className="text-gray-400" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 pb-16 max-w-sm mx-auto w-full">

        <AnimatePresence mode="wait">
          {sent ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center gap-5"
            >
              {/* Animated circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.22)' }}
              >
                <CheckCircle2 size={34} style={{ color: '#34d399' }} />
              </motion.div>

              <div>
                <h1 className="text-white font-black text-[24px] mb-2">Check Your Email</h1>
                <p className="text-[13px] leading-relaxed" style={{ color: '#55555f' }}>
                  If <strong className="text-gray-300">{email}</strong> is registered, we've sent a
                  password reset link. It expires in <strong className="text-gray-300">1 hour</strong>.
                </p>
              </div>

              <div
                className="w-full rounded-[16px] p-4 text-left space-y-2"
                style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#55555f' }}>
                  Didn't get the email?
                </p>
                <p className="text-[12px]" style={{ color: '#55555f' }}>
                  Check your spam folder. If it's still not there, you can{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="font-semibold transition-colors hover:text-white"
                    style={{ color: '#7c6af7' }}
                  >
                    try again
                  </button>
                  {' '}or{' '}
                  <a href="mailto:nishchalkc370@gmail.com" className="font-semibold transition-colors hover:text-white" style={{ color: '#f97316' }}>
                    contact support
                  </a>.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="w-full py-4 rounded-[18px] font-black text-[14px] text-white"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 20px rgba(124,106,247,0.30)' }}
              >
                Back to Sign In
              </motion.button>
            </motion.div>

          ) : (
            /* ── Form state ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Logo + heading */}
              <div className="flex flex-col items-center mb-8">
                <img
                  src="/logo.png"
                  alt="NextOwner"
                  className="object-contain mb-5"
                  style={{ height: 90, width: 'auto', maxWidth: 240 }}
                />
                <h1 className="text-white font-black text-[24px] text-center">Reset Password</h1>
                <p className="text-[13px] text-center mt-1.5 max-w-[260px]" style={{ color: '#55555f' }}>
                  Enter your account email and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email input */}
                <div
                  className="flex items-center gap-3 px-4 rounded-[14px]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.09)'}`,
                  }}
                >
                  <Mail size={15} className="text-gray-500 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] py-3.5 outline-none"
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] overflow-hidden"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
                    >
                      <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                      <p className="text-[12px]" style={{ color: '#f87171' }}>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-[18px] font-black text-[14px] text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 20px rgba(124,106,247,0.30)' }}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={14} /> Send Reset Link</>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-[12px] mt-6" style={{ color: '#37373f' }}>
                Remember your password?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold transition-colors hover:text-white"
                  style={{ color: '#55555f' }}
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
