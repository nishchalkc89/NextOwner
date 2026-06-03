const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Furniture', 'Books', 'Appliances', 'Fashion', 'Vehicles', 'Hostel Essentials', 'Others'],
  },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: { type: String, default: '' },
  location: { type: String, default: '' },
  condition: {
    type: String,
    enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good',
  },
  status: { type: String, enum: ['active', 'sold', 'deleted'], default: 'active' },
  brand:         { type: String, default: '' },
  usageDuration: { type: String, default: '' },
  negotiable:    { type: Boolean, default: false },
  views:         { type: Number, default: 0 },
  featured:      { type: Boolean, default: false },
}, { timestamps: true })

productSchema.index({ title: 'text', description: 'text' })
productSchema.index({ category: 1, status: 1 })
productSchema.index({ seller: 1 })
productSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Product', productSchema)
