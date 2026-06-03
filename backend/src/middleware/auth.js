const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function protect(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' })
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev_secret')
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    // Banned users get 403 with a special code so the frontend can handle it
    if (user.banned) {
      return res.status(403).json({
        message: 'Your account has been suspended. Contact support for help.',
        code: 'BANNED',
      })
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = { protect }
