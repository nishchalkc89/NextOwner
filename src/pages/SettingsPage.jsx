import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, User, Lock, Bell, Trash2, ChevronRight,
  Eye, EyeOff, Shield, LogOut, Check, X,
  BellRing, Database, Info, Settings, Sliders,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

/* ── Toggle ─────────────────────────────────────── */
function Toggle({ value, onChange }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
      style={{ background: value ? '#7c6af7' : 'rgba(255,255,255,0.10)' }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        animate={{ left: value ? '1.375rem' : '0.25rem' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    </motion.button>
  )
}

/* ── Field ───────────────────────────────────────── */
function Field({ icon: Icon, type = 'text', placeholder, value, onChange, right }) {
  return (
    <div
      className="flex items-center gap-3 px-4 rounded-[12px] h-11"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
      <Icon size={13} style={{ color: '#55555f', flexShrink: 0 }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent placeholder-gray-700 text-[13px] outline-none"
        style={{ color: '#eeeef2' }}
      />
      {right}
    </div>
  )
}

/* ── Change Password Modal ───────────────────────── */
function PasswordModal({ onClose }) {
  const [form,   setForm]   = useState({ current: '', next: '', confirm: '' })
  const [show,   setShow]   = useState({})
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.current || !form.next) return toast.error('Fill in all fields')
    if (form.next.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.next !== form.confirm) return toast.error('Passwords do not match')
    setSaving(true)
    try {
      await api.put('/users/password', { currentPassword: form.current, newPassword: form.next })
      toast.success('Password updated!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-6 space-y-3"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-black text-[16px]" style={{ color: '#eeeef2' }}>Change Password</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#55555f' }}>Must be at least 6 characters</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={13} style={{ color: '#8a8a9a' }} />
          </motion.button>
        </div>

        {[
          { key: 'current', placeholder: 'Current password' },
          { key: 'next',    placeholder: 'New password (min 6 chars)' },
          { key: 'confirm', placeholder: 'Confirm new password' },
        ].map(({ key, placeholder }) => (
          <Field
            key={key}
            icon={Lock}
            type={show[key] ? 'text' : 'password'}
            placeholder={placeholder}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            right={
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}>
                {show[key]
                  ? <EyeOff size={13} style={{ color: '#55555f' }} />
                  : <Eye    size={13} style={{ color: '#55555f' }} />}
              </motion.button>
            }
          />
        ))}

        <motion.button
          whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-[12px] font-bold text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 18px rgba(124,106,247,0.28)' }}
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Check size={14} /> Update Password</>
          }
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ── Delete Account Modal ────────────────────────── */
function DeleteModal({ onClose, onConfirm }) {
  const [confirm, setConfirm] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-6"
        style={{ background: '#13131a', border: '1px solid rgba(239,68,68,0.22)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <p className="font-black text-[15px]" style={{ color: '#eeeef2' }}>Delete Account</p>
            <p className="text-[11px]" style={{ color: '#ef4444', opacity: 0.8 }}>This action is irreversible</p>
          </div>
        </div>
        <p className="text-[12px] leading-relaxed mb-4" style={{ color: '#8a8a9a' }}>
          All your listings, messages, and profile data will be permanently deleted.
          Type <span className="text-red-400 font-bold">DELETE</span> to confirm.
        </p>
        <div className="flex items-center px-4 rounded-[12px] h-11 mb-4"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.20)' }}>
          <input
            type="text"
            placeholder="Type DELETE to confirm"
            value={confirm}
            onChange={e => setConfirm(e.target.value.toUpperCase())}
            className="flex-1 bg-transparent text-red-400 placeholder-gray-700 text-[13px] outline-none font-bold"
          />
        </div>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            className="flex-1 py-3 rounded-[12px] font-semibold text-[13px]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8a9a' }}>
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => confirm === 'DELETE' && onConfirm()}
            disabled={confirm !== 'DELETE'}
            className="flex-1 py-3 rounded-[12px] text-white font-bold text-[13px] disabled:opacity-35 transition-opacity"
            style={{ background: '#ef4444' }}
          >
            Delete Forever
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Setting row ─────────────────────────────────── */
function SettingRow({ icon: Icon, iconColor = '#8a8a9a', iconBg = 'rgba(255,255,255,0.05)',
  label, sub, onPress, danger = false, right, badge }) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      whileHover={{ background: 'rgba(255,255,255,0.025)' }}
      onClick={onPress}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 border-b last:border-0 text-left transition-colors"
      style={{ borderColor: 'rgba(255,255,255,0.055)' }}
    >
      <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={15} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold" style={{ color: danger ? '#f87171' : '#eeeef2' }}>{label}</p>
          {badge && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
              {badge}
            </span>
          )}
        </div>
        {sub && <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#55555f' }}>{sub}</p>}
      </div>
      {right ?? <ChevronRight size={13} style={{ color: '#37373f' }} />}
    </motion.button>
  )
}

/* ── Nav items ───────────────────────────────────── */
const NAV = [
  { name: 'Account',       icon: User,    color: '#fb923c', sub: 'Profile & security'   },
  { name: 'Notifications', icon: Bell,    color: '#7c6af7', sub: 'Alerts & preferences' },
  { name: 'Privacy',       icon: Eye,     color: '#38bdf8', sub: 'Data & visibility'    },
  { name: 'Danger Zone',   icon: Trash2,  color: '#ef4444', sub: 'Irreversible actions' },
]

/* ── Section content ─────────────────────────────── */
function SectionContent({ name, user, setShowPwd, setShowDel, notifPrefs, setNotifPrefs, navigate, handleLogout }) {
  if (name === 'Account') return (
    <div className="space-y-4">
      {/* Profile preview card */}
      <div className="flex items-center gap-4 p-4 rounded-[16px]"
        style={{ background: 'rgba(124,106,247,0.05)', border: '1px solid rgba(124,106,247,0.12)' }}>
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
          style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)', boxShadow: '0 0 0 3px rgba(124,106,247,0.2)' }}>
          {user.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            : user.name?.[0]?.toUpperCase()
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] truncate" style={{ color: '#eeeef2' }}>{user.name || 'Your Name'}</p>
          <p className="text-[12px] truncate" style={{ color: '#55555f' }}>{user.email}</p>
          {user.university && (
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,106,247,0.10)', color: '#a79cf9', border: '1px solid rgba(124,106,247,0.20)' }}>
              {user.university}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-[18px] overflow-hidden"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
        <SettingRow
          icon={User} iconColor="#fb923c" iconBg="rgba(249,115,22,0.10)"
          label="Edit Profile" sub="Change name, university, photo"
          onPress={() => navigate('/profile')}
        />
        <SettingRow
          icon={Lock} iconColor="#a79cf9" iconBg="rgba(124,106,247,0.10)"
          label="Change Password" sub="Update your account password"
          onPress={() => setShowPwd(true)}
        />
        <SettingRow
          icon={Shield} iconColor="#34d399" iconBg="rgba(52,211,153,0.10)"
          label="Student Verification" sub="Get your verified campus badge"
          onPress={() => navigate('/verify')}
          badge={user.isVerified ? 'Verified' : null}
        />
      </div>
    </div>
  )

  if (name === 'Notifications') return (
    <div className="space-y-4">
      <div className="rounded-[18px] overflow-hidden"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { key: 'messages',     label: 'Message Alerts',      sub: 'New messages from buyers & sellers', iconColor: '#7c6af7', icon: BellRing },
          { key: 'deals',        label: 'New Listings',         sub: 'Items matching your interests',      iconColor: '#f97316', icon: Bell     },
          { key: 'verification', label: 'Verification Updates', sub: 'Status changes on your account',     iconColor: '#34d399', icon: Shield   },
          { key: 'marketing',    label: 'Promotions',           sub: 'Tips, highlights & campus news',     iconColor: '#8a8a9a', icon: Info     },
        ].map(({ key, label, sub, iconColor, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center gap-3.5 px-4 py-3.5 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.055)' }}
          >
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor}18` }}>
              <Icon size={15} style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold" style={{ color: '#eeeef2' }}>{label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#55555f' }}>{sub}</p>
            </div>
            <Toggle value={notifPrefs[key]} onChange={v => setNotifPrefs(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>
      <p className="text-[11px] px-1 leading-relaxed" style={{ color: '#37373f' }}>
        Notification preferences are stored locally. Push notification support coming soon.
      </p>
    </div>
  )

  if (name === 'Privacy') return (
    <div className="space-y-4">
      <div className="rounded-[18px] overflow-hidden"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
        <SettingRow
          icon={Eye} iconColor="#38bdf8" iconBg="rgba(56,189,248,0.10)"
          label="Privacy Policy" sub="How we collect and use your data"
          onPress={() => navigate('/privacy')}
        />
        <SettingRow
          icon={Database} iconColor="#8a8a9a" iconBg="rgba(255,255,255,0.05)"
          label="Data & Storage" sub="Manage your stored data and cache"
          onPress={() => toast('Coming soon')}
        />
        <SettingRow
          icon={Shield} iconColor="#8a8a9a" iconBg="rgba(255,255,255,0.05)"
          label="Account Privacy" sub="Control who can see your profile"
          onPress={() => toast('Coming soon')}
        />
      </div>
      <div className="rounded-[14px] p-4"
        style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.10)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: '#55555f' }}>
          <span className="font-semibold" style={{ color: '#38bdf8' }}>Your data is safe.</span>{' '}
          NextOwner never sells your personal information. All chats are private between users.
        </p>
      </div>
    </div>
  )

  if (name === 'Danger Zone') return (
    <div className="space-y-4">
      <div className="rounded-[18px] overflow-hidden"
        style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
        <SettingRow
          icon={Sliders} iconColor="#8a8a9a" iconBg="rgba(255,255,255,0.05)"
          label="App Version" sub="NextOwner v1.0.0 — latest"
          onPress={() => {}}
          right={<span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399' }}>Up to date</span>}
        />
      </div>

      <div className="rounded-[18px] p-4"
        style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.14)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#f97316', opacity: 0.7 }}>
          Session
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[14px] transition-colors"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(249,115,22,0.10)' }}>
            <LogOut size={15} className="text-orange-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-semibold" style={{ color: '#eeeef2' }}>Sign Out</p>
            <p className="text-[11px]" style={{ color: '#55555f' }}>Log out from this device</p>
          </div>
          <ChevronRight size={13} style={{ color: '#37373f' }} />
        </motion.button>
      </div>

      <div className="rounded-[18px] p-4"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.16)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#ef4444', opacity: 0.7 }}>
          Danger Zone
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDel(true)}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[14px]"
          style={{ background: '#13131a', border: '1px solid rgba(239,68,68,0.16)' }}
        >
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.10)' }}>
            <Trash2 size={15} className="text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-bold text-red-400">Delete Account</p>
            <p className="text-[11px]" style={{ color: '#55555f' }}>Permanently remove your account and all data</p>
          </div>
          <ChevronRight size={13} style={{ color: '#ef4444', opacity: 0.5 }} />
        </motion.button>
      </div>
    </div>
  )

  return null
}

/* ── Main ────────────────────────────────────────── */
export default function SettingsPage() {
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [showPassword,  setShowPwd]  = useState(false)
  const [showDelete,    setShowDel]  = useState(false)
  const [activeSection, setSection]  = useState('Account')
  const [notifPrefs, setNotifPrefs]  = useState({
    messages: true, deals: true, verification: true, marketing: false,
  })

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/account')
      logout()
      toast.success('Account deleted')
      navigate('/')
    } catch { toast.error('Could not delete account. Try again.') }
    setShowDel(false)
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) { navigate('/login'); return null }

  const activeNav = NAV.find(n => n.name === activeSection)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ background: '#0c0c10' }}
    >
      {/* ── Mobile sticky header ── */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4"
        style={{
          paddingTop:    'max(env(safe-area-inset-top, 0px), 14px)',
          paddingBottom: 14,
          background:     'rgba(12,12,16,0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom:   '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <ArrowLeft size={15} style={{ color: '#c4c4cc' }} />
        </motion.button>
        <h1 className="font-bold text-[16px]" style={{ color: '#eeeef2' }}>Settings</h1>
      </div>

      {/* ── Desktop sticky page header ── */}
      <div
        className="hidden lg:flex items-center justify-between px-10 h-[60px] sticky top-0 z-40"
        style={{
          background:     'rgba(12,12,16,0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom:   '1px solid rgba(255,255,255,0.055)',
        }}
      >
        {/* Left — back + breadcrumb */}
        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-[12px] font-medium"
            style={{
              color:      '#8a8a9a',
              background: 'rgba(255,255,255,0.04)',
              border:     '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <ArrowLeft size={12} />
            Back
          </motion.button>
          <span style={{ color: '#2a2a36', fontSize: 14 }}>/</span>
          <Settings size={13} style={{ color: '#55555f' }} />
          <span className="text-[13px] font-semibold" style={{ color: '#c4c4cc' }}>Settings</span>
          {activeSection !== 'Account' && (
            <>
              <span style={{ color: '#2a2a36', fontSize: 14 }}>/</span>
              <span className="text-[12px] font-medium" style={{ color: '#55555f' }}>{activeSection}</span>
            </>
          )}
        </div>

        {/* Right — user chip */}
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => navigate('/profile')}
        >
          <div
            className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px]"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}
          >
            {user.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : user.name?.[0]?.toUpperCase()
            }
          </div>
          <span className="text-[12px] font-medium" style={{ color: '#8a8a9a' }}>
            {user.name?.split(' ')[0]}
          </span>
          <ChevronRight size={11} style={{ color: '#37373f' }} />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPassword && <PasswordModal onClose={() => setShowPwd(false)} />}
        {showDelete   && <DeleteModal   onClose={() => setShowDel(false)} onConfirm={handleDeleteAccount} />}
      </AnimatePresence>

      {/* ── Mobile: single-column scrollable ── */}
      <div className="lg:hidden max-w-lg mx-auto px-4 pt-5 pb-28 space-y-5">
        {NAV.map(({ name, icon: Icon, color, sub }) => (
          <div key={name}>
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <div className="w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={11} style={{ color }} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#37373f' }}>
                {name}
              </p>
            </div>
            <SectionContent
              name={name}
              user={user}
              setShowPwd={setShowPwd}
              setShowDel={setShowDel}
              notifPrefs={notifPrefs}
              setNotifPrefs={setNotifPrefs}
              navigate={navigate}
              handleLogout={handleLogout}
            />
          </div>
        ))}
      </div>

      {/* ── Desktop: Discord-style two-column ── */}
      <div className="hidden lg:flex min-h-[calc(100vh-60px)]">

        {/* Left sidebar nav — fixed width */}
        <div
          className="flex-shrink-0 flex flex-col border-r"
          style={{
            width: 260,
            borderColor: 'rgba(255,255,255,0.055)',
            background: '#0a0a0e',
            position: 'sticky',
            top: 60,
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
          }}
        >
          <div className="px-4 pt-7 pb-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-2"
              style={{ color: '#37373f' }}>
              Preferences
            </p>

            <div className="space-y-0.5">
              {NAV.map(({ name, icon: Icon, color, sub }) => {
                const active = activeSection === name
                return (
                  <motion.button
                    key={name}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSection(name)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-all"
                    style={{
                      background: active ? 'rgba(124,106,247,0.10)' : 'transparent',
                      border:     active ? '1px solid rgba(124,106,247,0.16)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: active ? `${color}22` : 'rgba(255,255,255,0.04)' }}
                    >
                      <Icon size={14} style={{ color: active ? color : '#55555f' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold leading-none"
                        style={{ color: active ? '#eeeef2' : '#8a8a9a' }}>
                        {name}
                      </p>
                      <p className="text-[10px] mt-0.5 truncate"
                        style={{ color: active ? '#55555f' : '#37373f' }}>
                        {sub}
                      </p>
                    </div>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#7c6af7', boxShadow: '0 0 6px rgba(124,106,247,0.5)' }} />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Divider */}
            <div className="my-4 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* User card */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-left"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#f97316)' }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : user.name?.[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: '#eeeef2' }}>{user.name}</p>
                <p className="text-[10px] truncate" style={{ color: '#55555f' }}>
                  {user.university || 'NextOwner'}
                </p>
              </div>
              <ChevronRight size={12} style={{ color: '#37373f' }} />
            </motion.button>
          </div>
        </div>

        {/* Right content pane */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-2xl px-10 pt-10 pb-16">

            {/* Section header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-start gap-3.5 mb-7">
                  <div
                    className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${activeNav?.color}18`, border: `1px solid ${activeNav?.color}28` }}
                  >
                    {activeNav && <activeNav.icon size={18} style={{ color: activeNav.color }} />}
                  </div>
                  <div>
                    <h1 className="font-black text-[24px] leading-tight" style={{ color: '#eeeef2' }}>
                      {activeSection}
                    </h1>
                    <p className="text-[13px] mt-0.5" style={{ color: '#55555f' }}>
                      {activeSection === 'Account'       && 'Manage your profile and account security'}
                      {activeSection === 'Notifications'  && 'Control what alerts and updates you receive'}
                      {activeSection === 'Privacy'        && 'Manage your privacy and data preferences'}
                      {activeSection === 'Danger Zone'    && 'Irreversible account actions — proceed carefully'}
                    </p>
                  </div>
                </div>

                <SectionContent
                  name={activeSection}
                  user={user}
                  setShowPwd={setShowPwd}
                  setShowDel={setShowDel}
                  notifPrefs={notifPrefs}
                  setNotifPrefs={setNotifPrefs}
                  navigate={navigate}
                  handleLogout={handleLogout}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
