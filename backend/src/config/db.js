const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextowner'

  try {
    await mongoose.connect(uri, {
      family: 4,
    })

    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB