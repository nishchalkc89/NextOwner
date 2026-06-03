const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  avatar: { type: String, default: '' },
  university: { type: String, default: '' },
  country:    { type: String, default: '' },
  verificationStatus: {
    type: String,
    enum: ['not_submitted', 'under_review', 'verified', 'rejected'],
    default: 'not_submitted',
  },
  isVerified: { type: Boolean, default: false },
  studentIdImage: { type: String, default: '' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  googleId: { type: String, default: '' },
  isAdmin:          { type: Boolean, default: false },
  banned:           { type: Boolean, default: false },
  lastSeen:         { type: Date, default: Date.now },
  resetToken:       { type: String, default: '' },
  resetTokenExpiry: { type: Date },
  // ── Student verification (multi-layer) ──
  studentEmail:            { type: String, default: '' },
  studentEmailVerified:    { type: Boolean, default: false },
  verificationOtp:         { type: String, default: '' },   // stored hashed
  verificationOtpExpiry:   { type: Date },
  verificationOtpAttempts: { type: Number, default: 0 },
  verificationOtpLastSent: { type: Date },
  verificationNotes:       { type: String, default: '' },   // admin notes
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
