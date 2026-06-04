import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { register, login, loginGoogle } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function AuthInput({ icon: Icon, right, ...props }) {
  return (
    <div
      className="flex items-center gap-3 px-4 rounded-[14px]"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
      <Icon size={15} className="text-gray-500 flex-shrink-0" />
      <input
        {...props}
        className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] py-3.5 outline-none"
      />
      {right}
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <span className="text-gray-600 text-[11px] font-medium">or continue with</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

async function loadGoogleScript() {
  if (window.google?.accounts) return
  return new Promise((resolve, reject) => {
    if (document.getElementById('gsi-script')) { resolve(); return }
    const s = document.createElement('script')
    s.id = 'gsi-script'
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(s)
  })
}

export default function LoginPage() {
  const [tab,      setTab]      = useState('login')
  const [form,     setForm]     = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const { login: setUser } = useAuth()
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let data
      if (tab === 'login') {
        data = await login(form.email, form.password)
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`)
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); setLoading(false); return }
        data = await register(form.name, form.email, form.password)
        toast.success('Account created! 🎉')
      }
      setUser(data.user)
      navigate(data.isNew !== false ? '/verify' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      toast.error('Add VITE_GOOGLE_CLIENT_ID to .env to enable Google Sign-In')
      return
    }
    setGLoading(true)
    try {
      await loadGoogleScript()
      await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) { reject(new Error(tokenResponse.error)); return }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              })
              const profile = await res.json()
              const data = await loginGoogle({
                accessToken: tokenResponse.access_token,   // ← backend verifies this
                name:        profile.name,
                email:       profile.email,
                googleId:    profile.sub,
                avatar:      profile.picture,
              })
              setUser(data.user)
              toast.success(`Welcome, ${data.user.name.split(' ')[0]}! 👋`)
              navigate(data.isNew ? '/verify' : '/')
              resolve()
            } catch (err) {
              reject(err)
            }
          },
        })
        client.requestAccessToken()
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed')
    } finally {
      setGLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.08) 0%, transparent 60%)' }}
      />

      {/* Back button */}
      <div className="px-5 pt-14 pb-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ArrowLeft size={17} className="text-gray-400" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 pb-12 max-w-sm mx-auto w-full">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <img
            src="/logo.png"
            alt="NextOwner"
            className="object-contain mb-5"
            style={{ height: 100, width: 'auto', maxWidth: 260 }}
          />
          <AnimatePresence mode="wait">
            <motion.h1
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-white font-black text-2xl text-center"
            >
              {tab === 'login' ? 'Welcome Back 👋' : 'Create Account'}
            </motion.h1>
          </AnimatePresence>
          <p className="text-gray-500 text-[13px] mt-1">Student Marketplace</p>
        </motion.div>

        {/* Tab switcher */}
        <div
          className="flex p-1 mb-5 rounded-[18px]"
          style={{ background: '#151518', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {['login', 'register'].map(t => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.96 }}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-[14px] text-[13px] font-semibold capitalize transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }
                : { color: '#6b7280' }
              }
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </motion.button>
          ))}
        </div>

        {/* Google button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogle}
          disabled={gLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-[16px] font-semibold text-[13px] text-white disabled:opacity-60"
          style={{ background: '#1e1e26', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {gLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 7.5 29.5 5 24 5 16.3 5 9.6 8.9 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.6 5.1C9.6 39.1 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C43 35 44 30 44 24c0-1.3-.1-2.7-.4-3.9z"/>
            </svg>
          )}
          Continue with Google
        </motion.button>

        <Divider />

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence>
            {tab === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <AuthInput
                  icon={User}
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            required
          />

          <AuthInput
            icon={Lock}
            type={showPass ? 'text' : 'password'}
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            required
            minLength={6}
            right={
              <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={15} className="text-gray-500" /> : <Eye size={15} className="text-gray-500" />}
              </motion.button>
            }
          />

          {tab === 'login' && (
            <div className="flex justify-end -mt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate('/forgot-password')}
                className="text-[12px] font-medium transition-colors hover:text-orange-400"
                style={{ color: '#55555f' }}
              >
                Forgot password?
              </motion.button>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-[18px] gradient-orange text-white font-black text-[14px] disabled:opacity-50 shadow-orange mt-1"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        <p className="text-center text-gray-700 text-[11px] mt-6">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}
