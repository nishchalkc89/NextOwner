import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, PackagePlus, MessageSquare, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const ITEMS = [
  { icon: Home,          label: 'Home',     path: '/'          },
  { icon: Search,        label: 'Search',   path: '/search'    },
  { icon: PackagePlus,   label: 'Sell',     path: '/sell',   isSell: true },
  { icon: MessageSquare, label: 'Messages', path: '/messages'  },
  { icon: User,          label: 'Profile',  path: '/profile'   },
]

export default function BottomNav() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Soft fog gradient */}
      <div
        className="h-12 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0c0c10 20%, transparent)' }}
      />

      {/* Floating pill */}
      <div
        className="px-4 pointer-events-auto"
        style={{ paddingBottom: 'max(18px, env(safe-area-inset-bottom, 18px))' }}
      >
        <nav
          className="max-w-md mx-auto rounded-[26px]"
          style={{
            background: 'rgba(11,11,15,0.96)',
            backdropFilter: 'blur(44px) saturate(200%)',
            WebkitBackdropFilter: 'blur(44px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.082)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          <div className="flex items-end justify-around px-2 h-[60px] pb-2">
            {ITEMS.map(({ icon: Icon, label, path, isSell }) => {
              const active = pathname === path || (path !== '/' && pathname.startsWith(path + '/'))

              if (isSell) return (
                <motion.button
                  key="sell"
                  whileTap={{ scale: 0.84 }}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-1 -mt-7"
                >
                  <div
                    className="w-[50px] h-[50px] rounded-full flex items-center justify-center sell-btn"
                    style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                  >
                    <Icon size={21} className="text-white" strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-semibold leading-none" style={{ color: '#55555f' }}>Sell</span>
                </motion.button>
              )

              return (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-[3px] min-w-[44px] relative"
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.4 : 1.7}
                      style={{ color: active ? '#7c6af7' : '#55555f', transition: 'color 0.18s ease' }}
                    />
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="nav-dot"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full"
                          style={{
                            background: '#7c6af7',
                            boxShadow: '0 0 8px rgba(124,106,247,0.8)',
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <span
                    className="text-[10px] font-medium leading-none transition-colors"
                    style={{ color: active ? '#a79cf9' : '#44444c' }}
                  >
                    {label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
