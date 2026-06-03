import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, Send, CheckCircle2, AlertTriangle, MessageCircle, BookOpen, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { submitSupportContact } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const SUPPORT_EMAIL = 'nishchalkc370@gmail.com'

const FAQS = [
  { q: 'Is NextOwner free?',                           a: 'Yes! Listing and buying on NextOwner is 100% free, always.' },
  { q: 'How do I verify my student status?',           a: 'Go to Profile → Student Verification, upload your college ID, and our team approves within 24h.' },
  { q: 'What if a seller doesn\'t respond?',           a: 'Try messaging again. If no response in 48h, the listing may be stale. Report it using the flag icon.' },
  { q: 'My payment was made but item not received?',   a: 'NextOwner recommends cash-on-delivery only. We do not facilitate digital payments between users. Always inspect before paying.' },
  { q: 'How do I delete my listing?',                  a: 'Go to Profile → My Listings → tap the listing → Edit → Delete Listing.' },
  { q: 'Can I sell outside my campus?',                a: 'Yes! Choose "All Campuses" when listing to reach students everywhere.' },
  { q: 'How does the Verified badge work?',            a: 'Upload your student ID at Profile → Student Verification. Admin reviews within 24h and grants the green badge.' },
  { q: 'Is my personal info safe?',                    a: 'Your email and phone are never shown publicly. Only your display name and university are visible to other users.' },
]

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[16px] overflow-hidden"
      style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.06)' }}>
      <motion.button whileTap={{ scale: 0.99 }} onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3">
        <span className="text-white text-[13px] font-semibold leading-snug flex-1">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <p className="text-gray-400 text-[12px] leading-relaxed px-4 pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HelpPage() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const [form,    setForm]    = useState({ type: 'general', subject: '', body: '' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.body) return toast.error('Please fill in all fields')
    setSending(true)
    try {
      await submitSupportContact({
        name:    user?.name  || 'NextOwner User',
        email:   user?.email || SUPPORT_EMAIL,
        subject: `[${form.type.toUpperCase()}] ${form.subject}`,
        message: form.body,
        type:    form.type,
      })
      setSent(true)
      toast.success("Report submitted! We'll reply within 24h.")
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit — try emailing us directly.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 h-[58px]"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={16} className="text-white" />
        </motion.button>
        <h1 className="text-white font-bold text-[16px]">Help & Support</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { icon: BookOpen,       label: 'How it Works', color: '#fb923c', bg: 'rgba(249,115,22,0.1)', path: '/how-it-works' },
            { icon: AlertTriangle,  label: 'Safety Tips',  color: '#facc15', bg: 'rgba(234,179,8,0.1)',  path: '/safety'       },
            { icon: MessageCircle,  label: 'Contact Us',   color: '#4ade80', bg: 'rgba(34,197,94,0.1)',  path: '/contact'      },
          ].map(({ icon: Icon, label, color, bg, path }) => (
            <motion.button key={label} whileTap={{ scale: 0.93 }} whileHover={{ y: -2 }} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 rounded-[18px] p-4"
              style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-white text-[11px] font-semibold text-center leading-tight">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-7">
          <p className="text-white font-bold text-[14px] mb-3">Frequently Asked Questions</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => <FaqItem key={i} {...faq} index={i} />)}
          </div>
        </div>

        {/* Report Issue form */}
        <div>
          <p className="text-white font-bold text-[14px] mb-3">Report an Issue</p>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 rounded-[22px] p-8 text-center"
              style={{ background: '#17171b', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle2 size={36} className="text-green-400" />
              <p className="text-white font-bold text-[14px]">Issue Reported</p>
              <p className="text-gray-500 text-[12px]">We'll get back to you within 24 hours.</p>
              <a href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-1.5 text-[11px] font-medium mt-1 transition-colors hover:text-orange-400"
                style={{ color: '#55555f' }}>
                <Mail size={10} /> {SUPPORT_EMAIL}
              </a>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSent(false)}
                className="text-orange-400 text-[12px] font-semibold mt-1">
                Submit another
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-[22px] p-5 space-y-3"
              style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.07)' }}>

              {/* Type selector */}
              <div className="flex gap-2 flex-wrap">
                {['general', 'bug', 'scam', 'payment', 'other'].map(t => (
                  <motion.button key={t} type="button" whileTap={{ scale: 0.92 }}
                    onClick={() => set('type', t)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize border transition-all"
                    style={form.type === t
                      ? { background: 'rgba(249,115,22,0.15)', color: '#fb923c', borderColor: 'rgba(249,115,22,0.3)' }
                      : { background: 'transparent', color: '#6b7280', borderColor: 'rgba(255,255,255,0.08)' }}>
                    {t}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-3 px-4 rounded-[14px] h-12"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input type="text" placeholder="Subject" value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] outline-none" />
              </div>

              <div className="rounded-[14px] p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <textarea placeholder="Describe the issue in detail…" value={form.body}
                  onChange={e => set('body', e.target.value)}
                  rows={4} className="w-full bg-transparent text-white placeholder-gray-600 text-[13px] outline-none resize-none leading-relaxed" />
              </div>

              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={sending}
                className="w-full h-12 rounded-[14px] gradient-orange text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60">
                {sending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send size={14} /> Submit Report</>
                }
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
