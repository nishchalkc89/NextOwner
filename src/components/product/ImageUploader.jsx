import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ImagePlus, X, Plus, Star } from 'lucide-react'

export default function ImageUploader({ images, setImages, maxImages = 5 }) {
  const cameraRef  = useRef(null)
  const galleryRef = useRef(null)

  const handleFiles = (files) => {
    const valid = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, maxImages - images.length)
    const previews = valid.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setImages(prev => [...prev, ...previews])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const remaining = maxImages - images.length

  return (
    <div className="space-y-4">

      {/* Preview grid + add slot */}
      <div className="flex gap-2.5 flex-wrap">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img.url}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="relative flex-shrink-0"
              style={{ width: 80, height: 80 }}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover rounded-2xl"
              />
              {/* Cover label */}
              {i === 0 && (
                <div
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 rounded-b-2xl py-1"
                  style={{ background: 'rgba(249,115,22,0.85)', backdropFilter: 'blur(4px)' }}
                >
                  <Star size={8} className="text-white fill-white" />
                  <span className="text-white text-[8px] font-black uppercase tracking-wide">Cover</span>
                </div>
              )}
              {/* Remove button */}
              <motion.button
                whileTap={{ scale: 0.75 }}
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#1a1a1e', border: '1.5px solid rgba(255,255,255,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                <X size={10} className="text-gray-300" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add slot */}
        {images.length < maxImages && (
          <motion.div
            whileTap={{ scale: 0.94 }}
            onClick={() => galleryRef.current?.click()}
            className="flex-shrink-0 flex flex-col items-center justify-center cursor-pointer rounded-2xl"
            style={{
              width: 80, height: 80,
              border: '1.5px dashed rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            <Plus size={20} className="text-gray-500" />
            <span className="text-gray-600 text-[9px] mt-1 font-medium">Add</span>
          </motion.div>
        )}
      </div>

      {/* Upload buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => cameraRef.current?.click()}
          disabled={remaining === 0}
          className="flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-[13px] font-semibold disabled:opacity-35 transition-all"
          style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)', color: '#fb923c' }}
        >
          <Camera size={16} />
          Take Photo
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => galleryRef.current?.click()}
          disabled={remaining === 0}
          className="flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-[13px] font-semibold disabled:opacity-35 transition-all"
          style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)', color: '#4ade80' }}
        >
          <ImagePlus size={16} />
          Gallery
        </motion.button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Count hint */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-[11px]">
          {images.length}/{maxImages} photos
        </p>
        {remaining > 0 && (
          <p className="text-gray-700 text-[11px]">{remaining} more allowed</p>
        )}
      </div>
    </div>
  )
}
