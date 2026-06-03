import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '../services/authService'

/* ── Password strength ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6)  score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw))  score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  const levels = [
    { label: 'Very Weak', color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Good',      color: '#22c55e' },
    { label: 'Strong',    color: '#34d399' },
  ]
  return { score, ...levels[Math.min(score, 4)] }
}

function StrengthBar({ password }) {
  const { score, label, color } = getStrength(password)
  if (!password) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="overflow-hidden"
    >
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <p className="text-[11px] mt-1.5 font-semibold" style={{ color }}>
        {label}
      </p>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  const navigate  = useNavigate()
  const { token } = useParams()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  // If token is missing, redirect immediately
  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true })
  }, [token, navigate])

  const strength = getStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (strength.score < 2) {
      setError('Please choose a stronger password.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      toast.success('Password updated!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = confirm.length > 0 && password === confirm

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(52,211,153,0.08) 0%, transparent 60%)' }}
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
          {success ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center gap-5"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 16 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}
              >
                <CheckCircle2 size={34} style={{ color: '#34d399' }} />
              </motion.div>

              <div>
                <h1 className="text-white font-black text-[24px] mb-2">Password Updated!</h1>
                <p className="text-[13px] leading-relaxed" style={{ color: '#55555f' }}>
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="w-full py-4 rounded-[18px] font-black text-[14px] text-white"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.30)' }}
              >
                Sign In Now
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
                  src="/logo.svg"
                  alt="NextOwner"
                  className="object-contain mb-5"
                  style={{ height: 90, width: 'auto', maxWidth: 240 }}
                />
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(52,211,153,0.09)', border: '1px solid rgba(52,211,153,0.20)' }}
                >
                  <ShieldCheck size={20} style={{ color: '#34d399' }} />
                </div>
                <h1 className="text-white font-black text-[24px] text-center">New Password</h1>
                <p className="text-[13px] text-center mt-1.5 max-w-[260px]" style={{ color: '#55555f' }}>
                  Choose a strong password you haven't used before.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Password field */}
                <div>
                  <div
                    className="flex items-center gap-3 px-4 rounded-[14px]"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${error && !password ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.09)'}`,
                    }}
                  >
                    <Lock size={15} className="text-gray-500 flex-shrink-0" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="New password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] py-3.5 outline-none"
                      autoComplete="new-password"
                      autoFocus
                    />
                    <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => setShowPw(s => !s)}>
                      {showPw
                        ? <EyeOff size={15} className="text-gray-500" />
                        : <Eye size={15} className="text-gray-500" />}
                    </motion.button>
                  </div>
                  <StrengthBar password={password} />
                </div>

                {/* Confirm password field */}
                <div
                  className="flex items-center gap-3 px-4 rounded-[14px]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${
                      confirm.length > 0
                        ? passwordsMatch
                          ? 'rgba(52,211,153,0.35)'
                          : 'rgba(239,68,68,0.35)'
                        : 'rgba(255,255,255,0.09)'
                    }`,
                  }}
                >
                  <Lock size={15} className="text-gray-500 flex-shrink-0" />
                  <input
                    type={showConf ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError('') }}
                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] py-3.5 outline-none"
                    autoComplete="new-password"
                  />
                  {confirm.length > 0 && (
                    <div className="flex-shrink-0">
                      {passwordsMatch
                        ? <CheckCircle2 size={14} style={{ color: '#34d399' }} />
                        : <AlertCircle size={14} style={{ color: '#ef4444' }} />}
                    </div>
                  )}
                  <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => setShowConf(s => !s)}>
                    {showConf
                      ? <EyeOff size={15} className="text-gray-500" />
                      : <Eye size={15} className="text-gray-500" />}
                  </motion.button>
                </div>

                {/* Error */}
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

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-[18px] font-black text-[14px] text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.28)', marginTop: 4 }}
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Update Password'}
                </motion.button>
              </form>

              <p className="text-center text-[12px] mt-6" style={{ color: '#37373f' }}>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="font-medium transition-colors hover:text-gray-400"
                  style={{ color: '#55555f' }}
                >
                  Request a new link
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
