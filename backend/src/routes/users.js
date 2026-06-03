const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const User    = require('../models/User')
const Product = require('../models/Product')
const { protect } = require('../middleware/auth')
const { upload, uploadToCloud } = require('../middleware/upload')

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist')
  res.json(user)
})

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, university, country, avatar } = req.body
    const updates = {}
    if (name)       updates.name       = name.trim()
    if (university) updates.university = university.trim()
    if (country)    updates.country    = country.trim()
    if (avatar)     updates.avatar     = avatar

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/users/password — change password
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both fields required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }
  try {
    const user = await User.findById(req.user._id).select('+password')
    if (!user.password) return res.status(400).json({ message: 'No password set (Google account). Use Google sign-in.' })
    const match = await user.matchPassword(currentPassword)
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' })
    user.password = newPassword
    await user.save()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/users/account — delete own account
router.delete('/account', protect, async (req, res) => {
  try {
    await Product.updateMany({ seller: req.user._id }, { status: 'deleted' })
    await User.findByIdAndDelete(req.user._id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users/verify — upload student ID
router.post('/verify', protect, upload.single('studentId'), async (req, res) => {
  try {
    let idUrl = req.body.studentIdUrl || ''
    if (req.file) {
      const result = await uploadToCloud(req.file.buffer, 'nextowner/student-ids')
      idUrl = result.secure_url
    }
    if (!idUrl) return res.status(400).json({ message: 'Student ID image required' })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        studentIdImage:     idUrl,
        verificationStatus: 'under_review',
        university:         req.body.university || req.user.university,
        ...(req.body.country && { country: req.body.country }),
      },
      { new: true }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/search?q= — search users by name (for new chat)
router.get('/search/users', protect, async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q || q.length < 2) return res.json([])
    const users = await User.find({
      _id:  { $ne: req.user._id },
      name: { $regex: q, $options: 'i' },
    }).select('_id name avatar university').limit(12)
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/:id — public profile + listings
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -studentIdImage -wishlist')
    if (!user) return res.status(404).json({ message: 'User not found' })
    const products = await Product.find({ seller: user._id, status: 'active' }).sort({ createdAt: -1 }).limit(12)
    res.json({ user, products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
