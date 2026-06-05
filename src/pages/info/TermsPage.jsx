import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, ShieldCheck, AlertTriangle, Scale, ChevronDown, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HIGHLIGHTS = [
  { icon: FileText,    color: '#7c6af7', bg: 'rgba(124,106,247,0.09)', border: 'rgba(124,106,247,0.20)', label: 'Campus use only',      desc: 'NextOwner is exclusively for verified university students.' },
  { icon: ShieldCheck, color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.18)',  label: 'Safe transactions',    desc: 'Meet in public campus spaces. We never handle payments.' },
  { icon: AlertTriangle,color:'#f97316', bg: 'rgba(249,115,22,0.09)',  border: 'rgba(249,115,22,0.20)',  label: 'No prohibited items',  desc: 'Illegal goods, weapons, drugs, or adult content are banned.' },
  { icon: Scale,       color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.16)',  label: 'Fair usage',           desc: 'No spam, fake listings, or manipulative pricing allowed.' },
]

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using NextOwner, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to these terms, please do not use the platform. We reserve the right to update these terms at any time, and continued use after changes constitutes acceptance.`,
  },
  {
    title: '2. Eligibility',
    content: `NextOwner is intended for university and college students aged 18 and above. By using this platform, you confirm that you are enrolled in or recently graduated from a recognized educational institution. We may require student verification to access certain features.`,
  },
  {
    title: '3. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. Each user may only maintain one active account. Accounts are non-transferable. NextOwner reserves the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Listings & Content',
    content: `You are solely responsible for all content you post on NextOwner. Listings must be accurate, honest, and represent items you own or have the right to sell. Prohibited items include illegal goods, counterfeit products, weapons, drugs, adult content, and any items that violate applicable laws. NextOwner reserves the right to remove listings without notice.`,
  },
  {
    title: '5. Transactions & Payments',
    content: `NextOwner is a listing platform only — we do not process payments or act as an intermediary in transactions. All deals are arranged directly between buyers and sellers. We strongly recommend meeting in safe, public campus locations. NextOwner is not responsible for the outcome of any transaction, including fraud, disputes, or item quality issues.`,
  },
  {
    title: '6. Prohibited Conduct',
    content: `You agree not to: post false or misleading listings; harass, threaten, or abuse other users; attempt to circumvent platform security; use automated tools to scrape or mass-message users; post spam or promotional content unrelated to campus sales; impersonate other users or NextOwner staff; or engage in any activity that disrupts the platform.`,
  },
  {
    title: '7. Intellectual Property',
    content: `All platform design, branding, code, and features are the intellectual property of NextOwner and its developers. You retain ownership of content you post, but grant NextOwner a non-exclusive license to display and distribute it on the platform. You may not copy, reproduce, or distribute platform content without prior written permission.`,
  },
  {
    title: '8. Privacy & Data',
    content: `Your use of NextOwner is also governed by our Privacy Policy, which is incorporated into these Terms. We collect and process data as described in the Privacy Policy to operate and improve the platform. You have the right to delete your account and associated data at any time from Settings.`,
  },
  {
    title: '9. Disclaimer of Warranties',
    content: `NextOwner is provided "as is" without warranties of any kind. We do not guarantee the accuracy of listings, the conduct of other users, or uninterrupted service availability. We are not responsible for any losses arising from transactions conducted through the platform or reliance on user-generated content.`,
  },
  {
    title: '10. Limitation of Liability',
    content: `To the maximum extent permitted by law, NextOwner and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability for any claim shall not exceed the amount you paid us in the twelve months prior to the claim.`,
  },
  {
    title: '11. Termination',
    content: `We may terminate or suspend your access to NextOwner at any time, with or without notice, for violations of these terms or for any other reason at our discretion. You may terminate your account at any time via Settings → Delete Account. Termination does not affect any rights or obligations that arose before termination.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms & Conditions are governed by the laws of India. Any disputes arising from your use of NextOwner shall be subject to the exclusive jurisdiction of courts in India. If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full effect.`,
  },
  {
    title: '13. Contact & Disputes',
    content: `For questions about these terms, disputes, or to report violations, contact us at nishchalkc370@gmail.com. We aim to respond within 5 business days. For urgent safety or legal matters, please mark your email as URGENT in the subject line.`,
  },
]

function SectionItem({ title, content, i }) {
  const [open, setOpen] = useState(i < 2)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04, duration: 0.22 }}
      className="rounded-[14px] overflow-hidden"
      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-bold text-[13px]" style={{ color: '#eeeef2' }}>{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} style={{ color: '#55555f' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              className="px-5 pb-4 text-[12px] leading-relaxed"
              style={{ color: '#6b7280', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0c0c10' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4"
        style={{
          paddingTop:    'max(env(safe-area-inset-top, 0px), 14px)',
          paddingBottom: 14,
          background:    'rgba(12,12,16,0.94)',
          backdropFilter:'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom:  '1px solid rgba(255,255,255,0.055)',
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
        <h1 className="font-bold text-[16px]" style={{ color: '#eeeef2' }}>Terms & Conditions</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center"
              style={{ background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.22)' }}
            >
              <Scale size={18} style={{ color: '#7c6af7' }} />
            </div>
            <div>
              <h2 className="font-black text-[20px]" style={{ color: '#eeeef2' }}>Terms & Conditions</h2>
              <p className="text-[11px]" style={{ color: '#55555f' }}>Last updated: June 2025</p>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: '#6b7280' }}>
            Please read these Terms & Conditions carefully before using NextOwner. By accessing or using the platform, you agree to be bound by these terms.
          </p>
        </motion.div>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {HIGHLIGHTS.map(({ icon: Icon, color, bg, border, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.22 }}
              className="p-3.5 rounded-[14px]"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon size={16} style={{ color }} className="mb-2" />
              <p className="font-bold text-[11px] mb-0.5" style={{ color }}>{label}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: '#6b7280' }}>{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-2 mb-8">
          {SECTIONS.map((s, i) => (
            <SectionItem key={s.title} {...s} i={i} />
          ))}
        </div>

        {/* Contact card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-[16px] p-4 flex items-center gap-3"
          style={{ background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.14)' }}
        >
          <Mail size={18} style={{ color: '#7c6af7' }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[12px]" style={{ color: '#eeeef2' }}>Questions about these terms?</p>
            <a
              href="mailto:nishchalkc370@gmail.com"
              className="text-[11px] hover:text-orange-400 transition-colors"
              style={{ color: '#7c6af7' }}
            >
              nishchalkc370@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
