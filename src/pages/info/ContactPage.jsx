import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, MessageSquare, AtSign, Globe, Send, CheckCircle2, Clock, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { submitSupportContact } from '../../services/authService'

const SUPPORT_EMAIL = 'nishchalkc370@gmail.com'

const CHANNELS = [
  {
    icon: Mail,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.09)',
    border: 'rgba(249,115,22,0.20)',
    label: 'Email Support',
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}?subject=NextOwner Support Request`,
    sub: 'Reply within 24 hours',
  },
  {
    icon: AtSign,
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.18)',
    label: 'Instagram',
    value: '@nextowner.in',
    sub: 'DMs open',
  },
  {
    icon: Globe,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.16)',
    label: 'Twitter / X',
    value: '@nextowner',
    sub: 'Quick responses',
  },
  {
    icon: MessageSquare,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.18)',
    label: 'WhatsApp',
    value: '+91 98765 43210',
    sub: 'Business hours 9–6',
  },
]

const RESPONSE_TIMES = [
  { icon: Zap,   color: '#f97316', label: 'Critical Issues', time: '< 2 hours'  },
  { icon: Clock, color: '#7c6af7', label: 'General Support', time: '< 24 hours' },
  { icon: Mail,  color: '#34d399', label: 'Feature Requests', time: '< 3 days'  },
]

const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.09)',
  color: '#eeeef2',
}

export default function ContactPage() {
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields')
      return
    }
    setSending(true)
    try {
      await submitSupportContact({
        name:    form.name,
        email:   form.email,
        subject: form.subject || 'NextOwner Support Request',
        message: form.message,
        type:    'general',
      })
      setSent(true)
      toast.success("Message sent! We'll reply soon.")
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send — try emailing us directly.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0c0c10' }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8 h-[58px]"
        style={{
          background: 'rgba(12,12,16,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={15} className="text-white" />
        </motion.button>
        <div className="flex items-center gap-2 text-[13px]" style={{ color: '#55555f' }}>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')}>
            Home
          </span>
          <span>/</span>
          <span style={{ color: '#eeeef2' }}>Contact</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-10">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-14 pb-10 lg:pt-20"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-5"
            style={{
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.20)',
              color: '#34d399',
            }}
          >
            We respond fast
          </div>
          <h1 className="font-black leading-tight mb-4 text-[32px] lg:text-[48px]" style={{ color: '#eeeef2' }}>
            We're{' '}
            <span className="gradient-text-brand">Here to Help</span>
          </h1>
          <p className="text-[14px] lg:text-[16px] leading-relaxed max-w-xl" style={{ color: '#55555f' }}>
            Got a question, suggestion, or issue? Reach out through any channel below
            — our team responds quickly to every message.
          </p>
        </motion.div>

        {/* ── Response time strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          {RESPONSE_TIMES.map(({ icon: Icon, color, label, time }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-[12px]"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Icon size={13} style={{ color }} />
              <span className="text-[12px]" style={{ color: '#8a8a9a' }}>{label}:</span>
              <span className="text-[12px] font-bold" style={{ color }}>{time}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Desktop two-column ── */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10 items-start">

          {/* LEFT: channels + info */}
          <div>
            {/* Channel cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: '#55555f' }}>
                Contact Channels
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANNELS.map(({ icon: Icon, color, bg, border, label, value, href, sub }, i) => {
                  const Tag = href ? motion.a : motion.div
                  return (
                    <Tag
                      key={label}
                      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.06 }}
                      className="rounded-[18px] p-4 cursor-pointer group transition-all"
                      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', display: 'block' }}
                      whileHover={{ borderColor: border }}
                    >
                      <div
                        className="w-9 h-9 rounded-[11px] flex items-center justify-center mb-3"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon size={15} style={{ color }} />
                      </div>
                      <p className="font-semibold text-[12px] mb-0.5" style={{ color: '#eeeef2' }}>{label}</p>
                      <p className="text-[11px] font-bold mb-1 truncate" style={{ color }}>{value}</p>
                      <p className="text-[10px]" style={{ color: '#55555f' }}>{sub}</p>
                    </Tag>
                  )
                })}
              </div>
            </motion.div>

            {/* Office info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="rounded-[20px] p-5 mb-10"
              style={{
                background: 'linear-gradient(135deg,rgba(124,106,247,0.06) 0%,rgba(52,211,153,0.03) 100%)',
                border: '1px solid rgba(124,106,247,0.14)',
              }}
            >
              <p className="font-bold text-[13px] mb-3" style={{ color: '#eeeef2' }}>About Our Support</p>
              <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>
                We're a small but mighty team of students and developers. Every support request is handled
                personally — not by bots. We genuinely care about making NextOwner better for the entire
                student community.
              </p>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[11px]" style={{ color: '#55555f' }}>
                  <span className="font-bold" style={{ color: '#8a8a9a' }}>Hours:</span> Mon–Fri, 9 AM – 8 PM IST
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 rounded-[22px] p-10 text-center"
                style={{ background: '#13131a', border: '1px solid rgba(52,211,153,0.20)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.22)' }}
                >
                  <CheckCircle2 size={28} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <p className="font-black text-[16px] mb-2" style={{ color: '#eeeef2' }}>Message Sent!</p>
                  <p className="text-[13px]" style={{ color: '#55555f' }}>
                    We'll get back to you within 24 hours.
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSent(false)}
                  className="text-[12px] font-semibold mt-2"
                  style={{ color: '#7c6af7' }}
                >
                  Send another message
                </motion.button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-[22px] p-5 lg:p-6 space-y-4"
                style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="mb-2">
                  <p className="font-bold text-[15px]" style={{ color: '#eeeef2' }}>Send a Message</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#55555f' }}>We'll reply to your inbox directly.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { field: 'name',  placeholder: 'Your name',   type: 'text'  },
                    { field: 'email', placeholder: 'Email address', type: 'email' },
                  ].map(({ field, placeholder, type }) => (
                    <div
                      key={field}
                      className="flex items-center px-4 rounded-[12px] h-11"
                      style={INPUT_STYLE}
                    >
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="flex-1 bg-transparent text-[13px] outline-none placeholder-gray-600"
                        style={{ color: '#eeeef2' }}
                      />
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center px-4 rounded-[12px] h-11"
                  style={INPUT_STYLE}
                >
                  <input
                    type="text"
                    placeholder="Subject (optional)"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="flex-1 bg-transparent text-[13px] outline-none placeholder-gray-600"
                    style={{ color: '#eeeef2' }}
                  />
                </div>

                <div className="rounded-[12px] p-4" style={INPUT_STYLE}>
                  <textarea
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    className="w-full bg-transparent text-[13px] outline-none resize-none placeholder-gray-600"
                    style={{ color: '#eeeef2' }}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={sending}
                  className="w-full h-12 rounded-[12px] font-bold text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)',
                    boxShadow: '0 4px 20px rgba(124,106,247,0.30)',
                  }}
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={14} /> Send Message</>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
