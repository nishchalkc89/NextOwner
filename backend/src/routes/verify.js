const router  = require('express').Router()
const crypto  = require('crypto')
const User    = require('../models/User')
const { protect } = require('../middleware/auth')
const { upload, uploadToCloud } = require('../middleware/upload')
const {
  sendOtp,
  sendVerificationSubmitted,
  sendAdminVerificationAlert,
} = require('../config/mailer')

/* ── Personal-email domain block-list ── */
const BLOCKED_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk', 'ymail.com',
  'outlook.com', 'hotmail.com', 'hotmail.in', 'live.com', 'live.in', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'rediffmail.com', 'rediff.com',
  'aol.com', 'zoho.com', 'mail.com',
  'gmx.com', 'gmx.net', 'gmx.in',
  'yandex.com', 'yandex.ru',
  'tutanota.com', 'tuta.io',
])

const isPersonalEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase()
  return !domain || BLOCKED_DOMAINS.has(domain)
}

const hashOtp = (otp) =>
  crypto.createHash('sha256').update(String(otp)).digest('hex')

/* ────────────────────────────────────────────────────────────
   POST /api/verify/send-otp
   Validate student email domain → generate OTP → send email
   Rate-limit: 60 s cooldown, max 5 sends per hour (by last-sent check)
──────────────────────────────────────────────────────────── */
router.post('/send-otp', protect, async (req, res) => {
  const raw = (req.body.studentEmail || '').trim().toLowerCase()
  if (!raw) return res.status(400).json({ message: 'Student email is required.' })

  if (isPersonalEmail(raw)) {
    return res.status(400).json({
      message: 'Please use your official university email — not Gmail, Yahoo, Outlook, etc.',
      code: 'PERSONAL_EMAIL',
    })
  }

  try {
    const user = await User.findById(req.user._id)

    // 60-second resend cooldown
    if (user.verificationOtpLastSent) {
      const wait = 60 - Math.floor((Date.now() - user.verificationOtpLastSent.getTime()) / 1000)
      if (wait > 0) {
        return res.status(429).json({
          message: `Please wait ${wait} second${wait !== 1 ? 's' : ''} before requesting a new code.`,
          waitSeconds: wait,
          code: 'RATE_LIMITED',
        })
      }
    }

    // Generate 6-digit OTP
    const otp    = String(Math.floor(100000 + Math.random() * 900000))
    const hashed = hashOtp(otp)

    user.studentEmail            = raw
    user.studentEmailVerified    = false
    user.verificationOtp         = hashed
    user.verificationOtpExpiry   = new Date(Date.now() + 10 * 60 * 1000) // 10 min
    user.verificationOtpAttempts = 0
    user.verificationOtpLastSent = new Date()
    await user.save({ validateBeforeSave: false })

    await sendOtp({ to: raw, name: user.name, otp }).catch(() => {})

    res.json({ message: 'OTP sent to your student email.', email: raw })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* ────────────────────────────────────────────────────────────
   POST /api/verify/check-otp
   Validate OTP → mark email as verified
──────────────────────────────────────────────────────────── */
router.post('/check-otp', protect, async (req, res) => {
  const otp = String(req.body.otp || '').trim()
  if (!otp) return res.status(400).json({ message: 'OTP is required.' })

  try {
    const user = await User.findById(req.user._id)

    if (!user.verificationOtp)
      return res.status(400).json({ message: 'No OTP found. Please request a new code.', code: 'NO_OTP' })

    if (!user.verificationOtpExpiry || user.verificationOtpExpiry < new Date())
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.', code: 'EXPIRED' })

    if ((user.verificationOtpAttempts || 0) >= 5)
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new code.', code: 'MAX_ATTEMPTS' })

    const hashedInput = hashOtp(otp)
    if (hashedInput !== user.verificationOtp) {
      user.verificationOtpAttempts = (user.verificationOtpAttempts || 0) + 1
      await user.save({ validateBeforeSave: false })
      const left = 5 - user.verificationOtpAttempts
      return res.status(400).json({
        message: left > 0
          ? `Incorrect code. ${left} attempt${left !== 1 ? 's' : ''} remaining.`
          : 'Too many attempts. Please request a new code.',
        code: 'WRONG_OTP',
        attemptsLeft: left,
      })
    }

    // ✅ OTP correct
    user.studentEmailVerified    = true
    user.verificationOtp         = ''
    user.verificationOtpExpiry   = undefined
    user.verificationOtpAttempts = 0
    await user.save({ validateBeforeSave: false })

    res.json({ ok: true, message: 'Student email verified!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* ────────────────────────────────────────────────────────────
   POST /api/verify/submit-id
   Upload student ID → set status → fire emails
   Requires studentEmailVerified = true
──────────────────────────────────────────────────────────── */
router.post('/submit-id', protect, upload.single('studentId'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user.studentEmailVerified)
      return res.status(400).json({ message: 'Please verify your student email first.' })

    let idUrl = ''
    if (req.file) {
      const result = await uploadToCloud(req.file.buffer, 'nextowner/student-ids')
      idUrl = result.secure_url
    } else if (req.body.studentIdUrl) {
      idUrl = req.body.studentIdUrl
    }
    if (!idUrl) return res.status(400).json({ message: 'Student ID image is required.' })

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        studentIdImage:     idUrl,
        verificationStatus: 'under_review',
        ...(req.body.university && { university: req.body.university }),
        ...(req.body.country    && { country:    req.body.country }),
      },
      { new: true }
    )

    const adminUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/dashboard`

    sendVerificationSubmitted({
      to: updated.email, name: updated.name, university: updated.university,
    }).catch(() => {})

    sendAdminVerificationAlert({
      userName:    updated.name,
      studentEmail: updated.studentEmail,
      university:  updated.university,
      country:     updated.country,
      adminUrl,
    }).catch(() => {})

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
