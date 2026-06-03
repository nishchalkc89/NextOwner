const router = require('express').Router()
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

// GET /api/notifications — user's notifications (latest 50)
router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/notifications/read — mark ALL as read
router.put('/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/notifications/:id/read — mark ONE as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
