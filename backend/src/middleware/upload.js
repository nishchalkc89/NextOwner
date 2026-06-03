const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files allowed'))
  },
})

async function uploadToCloud(buffer, folder = 'nextowner') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

async function uploadMany(files, folder) {
  return Promise.all(files.map(f => uploadToCloud(f.buffer, folder)))
}

module.exports = { upload, uploadToCloud, uploadMany }
