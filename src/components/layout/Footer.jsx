import { motion } from 'framer-motion'
import { AtSign, Send, Globe, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QUICK = [
  { label: 'About Us',          path: '/about'        },
  { label: 'How it Works',      path: '/how-it-works'  },
  { label: 'Safety Tips',       path: '/safety'        },
  { label: 'Contact',           path: '/contact'       },
  { label: 'Privacy Policy',    path: '/privacy'       },
  { label: 'Terms & Conditions',path: '/terms'         },
  { label: 'Help Center',       path: '/help'          },
]

const CATS = [
  { label: 'Electronics',       path: '/search?category=Electronics'       },
  { label: 'Books',             path: '/search?category=Books'             },
  { label: 'Furniture',         path: '/search?category=Furniture'         },
  { label: 'Appliances',        path: '/search?category=Appliances'        },
  { label: 'Hostel Essentials', path: '/search?category=Hostel+Essentials' },
  { label: 'Vehicles',          path: '/search?category=Vehicles'          },
]

const SUPPORT_EMAIL = 'nishchalkc370@gmail.com'

const SOCIALS = [
  { Icon: AtSign, label: 'Instagram', href: 'https://instagram.com/nextowner.in'                              },
  { Icon: Send,   label: 'Telegram',  href: 'https://t.me/nextowner'                                          },
  { Icon: Globe,  label: 'Website',   href: 'https://nextowner.in'                                            },
  { Icon: Mail,   label: 'Email',     href: `mailto:${SUPPORT_EMAIL}?subject=NextOwner Support`               },
]

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer
      style={{ background: '#09090d', borderTop: '1px solid rgba(255,255,255,0.055)' }}
      className="mt-4 pt-10 pb-6 px-5"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Desktop: 4-column grid / Mobile: stacked ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8 mb-10">

          {/* Col 1: Brand */}
          <div className="lg:col-span-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="block mb-3"
            >
              <img
                src="/logo.png"
                alt="NextOwner"
                className="w-auto"
                style={{ height: 85, maxWidth: 220 }}
              />
            </motion.button>
            <p className="text-gray-600 text-[12px] leading-relaxed">
              The campus marketplace for students to buy, sell, and swap items.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5 mt-5">
              {SOCIALS.map(({ Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.84 }}
                  whileHover={{ scale: 1.1 }}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Icon size={14} className="text-gray-500" />
                </motion.a>
              ))}
            </div>
            {/* Support email */}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-medium transition-colors hover:text-orange-400"
              style={{ color: '#37373f' }}
            >
              <Mail size={10} />
              {SUPPORT_EMAIL}
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <p className="text-white font-bold text-[13px] mb-4">Quick Links</p>
            <ul className="space-y-3">
              {QUICK.map(({ label, path }) => (
                <li key={label}>
                  <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(path)}
                    className="text-gray-500 text-[12px] hover:text-orange-400 transition-colors font-medium text-left"
                  >
                    {label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <p className="text-white font-bold text-[13px] mb-4">Categories</p>
            <ul className="space-y-3">
              {CATS.map(({ label, path }) => (
                <li key={label}>
                  <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(path)}
                    className="text-gray-500 text-[12px] hover:text-orange-400 transition-colors font-medium text-left"
                  >
                    {label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: CTA / stats */}
          <div>
            <p className="text-white font-bold text-[13px] mb-4">NextOwner</p>
            <div className="space-y-3">
              {[
                { val: '10K+', label: 'Students' },
                { val: '25K+', label: 'Listings' },
                { val: '50+',  label: 'Campuses' },
              ].map(({ val, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-orange-400 font-black text-[15px] w-12">{val}</span>
                  <span className="text-gray-600 text-[12px]">{label}</span>
                </div>
              ))}
            </div>

            {/* Sell CTA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/sell')}
              className="mt-5 w-full py-2.5 rounded-[12px] text-[12px] font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.1))',
                border: '1px solid rgba(249,115,22,0.3)',
                color: '#fb923c',
              }}
            >
              🚀 List for Free
            </motion.button>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          {/* Links row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
            {[
              { label: 'Support',            href: `mailto:${SUPPORT_EMAIL}?subject=NextOwner Support`, external: true },
              { label: 'Privacy Policy',     path: '/privacy' },
              { label: 'Terms & Conditions', path: '/terms'   },
              { label: 'Help Center',        path: '/help'    },
            ].map(({ label, path, href, external }) => (
              external
                ? <a key={label} href={href}
                    className="text-gray-600 text-[11px] hover:text-orange-400 transition-colors font-medium"
                    rel="noopener noreferrer">{label}</a>
                : <motion.button key={label} whileHover={{ color: '#fb923c' }}
                    onClick={() => navigate(path)}
                    className="text-gray-600 text-[11px] hover:text-orange-400 transition-colors font-medium">
                    {label}
                  </motion.button>
            ))}
          </div>
          {/* Credit row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <p className="text-gray-700 text-[11px] font-medium">
              © 2025 NextOwner — The campus marketplace
            </p>
            <p className="text-gray-700 text-[11px] font-medium flex items-center gap-1">
              Made by{' '}
              <a
                href="https://nishchalkc.com.np/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-orange-400 transition-colors"
                style={{ color: '#7c6af7' }}
              >
                Nishchal KC
              </a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
