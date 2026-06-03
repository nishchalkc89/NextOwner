const router = require('express').Router()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { SUPPORT_EMAIL, sendWelcome, sendPasswordReset } = require('../config/mailer')

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' })

// POST /api/auth/register
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { name, email, password } = req.body
    try {
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email already registered' })
      }
      const user = await User.create({ name, email, password })
      // Fire-and-forget welcome email
      sendWelcome({ to: email, name }).catch(() => {})
      res.status(201).json({ token: sign(user._id), user: sanitize(user) })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

// POST /api/auth/login
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid credentials' })

    const { email, password } = req.body
    try {
      const user = await User.findOne({ email }).select('+password')
      if (!user || !user.password) return res.status(401).json({ message: 'Invalid email or password' })
      const match = await user.matchPassword(password)
      if (!match) return res.status(401).json({ message: 'Invalid email or password' })
      if (user.banned) {
        return res.status(403).json({
          message: 'Your account has been suspended. To appeal, email nishchalkc370@gmail.com',
          code: 'BANNED',
        })
      }
      res.json({ token: sign(user._id), user: sanitize(user) })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: sanitize(req.user) })
})

// POST /api/auth/google
// Verifies the Google access token server-side before creating/signing in the user.
// Frontend must send: { accessToken, name, email, googleId, avatar }
router.post('/google', async (req, res) => {
  const { accessToken, name, email, googleId, avatar } = req.body

  if (!accessToken) {
    return res.status(400).json({ message: 'Google access token is required.' })
  }

  try {
    // ── 1. Verify token with Google ──────────────────────────────
    const tokenRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    )
    const tokenInfo = await tokenRes.json()

    if (tokenInfo.error_description || !tokenInfo.email) {
      return res.status(401).json({ message: 'Google sign-in failed. Please try again.' })
    }

    // Make sure the token belongs to our app (prevent token reuse from other apps)
    const expectedAudience = process.env.GOOGLE_CLIENT_ID
    if (expectedAudience && tokenInfo.aud !== expectedAudience) {
      return res.status(401).json({ message: 'Google token audience mismatch.' })
    }

    // Use the email FROM GOOGLE (not the client-supplied value)
    const verifiedEmail = tokenInfo.email.toLowerCase()

    // ── 2. Find or create user ───────────────────────────────────
    let user = await User.findOne({ email: verifiedEmail })
    let isNew = false
    if (!user) {
      user = await User.create({
        name:     name    || tokenInfo.name || verifiedEmail.split('@')[0],
        email:    verifiedEmail,
        googleId: googleId || tokenInfo.sub,
        avatar:   avatar   || '',
        password: undefined,
      })
      isNew = true
      sendWelcome({ to: verifiedEmail, name: user.name }).catch(() => {})
    } else if (!user.googleId) {
      user.googleId = googleId || tokenInfo.sub
      if (avatar) user.avatar = avatar
      await user.save()
    }

    if (user.banned) {
      return res.status(403).json({
        message: 'Your account has been suspended. To appeal, email nishchalkc370@gmail.com',
        code: 'BANNED',
      })
    }

    res.json({ token: sign(user._id), user: sanitize(user), isNew })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password',
  body('email').isEmail().withMessage('Valid email required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { email } = req.body
    // Always respond success to prevent email enumeration
    const SUCCESS = { message: 'If this email is registered you will receive a reset link shortly.' }

    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() })
      if (!user) return res.json(SUCCESS)

      // Generate raw token — send in URL; store hashed
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashed   = crypto.createHash('sha256').update(rawToken).digest('hex')

      user.resetToken       = hashed
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      await user.save({ validateBeforeSave: false })

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`
      await sendPasswordReset({ to: user.email, name: user.name, resetUrl }).catch(() => {})

      res.json(SUCCESS)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token',
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex')

    try {
      const user = await User.findOne({
        resetToken:       hashed,
        resetTokenExpiry: { $gt: new Date() },
      }).select('+password')

      if (!user) {
        return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' })
      }

      user.password        = req.body.password
      user.resetToken      = ''
      user.resetTokenExpiry = undefined
      await user.save()

      res.json({ message: 'Password updated successfully. You can now sign in.' })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

function sanitize(u) {
  const obj = u.toObject ? u.toObject() : u
  delete obj.password
  return obj
}

module.exports = router
