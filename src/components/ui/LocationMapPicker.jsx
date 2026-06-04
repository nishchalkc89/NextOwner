/**
 * LocationMapPicker
 * Zomato-style full-screen map modal with a draggable pin.
 * Uses Leaflet + OpenStreetMap tiles — zero API key required.
 *
 * Props:
 *   initialLat / initialLng  — starting position (default: Delhi)
 *   onConfirm({ lat, lng, address }) — called when user taps "Use this location"
 *   onClose  — called when user taps × or backdrop
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Navigation, Loader } from 'lucide-react'

/* Lazy-load Leaflet CSS the first time this component mounts */
function ensureLeafletCSS() {
  if (document.getElementById('leaflet-css')) return
  const link = document.createElement('link')
  link.id   = 'leaflet-css'
  link.rel  = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
}

/* Reverse-geocode via Nominatim (no API key) */
async function revGeo(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'NextOwner/1.0' } }
    )
    if (!r.ok) return null
    const d = await r.json()
    const a = d.address || {}
    const place = a.amenity || a.building || a.neighbourhood || a.suburb || ''
    const city  = a.city    || a.town     || a.county        || ''
    if (place && city)  return `Near ${place}, ${city}`
    if (place)          return `Near ${place}`
    if (city)           return city
    const parts = (d.display_name || '').split(',').map(s => s.trim()).filter(Boolean)
    return parts.slice(0, 2).join(', ') || null
  } catch { return null }
}

export default function LocationMapPicker({
  initialLat = 28.6139,   // New Delhi default
  initialLng = 77.2090,
  onConfirm,
  onClose,
}) {
  const mapRef      = useRef(null)   // Leaflet map instance
  const markerRef   = useRef(null)   // Leaflet marker instance
  const containerRef = useRef(null)  // DOM div for map

  const [address,     setAddress]     = useState('')
  const [geocoding,   setGeocoding]   = useState(false)
  const [pos,         setPos]         = useState({ lat: initialLat, lng: initialLng })
  const [relocating,  setRelocating]  = useState(false)

  /* Fetch address for the current pin position */
  const fetchAddress = useCallback(async (lat, lng) => {
    setGeocoding(true)
    const addr = await revGeo(lat, lng)
    setAddress(addr || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`)
    setGeocoding(false)
  }, [])

  /* Initialise map once */
  useEffect(() => {
    ensureLeafletCSS()
    let L, map, marker

    async function init() {
      const mod = await import('leaflet')
      L = mod.default

      // Fix default icon paths (webpack/vite asset hashing breaks them)
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!containerRef.current || mapRef.current) return   // already mounted

      map = L.map(containerRef.current, {
        center:  [initialLat, initialLng],
        zoom:    16,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      /* Custom pin: large orange teardrop */
      const pinIcon = L.divIcon({
        className: '',
        iconSize:  [40, 48],
        iconAnchor: [20, 48],
        html: `<div style="
          width:40px;height:48px;display:flex;flex-direction:column;
          align-items:center;justify-content:flex-end;
        ">
          <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:linear-gradient(135deg,#f97316,#ea580c);
            transform:rotate(-45deg);
            box-shadow:0 4px 18px rgba(249,115,22,0.55);
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="transform:rotate(45deg);color:white;font-size:16px;">📍</div>
          </div>
          <div style="
            width:6px;height:12px;
            background:linear-gradient(180deg,#f97316,transparent);
            border-radius:0 0 3px 3px;
          "></div>
        </div>`,
      })

      marker = L.marker([initialLat, initialLng], {
        icon:      pinIcon,
        draggable: true,
      }).addTo(map)

      markerRef.current = marker
      mapRef.current    = map

      /* Update address on drag */
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        setPos({ lat, lng })
        fetchAddress(lat, lng)
      })

      /* Also allow clicking map to move pin */
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setPos({ lat, lng })
        fetchAddress(lat, lng)
      })

      /* Initial address fetch */
      fetchAddress(initialLat, initialLng)
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current   = null
        markerRef.current = null
      }
    }
  }, [])   // run once — intentionally no deps (initialLat/Lng are stable at mount)

  /* Re-centre to device GPS */
  const handleReloc = () => {
    if (!navigator.geolocation) return
    setRelocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setRelocating(false)
        setPos({ lat, lng })
        mapRef.current?.setView([lat, lng], 17)
        markerRef.current?.setLatLng([lat, lng])
        fetchAddress(lat, lng)
      },
      () => setRelocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleConfirm = () => {
    onConfirm({ lat: pos.lat, lng: pos.lng, address })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: '#0c0c10' }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{
          height: 58,
          background: 'rgba(12,12,16,0.96)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 'env(safe-area-inset-top,0px)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.84 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <X size={16} style={{ color: '#8a8a9a' }} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[15px] leading-none" style={{ color: '#eeeef2' }}>
            Set Your Location
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#55555f' }}>
            Drag the pin or tap the map to adjust
          </p>
        </div>
        {/* Re-center to GPS */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleReloc}
          disabled={relocating}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)' }}
        >
          {relocating
            ? <Loader size={14} className="animate-spin" style={{ color: '#f97316' }} />
            : <Navigation size={14} style={{ color: '#f97316' }} />
          }
        </motion.button>
      </div>

      {/* ── Map fills remaining height ── */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />

        {/* Centre crosshair hint — fades out after 3s */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="text-center"
          >
            <p className="text-[11px] px-3 py-1.5 rounded-full font-medium"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#f97316' }}>
              Drag pin to your exact location
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Address bar + confirm ── */}
      <div
        className="flex-shrink-0 px-4 pb-safe"
        style={{
          background: 'rgba(12,12,16,0.97)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 14,
          paddingBottom: 'max(20px, env(safe-area-inset-bottom,20px))',
        }}
      >
        {/* Detected address */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[14px] mb-3"
          style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <MapPin size={16} style={{ color: '#f97316', flexShrink: 0 }} />
          <p className="text-[13px] flex-1 leading-snug"
            style={{ color: geocoding ? '#55555f' : '#eeeef2' }}>
            {geocoding ? 'Finding address…' : (address || 'Tap the map or drag the pin')}
          </p>
          {geocoding && <Loader size={12} className="animate-spin flex-shrink-0" style={{ color: '#55555f' }} />}
        </div>

        {/* Confirm button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          disabled={geocoding}
          className="w-full py-4 rounded-[16px] font-black text-[14px] text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg,#f97316,#ea580c)',
            boxShadow: '0 4px 20px rgba(249,115,22,0.32)',
          }}
        >
          <MapPin size={16} />
          Use This Location
        </motion.button>
      </div>
    </motion.div>
  )
}
