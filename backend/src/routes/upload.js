const router = require('express').Router()
const { protect } = require('../middleware/auth')
const { upload, uploadToCloud, uploadMany } = require('../middleware/upload')

// POST /api/upload/images — up to 5 product images
router.post('/images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No images provided' })
    const results = await uploadMany(req.files, 'nextowner/products')
    const urls = results.map(r => r.secure_url)
    res.json({ urls })
  } catch (err) {
    console.error('Product image upload error:', err.message)
    res.status(500).json({ message: 'Image upload failed: ' + (err.message || 'Cloudinary error') })
  }
})

// POST /api/upload/avatar — single profile photo
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' })
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' })
    }
    const result = await uploadToCloud(req.file.buffer, 'nextowner/avatars')
    res.json({ url: result.secure_url })
  } catch (err) {
    console.error('Avatar upload error:', err.message)
    res.status(500).json({ message: 'Avatar upload failed: ' + (err.message || 'Cloudinary error') })
  }
})

module.exports = router
