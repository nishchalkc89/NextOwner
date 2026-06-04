const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Product = require('../models/Product')
const Message = require('../models/Message')
const Notification = require('../models/Notification')
const { sendSuspensionNotice, sendVerificationApproved, sendMail } = require('../config/mailer')

// Inline HTML wrapper for unban email (same template system as mailer.js)
const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#09090b;color:#e4e4e7;margin:0;padding:0}
.w{max-width:560px;margin:32px auto;padding:0 16px}.c{background:#18181b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden}
.h{background:linear-gradient(135deg,#f97316,#7c6af7);padding:24px 28px}.h h1{margin:0;color:#fff;font-size:20px;font-weight:800}
.b{padding:28px}.b p{margin:0 0 14px;font-size:14px;line-height:1.6;color:#a1a1aa}.b strong{color:#e4e4e7}
.cta{display:inline-block;margin-top:8px;padding:12px 24px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff!important;text-decoration:none;border-radius:10px;font-size:13px;font-weight:700}
.f{padding:16px 28px;border-top:1px solid rgba(255,255,255,0.06)}.f p{margin:0;font-size:11px;color:#52525b}
</style></head><body><div class="w"><div class="c">
<div class="h"><h1>NextOwner</h1></div>
<div class="b">${body}</div>
<div class="f"><p>NextOwner Support</p></div>
</div></div></body></html>`

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nextowner.in'
const ADMIN_PASS  = process.env.ADMIN_PASSWORD || 'admin@123'
const JWT_SECRET  = process.env.JWT_SECRET || 'dev_secret'

/* ── Admin auth middleware ── */
function adminProtect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Admin token required' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Not an admin token' })
    req.adminId = decoded.id
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/* POST /api/admin/login */
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
    return res.status(401).json({ message: 'Invalid admin credentials' })
  }
  const token = jwt.sign({ id: 'admin', isAdmin: true }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

/* GET /api/admin/stats */
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const [users, products, messages] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Message.countDocuments(),
    ])
    res.json({ users, products, messages })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* GET /api/admin/verifications — pending submissions */
router.get('/verifications', adminProtect, async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'under_review' })
      .select('name email university country studentIdImage verificationStatus studentEmail studentEmailVerified verificationNotes createdAt')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* PUT /api/admin/verifications/:userId — approve or reject */
router.put('/verifications/:userId', adminProtect, async (req, res) => {
  const { action, notes } = req.body // 'approve' | 'reject'
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'action must be approve or reject' })
  }
  try {
    const update = action === 'approve'
      ? { isVerified: true,  verificationStatus: 'verified'  }
      : { isVerified: false, verificationStatus: 'rejected'  }

    if (notes) update.verificationNotes = notes.trim()

    const user = await User.findByIdAndUpdate(req.params.userId, update, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Create notification for the user
    const notifData = action === 'approve'
      ? { type: 'verification_approved', title: '✅ Verification Approved!', body: 'You are now a Verified Student on NextOwner.', link: '/profile' }
      : { type: 'verification_rejected', title: 'Verification Not Approved', body: 'Your student ID could not be verified. Please try again with a clearer photo.', link: '/verify' }

    await Notification.create({ user: user._id, ...notifData })

    // Send email notification (fire-and-forget)
    if (action === 'approve') {
      sendVerificationApproved({ to: user.email, name: user.name }).catch(() => {})
    }

    res.json({ ok: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* GET /api/admin/products */
router.get('/products', adminProtect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const page  = parseInt(req.query.page)  || 1
    const products = await Product.find({ status: { $ne: 'deleted' } })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    const total = await Product.countDocuments({ status: { $ne: 'deleted' } })
    res.json({ products, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* DELETE /api/admin/products/:id */
router.delete('/products/:id', adminProtect, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { status: 'deleted' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* GET /api/admin/users */
router.get('/users', adminProtect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const page  = parseInt(req.query.page)  || 1
    const users = await User.find()
      .select('name email university isVerified verificationStatus banned createdAt avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* PUT /api/admin/users/:id/ban */
router.put('/users/:id/ban', adminProtect, async (req, res) => {
  try {
    const { reason } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    sendSuspensionNotice({ to: user.email, name: user.name, reason }).catch(() => {})
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

/* PUT /api/admin/users/:id/unban */
router.put('/users/:id/unban', adminProtect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: false }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    // Notify user their account is restored
    sendMail({
      to:      user.email,
      subject: 'Your NextOwner account has been restored',
      html: wrap(`
        <p>Hi <strong>${user.name || 'there'}</strong>,</p>
        <p>Great news! Your NextOwner account has been <strong>reinstated</strong>. You can now sign in and continue using the platform.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="cta">Sign In Now</a>
        <p style="margin-top:16px;font-size:12px;color:#52525b">
          If you believe this was an error or have questions, contact us at ${ADMIN_EMAIL}.
        </p>
      `),
      text: `Hi ${user.name}, your NextOwner account has been restored. You can now sign in.`,
    }).catch(() => {})
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
