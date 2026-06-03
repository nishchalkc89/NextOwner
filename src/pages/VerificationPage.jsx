import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Upload, BadgeCheck, GraduationCap, Camera,
  CheckCircle2, Mail, ShieldCheck, AlertCircle, RotateCcw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import UniversitySelect from '../components/ui/UniversitySelect'
import CountryPicker from '../components/ui/CountryPicker'
import { sendVerificationOtp, checkVerificationOtp, submitStudentId } from '../services/verifyService'

/* ─── Personal-domain block (mirrors backend) ─── */
const BLOCKED = new Set([
  'gmail.com','googlemail.com','yahoo.com','yahoo.in','yahoo.co.in',
  'outlook.com','hotmail.com','live.com','msn.com','icloud.com','me.com',
  'mac.com','protonmail.com','proton.me','pm.me','rediffmail.com',
  'rediff.com','aol.com','zoho.com','mail.com','gmx.com','gmx.net',
  'yandex.com','yandex.ru','tutanota.com','tuta.io',
])
const emailDomain  = (e) => e.split('@')[1]?.toLowerCase() || ''
const isPersonal   = (e) => BLOCKED.has(emailDomain(e))
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

/* ─── 6-digit OTP input ─── */
function OtpInput({ value, onChange, disabled, hasError }) {
  const refs = Array.from({ length: 6 }, () => useRef(null))

  const handleChange = (i, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const arr = (value + '      ').slice(0, 6).split('')
    arr[i] = digit
    const next = arr.join('').trimEnd()
    onChange(next)
    if (digit && i < 5) refs[i + 1].current?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      const arr = (value + '      ').slice(0, 6).split('')
      arr[i - 1] = ''
      onChange(arr.join('').trimEnd())
      refs[i - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(digits)
    const last = Math.min(digits.length, 5)
    refs[last].current?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-[13.5%] aspect-square rounded-[13px] text-center font-black text-[20px] outline-none transition-all"
          style={{
            background: value[i] ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${
              hasError   ? 'rgba(239,68,68,0.45)' :
              value[i]   ? 'rgba(249,115,22,0.45)' :
                           'rgba(255,255,255,0.10)'
            }`,
            color: '#eeeef2',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Countdown hook ─── */
function useCountdown(initial = 0) {
  const [secs, setSecs] = useState(initial)
  const reset = useCallback((n) => setSecs(n), [])
  useEffect(() => {
    if (secs <= 0) return
    const t = setTimeout(() => setSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs])
  return [secs, reset]
}

/* ─── Step indicator ─── */
const STEPS = ['University', 'Student Email', 'Upload ID', 'Done']

function StepBar({ step }) {
  return (
    <div className="flex items-center px-5 pt-5 pb-4 gap-1.5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
            ${i < step  ? 'bg-green-500 text-white' :
              i === step ? 'gradient-orange text-white' :
                           'bg-[#1c2020] text-gray-600'}`}>
            {i < step ? '✓' : i + 1}
          </div>
          <span className={`text-[9px] font-semibold truncate ${i <= step ? 'text-orange-400' : 'text-gray-700'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/5 mx-1" />}
        </div>
      ))}
    </div>
  )
}

/* ═══ Main Component ═══════════════════════════════════════ */
export default function VerificationPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  /* ── shared state ── */
  const [step,       setStep]       = useState(0)
  const [country,    setCountry]    = useState('')
  const [university, setUniversity] = useState('')

  /* ── Step 1: email + OTP ── */
  const [emailSub,     setEmailSub]     = useState('enter')  // 'enter' | 'otp'
  const [studentEmail, setStudentEmail] = useState('')
  const [otp,          setOtp]          = useState('')
  const [otpError,     setOtpError]     = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [resendCd,     resetResendCd]   = useCountdown(0)
  const [otpExpiry,    setOtpExpiry]    = useState(null)   // Date object

  /* ── Step 2: ID upload ── */
  const [idFile,    setIdFile]    = useState(null)
  const [idPreview, setIdPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fileRef   = useRef(null)
  const cameraRef = useRef(null)

  /* Derived */
  const emailDom      = emailDomain(studentEmail)
  const emailPersonal = studentEmail.length > 3 && isValidEmail(studentEmail) && isPersonal(studentEmail)
  const emailOk       = isValidEmail(studentEmail) && !isPersonal(studentEmail)

  /* ── Send OTP ── */
  const handleSendOtp = async () => {
    if (!emailOk) return
    setEmailSending(true)
    setOtpError('')
    try {
      await sendVerificationOtp(studentEmail)
      setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000))
      resetResendCd(60)
      setEmailSub('otp')
      setOtp('')
      toast.success('OTP sent! Check your student email.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.'
      const code = err.response?.data?.code
      if (code === 'RATE_LIMITED') {
        const wait = err.response?.data?.waitSeconds || 60
        resetResendCd(wait)
        toast.error(msg)
      } else {
        setOtpError(msg)
        toast.error(msg)
      }
    } finally {
      setEmailSending(false)
    }
  }

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setOtpVerifying(true)
    setOtpError('')
    try {
      await checkVerificationOtp(otp)
      toast.success('Email verified! ✅')
      setStep(2)
    } catch (err) {
      const data = err.response?.data || {}
      setOtpError(data.message || 'Incorrect code.')
      if (typeof data.attemptsLeft === 'number') setAttemptsLeft(data.attemptsLeft)
      if (data.code === 'EXPIRED' || data.code === 'MAX_ATTEMPTS') {
        setEmailSub('enter')
        setOtp('')
      }
    } finally {
      setOtpVerifying(false)
    }
  }

  /* Auto-verify when 6th digit entered */
  useEffect(() => {
    if (otp.length === 6 && emailSub === 'otp') handleVerifyOtp()
  }, [otp])

  /* ── Upload ID ── */
  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Image must be under 10 MB.'); return }
    setIdFile(file)
    setIdPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!idFile) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('studentId', idFile)
      fd.append('university', university)
      fd.append('country', country)
      const updated = await submitStudentId(fd)
      updateUser({ verificationStatus: 'under_review', university, country, studentEmail })
      setStep(3)
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  /* ── OTP expiry clock ── */
  const otpMinsLeft = otpExpiry
    ? Math.max(0, Math.floor((otpExpiry - Date.now()) / 60000))
    : 0
  const otpSecsLeft = otpExpiry
    ? Math.max(0, Math.floor(((otpExpiry - Date.now()) % 60000) / 1000))
    : 0

  /* ══════════ Render ══════════════════════════════════════ */
  return (
    <div className="min-h-screen pb-12" style={{ background: '#0d0f0f' }}>

      {/* Header */}
      <div className="glass-header flex items-center gap-3 px-5 h-[60px]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} className="text-gray-400" />
        </motion.button>
        <h1 className="text-white font-bold text-base">Student Verification</h1>
      </div>

      <StepBar step={step} />

      <div className="px-4 max-w-sm mx-auto">

        {/* ════════ STEP 0 — Country + University ════════ */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center shadow-orange">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Select your University</h2>
                <p className="text-gray-600 text-xs">Choose your country then your campus</p>
              </div>
            </div>

            <CountryPicker
              value={country}
              onChange={(c) => { setCountry(c); setUniversity('') }}
            />

            {country && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                <UniversitySelect
                  value={university}
                  onChange={setUniversity}
                  country={country}
                  placeholder="Search your university…"
                />
              </motion.div>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => country && university && setStep(1)}
              disabled={!country || !university}
              className="w-full py-3.5 rounded-2xl gradient-orange text-white font-bold disabled:opacity-40 shadow-orange mt-2">
              Continue →
            </motion.button>
          </motion.div>
        )}

        {/* ════════ STEP 1 — Student Email + OTP ════════ */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">

            {/* Section header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-orange"
                style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)' }}>
                <Mail size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">
                  {emailSub === 'enter' ? 'Student Email' : 'Enter OTP'}
                </h2>
                <p className="text-gray-600 text-xs">
                  {emailSub === 'enter'
                    ? 'Use your official university email'
                    : `Code sent to ${studentEmail}`}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Email entry sub-step ── */}
              {emailSub === 'enter' && (
                <motion.div key="enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

                  {/* Email input */}
                  <div
                    className="flex items-center gap-3 px-4 rounded-[14px] h-12"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${
                        emailPersonal ? 'rgba(239,68,68,0.40)' :
                        emailOk       ? 'rgba(52,211,153,0.35)' :
                                        'rgba(255,255,255,0.09)'
                      }`,
                    }}
                  >
                    <Mail size={14} style={{ color: emailOk ? '#34d399' : '#55555f', flexShrink: 0 }} />
                    <input
                      type="email"
                      placeholder="student@university.edu"
                      value={studentEmail}
                      onChange={e => { setStudentEmail(e.target.value); setOtpError('') }}
                      className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] outline-none"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoFocus
                    />
                    {emailOk && <CheckCircle2 size={14} style={{ color: '#34d399', flexShrink: 0 }} />}
                  </div>

                  {/* Domain feedback */}
                  <AnimatePresence>
                    {emailPersonal && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                        <AlertCircle size={12} style={{ color: '#ef4444' }} />
                        <p className="text-[11px]" style={{ color: '#f87171' }}>
                          ❌ Personal emails can't be verified. Use your <strong>official university email</strong>.
                        </p>
                      </motion.div>
                    )}
                    {emailOk && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                        style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)' }}>
                        <CheckCircle2 size={12} style={{ color: '#34d399' }} />
                        <p className="text-[11px]" style={{ color: '#6ee7b7' }}>Looks like an official university email ✓</p>
                      </motion.div>
                    )}
                    {otpError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                        <AlertCircle size={12} style={{ color: '#ef4444' }} />
                        <p className="text-[11px]" style={{ color: '#f87171' }}>{otpError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Accepted format examples */}
                  <div className="rounded-[12px] p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#444450' }}>Accepted formats</p>
                    {['student@sharda.ac.in','name@ku.edu.np','roll@iit.ac.in','id@pu.edu.np'].map(ex => (
                      <p key={ex} className="text-[11px]" style={{ color: '#55555f' }}>✓ {ex}</p>
                    ))}
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={handleSendOtp}
                    disabled={!emailOk || emailSending}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-[13px] disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#7c6af7,#5c4ef2)', boxShadow: '0 4px 20px rgba(124,106,247,0.30)' }}>
                    {emailSending
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Mail size={14} /> Send Verification Code</>}
                  </motion.button>

                  <button onClick={() => setStep(0)}
                    className="w-full text-center text-[11px] font-medium pt-1 transition-colors hover:text-gray-400"
                    style={{ color: '#55555f' }}>
                    ← Back to university
                  </button>
                </motion.div>
              )}

              {/* ── OTP entry sub-step ── */}
              {emailSub === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                  {/* Expiry timer */}
                  {otpExpiry && (
                    <div className="text-center">
                      <p className="text-[11px]" style={{ color: '#55555f' }}>
                        Code expires in{' '}
                        <span className="font-black" style={{ color: otpMinsLeft === 0 && otpSecsLeft < 30 ? '#ef4444' : '#fb923c' }}>
                          {otpMinsLeft}:{String(otpSecsLeft).padStart(2, '0')}
                        </span>
                      </p>
                    </div>
                  )}

                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={otpVerifying}
                    hasError={!!otpError}
                  />

                  {/* Error */}
                  <AnimatePresence>
                    {otpError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                        <AlertCircle size={12} style={{ color: '#ef4444' }} />
                        <p className="text-[11px] flex-1" style={{ color: '#f87171' }}>{otpError}</p>
                        {attemptsLeft > 0 && attemptsLeft < 5 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                            {attemptsLeft} left
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Verify button */}
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || otpVerifying}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-[13px] disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.28)' }}>
                    {otpVerifying
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><ShieldCheck size={14} /> Verify Email</>}
                  </motion.button>

                  {/* Resend */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => { setEmailSub('enter'); setOtp(''); setOtpError('') }}
                      className="text-[11px] flex items-center gap-1 transition-colors hover:text-gray-300"
                      style={{ color: '#55555f' }}>
                      <RotateCcw size={10} /> Change email
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={resendCd > 0 || emailSending}
                      className="text-[11px] font-semibold transition-colors disabled:opacity-40"
                      style={{ color: resendCd > 0 ? '#55555f' : '#7c6af7' }}>
                      {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend code'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}

        {/* ════════ STEP 2 — Upload Student ID ════════ */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center shadow-orange">
                <Upload size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Upload Student ID</h2>
                <p className="text-gray-600 text-xs">Clear photo — front side of your college ID</p>
              </div>
            </div>

            {/* Email verified badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.20)' }}>
              <CheckCircle2 size={13} style={{ color: '#34d399' }} />
              <p className="text-[11px]" style={{ color: '#6ee7b7' }}>
                Email verified: <strong>{studentEmail}</strong>
              </p>
            </div>

            {/* ID preview */}
            {idPreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#1c2020]">
                <img src={idPreview} alt="ID" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setIdFile(null); setIdPreview(null) }}
                  className="absolute top-2 right-2 bg-black/70 rounded-full px-3 py-1 text-white text-xs font-semibold">
                  Retake
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-2xl border-dashed flex flex-col items-center justify-center gap-2"
                style={{ border: '1.5px dashed rgba(255,255,255,0.10)', background: '#161a1a' }}>
                <Upload size={28} className="text-gray-600" />
                <p className="text-gray-600 text-sm">ID preview appears here</p>
                <p className="text-gray-700 text-[10px]">Max 10 MB · JPG/PNG</p>
              </div>
            )}

            {/* Capture buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => cameraRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl glass-card text-gray-300 text-sm border-0">
                <Camera size={16} className="text-orange-400" /> Camera
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl glass-card text-gray-300 text-sm border-0">
                <Upload size={16} className="text-green-400" /> Gallery
              </motion.button>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!idFile || uploading}
              className="w-full py-3.5 rounded-2xl gradient-orange text-white font-bold disabled:opacity-40 shadow-orange flex items-center justify-center gap-2">
              {uploading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Submit for Verification'}
            </motion.button>
          </motion.div>
        )}

        {/* ════════ STEP 3 — Done ════════ */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center">

            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: 2, duration: 0.4 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <CheckCircle2 size={40} style={{ color: '#34d399' }} />
            </motion.div>

            <h2 className="text-white font-black text-xl mb-1">Submitted!</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              Our team will review your submission within <strong className="text-gray-300">24 hours</strong>.
            </p>

            {/* Summary checklist */}
            <div className="w-full space-y-2 mb-6 text-left">
              {[
                { label: 'University', value: university, done: true },
                { label: 'Email Verified', value: studentEmail, done: true },
                { label: 'Student ID', value: 'Uploaded', done: true },
                { label: 'Admin Review', value: 'Pending (within 24h)', done: false, pending: true },
              ].map(({ label, value, done, pending }) => (
                <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                    style={done
                      ? { background: 'rgba(52,211,153,0.15)', color: '#34d399' }
                      : { background: 'rgba(234,179,8,0.15)', color: '#facc15' }}>
                    {done ? '✓' : '⏳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#55555f' }}>{label}</p>
                    <p className="text-[12px] truncate" style={{ color: pending ? '#facc15' : '#eeeef2' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 px-4 py-2 rounded-full border" style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.15)' }}>
              <span className="text-orange-400 text-sm font-medium flex items-center gap-2">
                <BadgeCheck size={13} /> Under Review
              </span>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}
              className="mt-8 w-full py-3.5 rounded-2xl gradient-orange text-white font-bold shadow-orange">
              Explore NextOwner →
            </motion.button>
          </motion.div>
        )}

      </div>
    </div>
  )
}
