import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const navigate        = useNavigate()
  const [email, setEmail]     = useState('')
  const [pass,  setPass]      = useState('')
  const [show,  setShow]      = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !pass) return toast.error('Enter credentials')
    setLoading(true)
    try {
      const { data } = await api.post('/admin/login', { email, password: pass })
      localStorage.setItem('admin_token', data.token)
      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: '#0a0a0a' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <Lock size={28} className="text-orange-400" />
          </div>
          <h1 className="text-white font-black text-2xl">Admin Panel</h1>
          <p className="text-gray-500 text-[13px] mt-1">NextOwner Administration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex items-center gap-3 px-4 rounded-[16px] h-12"
            style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input type="email" placeholder="Admin email" value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] outline-none" />
          </div>

          <div className="flex items-center gap-3 px-4 rounded-[16px] h-12"
            style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input type={show ? 'text' : 'password'} placeholder="Password" value={pass}
              onChange={e => setPass(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] outline-none" />
            <button type="button" onClick={() => setShow(s => !s)}>
              {show ? <EyeOff size={14} className="text-gray-600" /> : <Eye size={14} className="text-gray-600" />}
            </button>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-[16px] gradient-orange text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-orange mt-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Sign In to Admin'
            }
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
