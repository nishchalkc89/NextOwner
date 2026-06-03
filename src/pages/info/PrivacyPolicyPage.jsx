import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, Shield, Eye, Database, ChevronDown, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HIGHLIGHTS = [
  { icon: Shield,   color: '#7c6af7', bg: 'rgba(124,106,247,0.09)', border: 'rgba(124,106,247,0.20)', label: 'No data selling',      desc: 'We never sell your personal data to third parties.' },
  { icon: Lock,     color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.18)',  label: 'Encrypted in transit',  desc: 'All data uses HTTPS/TLS encryption end-to-end.' },
  { icon: Eye,      color: '#f97316', bg: 'rgba(249,115,22,0.09)',  border: 'rgba(249,115,22,0.20)',  label: 'No message reading',    desc: "We don't read your messages unless a violation is reported." },
  { icon: Database, color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.16)',  label: 'Right to delete',       desc: 'Delete your account and all data anytime from settings.' },
]

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide when creating an account (name, email address, university), listing items (photos, descriptions, prices), and using our messaging features. We also collect usage data such as pages visited, search queries, and device information to improve the app experience.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to operate and improve NextOwner, verify your campus identity, show you relevant listings, enable buyer-seller communication, send important notifications about your listings or purchases, and ensure safety on the platform. We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Photos and Listings',
    content: `Photos you upload for listings are stored securely on Cloudinary. Listing information (title, price, description, university) is visible to all users. Your personal profile details (beyond your display name) are never made public without your consent.`,
  },
  {
    title: '4. Messaging',
    content: `Messages between buyers and sellers are stored on our servers to deliver them and support dispute resolution. We do not read your messages except when investigating reported violations of our Terms of Service.`,
  },
  {
    title: '5. Data Security',
    content: `We use industry-standard encryption (HTTPS/TLS) for all data in transit. Passwords are hashed using bcrypt. JWT tokens are used for authentication and are not stored in insecure locations. We conduct regular security audits.`,
  },
  {
    title: '6. Cookies & Analytics',
    content: `We use session storage for authentication state and analytics to understand app usage patterns. No third-party tracking cookies are used. You can clear app storage at any time from your browser settings.`,
  },
  {
    title: '7. Your Rights',
    content: `You have the right to access, correct, or delete your personal data at any time. To delete your account and all associated data, go to Profile → Settings → Delete Account. For data export requests, contact us at nishchalkc370@gmail.com.`,
  },
  {
    title: "8. Children's Privacy",
    content: `NextOwner is intended for university students aged 18 and above. We do not knowingly collect personal information from users under 18. If we become aware that a user is under 18, we will delete their account.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via in-app notification or email. Continued use of NextOwner after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    content: `For privacy-related questions or requests, contact our Data Protection Officer at nishchalkc370@gmail.com. We aim to respond within 3 business days.`,
  },
]

function SectionItem({ title, content, i }) {
  const [open, setOpen] = useState(i < 2)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + i * 0.04 }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-[16px] p-4 text-left transition-colors"
        style={{
          background: open ? 'rgba(124,106,247,0.05)' : '#13131a',
          border: open ? '1px solid rgba(124,106,247,0.16)' : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="font-semibold text-[13px]" style={{ color: open ? '#a79cf9' : '#eeeef2' }}>{title}</p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: '#55555f', flexShrink: 0 }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4">
              <p className="text-[12px] leading-relaxed" style={{ color: '#55555f' }}>{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()

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
          <span style={{ color: '#eeeef2' }}>Privacy Policy</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-10">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-14 pb-12 lg:pt-20"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-5"
            style={{
              background: 'rgba(124,106,247,0.09)',
              border: '1px solid rgba(124,106,247,0.22)',
              color: '#a79cf9',
            }}
          >
            <Lock size={10} /> Last updated: May 2025
          </div>
          <h1 className="font-black leading-tight mb-4 text-[32px] lg:text-[48px]" style={{ color: '#eeeef2' }}>
            Your{' '}
            <span className="gradient-text-brand">Privacy</span>{' '}
            Matters
          </h1>
          <p className="text-[14px] lg:text-[16px] leading-relaxed max-w-xl" style={{ color: '#55555f' }}>
            This Privacy Policy explains how NextOwner collects, uses, and protects your
            personal information. We believe in full transparency — no surprises.
          </p>
        </motion.div>

        {/* ── Privacy highlights ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14"
        >
          {HIGHLIGHTS.map(({ icon: Icon, color, bg, border, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              className="rounded-[18px] p-4"
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <p className="font-bold text-[11px] mb-1.5" style={{ color: '#eeeef2' }}>{label}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: '#55555f' }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Desktop two-column: TOC + sections ── */}
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 mb-14">

          {/* TOC — desktop only */}
          <div className="hidden lg:block">
            <div
              className="sticky rounded-[16px] p-4"
              style={{ top: 80, background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#55555f' }}>
                Contents
              </p>
              <div className="space-y-1">
                {SECTIONS.map(({ title }, i) => (
                  <div key={i} className="text-[11px] py-1 leading-snug cursor-pointer hover:text-white transition-colors" style={{ color: '#55555f' }}>
                    {title}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-2.5">
            {SECTIONS.map(({ title, content }, i) => (
              <SectionItem key={i} title={title} content={content} i={i} />
            ))}
          </div>
        </div>

        {/* ── Contact strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between gap-6 rounded-[20px] p-6"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,106,247,0.09)', border: '1px solid rgba(124,106,247,0.20)' }}
            >
              <Mail size={16} style={{ color: '#7c6af7' }} />
            </div>
            <div>
              <p className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>Privacy Questions?</p>
              <p className="text-[11px]" style={{ color: '#55555f' }}>We respond within 3 business days.</p>
            </div>
          </div>
          <a
            href="mailto:nishchalkc370@gmail.com"
            className="text-[12px] font-bold flex-shrink-0"
            style={{ color: '#7c6af7' }}
          >
            nishchalkc370@gmail.com
          </a>
        </motion.div>

        <p className="text-center text-[11px] mt-8" style={{ color: '#37373f' }}>
          © 2025 NextOwner · All rights reserved
        </p>

      </div>
    </div>
  )
}
