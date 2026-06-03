const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:  {
    type: String,
    enum: ['message', 'verification_approved', 'verification_rejected', 'product_sold', 'system'],
    default: 'system',
  },
  title: { type: String, required: true },
  body:  { type: String, default: '' },
  read:  { type: Boolean, default: false, index: true },
  link:  { type: String, default: '' },
  data:  { type: Object, default: {} },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
