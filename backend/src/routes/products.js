const router  = require('express').Router()
const Product = require('../models/Product')
const User    = require('../models/User')
const { protect } = require('../middleware/auth')

/* ── helpers ── */
const SORT_MAP = {
  newest:     { createdAt: -1 },
  oldest:     { createdAt:  1 },
  price_asc:  { price:      1 },
  price_desc: { price:     -1 },
  popular:    { views:     -1 },   // "trending" alias → most viewed
}

// ─────────────────────────────────────────────────────────
// IMPORTANT: specific paths (/user/:id, /my) MUST come
// BEFORE the generic /:id route or Express will shadow them.
// ─────────────────────────────────────────────────────────

// GET /api/products/user/:userId  — listings by seller
router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.params.userId,
      status: { $ne: 'deleted' },
    })
      .populate('seller', 'name avatar university isVerified')
      .sort({ createdAt: -1 })
    res.json({ products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/products — list with filters, search, pagination
router.get('/', async (req, res) => {
  try {
    const {
      q, category, status = 'active',
      sort = 'newest', page = 1, limit = 20, featured,
    } = req.query

    const filter = { status }
    if (category && category !== 'All') filter.category = category
    if (featured === '1') filter.featured = true
    if (q) {
      const terms = q.trim().split(/\s+/).filter(Boolean)
      const regex = new RegExp(terms.join('|'), 'i')
      filter.$or = [
        { title:       { $regex: regex } },
        { description: { $regex: regex } },
        { category:    { $regex: regex } },
        { university:  { $regex: regex } },
        { brand:       { $regex: regex } },
      ]
    }

    const products = await Product.find(filter)
      .populate('seller', 'name avatar university isVerified')
      .sort(SORT_MAP[sort] || SORT_MAP.newest)
      .skip((+page - 1) * +limit)
      .limit(+limit)

    const total = await Product.countDocuments(filter)
    res.json({ products, total, page: +page, pages: Math.ceil(total / +limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name avatar university isVerified verificationStatus createdAt lastSeen')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    // Increment view count (fire-and-forget)
    Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec()
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/products — create
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, price, category,
      images, location, condition,
      brand, usageDuration, negotiable,
    } = req.body
    if (!images?.length) return res.status(400).json({ message: 'At least one image required' })

    const product = await Product.create({
      title, description,
      price:         Number(price),
      category,      images,
      location:      location || '',
      condition:     condition || 'Good',
      brand:         brand || '',
      usageDuration: usageDuration || '',
      negotiable:    Boolean(negotiable),
      seller:        req.user._id,
      university:    req.user.university || '',
    })
    await product.populate('seller', 'name avatar university isVerified')
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/products/:id — partial-safe update
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Only overwrite fields that were actually sent — avoids nuking fields with undefined
    const allowed = ['title', 'description', 'price', 'category', 'location',
                     'condition', 'status', 'brand', 'usageDuration', 'negotiable', 'images']
    allowed.forEach(key => {
      if (req.body[key] !== undefined) product[key] = req.body[key]
    })

    await product.save()
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/products/:id — soft-delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Not found' })
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    product.status = 'deleted'
    await product.save()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/products/:id/wishlist — toggle (uses $addToSet / $pull for correctness)
router.post('/:id/wishlist', protect, async (req, res) => {
  try {
    const pid  = req.params.id
    const user = await User.findById(req.user._id)

    // Compare as strings to handle ObjectId vs string mismatch
    const isWishlisted = user.wishlist.some(id => id.toString() === pid)

    if (isWishlisted) {
      await User.findByIdAndUpdate(req.user._id, { $pull:      { wishlist: pid } })
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet:  { wishlist: pid } })
    }

    res.json({ wishlisted: !isWishlisted })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
