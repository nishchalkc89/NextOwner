import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider }  from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'

import Header          from './components/layout/Header'
import BottomNav       from './components/layout/BottomNav'
import Sidebar         from './components/layout/Sidebar'
import MessagesLayout  from './components/layout/MessagesLayout'
import InstallPrompt   from './components/ui/InstallPrompt'
import ScrollToTop     from './components/utils/ScrollToTop'

import SplashScreen      from './pages/SplashScreen'
import HomePage          from './pages/HomePage'
import SearchPage        from './pages/SearchPage'
import SellPage          from './pages/SellPage'
import MessagesPage      from './pages/MessagesPage'
import ChatPage          from './pages/ChatPage'
import ProfilePage       from './pages/ProfilePage'
import LoginPage         from './pages/LoginPage'
import VerificationPage  from './pages/VerificationPage'
import ProductDetailPage from './pages/ProductDetailPage'
import SellerProfilePage from './pages/SellerProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage      from './pages/SettingsPage'
import HelpPage          from './pages/HelpPage'
import SuspendedPage     from './pages/SuspendedPage'
import AboutPage         from './pages/info/AboutPage'
import ContactPage       from './pages/info/ContactPage'
import HowItWorksPage    from './pages/info/HowItWorksPage'
import SafetyTipsPage    from './pages/info/SafetyTipsPage'
import PrivacyPolicyPage from './pages/info/PrivacyPolicyPage'
import AdminLoginPage      from './pages/admin/AdminLoginPage'
import AdminDashboard      from './pages/admin/AdminDashboard'
import ForgotPasswordPage  from './pages/ForgotPasswordPage'
import ResetPasswordPage   from './pages/ResetPasswordPage'

/* Shell routes show the nav chrome */
const SHELL_ROUTES = ['/', '/search', '/sell', '/messages', '/profile']

function PageTransition({ children }) {
  const { pathname } = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const { suspended } = useAuth()

  /* showShell: sidebar + content offset (includes sub-routes like /messages/:id) */
  const showShell = SHELL_ROUTES.some(p =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
  )

  /* showNav: mobile Header + BottomNav — exact matches only.
     ChatPage (/messages/:id) has its own header and must NOT show BottomNav. */
  const showNav = SHELL_ROUTES.includes(pathname)

  /* Hide desktop topbar on /messages routes — MessagesLayout manages its own height */
  const isMessagesRoute = pathname === '/messages' || pathname.startsWith('/messages/')

  if (suspended && pathname !== '/suspended') {
    return <Navigate to="/suspended" replace />
  }

  return (
    <>
      {/* Desktop sidebar */}
      {showShell && <Sidebar />}

      {/* Mobile header */}
      {showNav && (
        <div className="lg:hidden">
          <Header />
        </div>
      )}

      {/* Desktop top bar — hidden on messages routes (split pane handles its own layout) */}
      {showShell && !isMessagesRoute && (
        <div
          className="hidden lg:flex fixed top-0 left-[240px] right-0 z-30 items-center"
          style={{
            height: 64,
            background: 'rgba(12,12,16,0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.052)',
          }}
        >
          <Header desktopMode />
        </div>
      )}

      {/* Page content */}
      <div className={showShell ? 'lg:ml-[240px] min-w-0' : 'min-w-0'}>
        <PageTransition>
          <Routes>
            {/* ── Shell pages ── */}
            <Route path="/"       element={<HomePage />}    />
            <Route path="/search" element={<SearchPage />}  />
            <Route path="/sell"   element={<SellPage />}    />
            <Route path="/profile" element={<ProfilePage />} />

            {/* ── Messages: nested layout for desktop split-pane ── */}
            <Route path="/messages" element={<MessagesLayout />}>
              <Route index         element={<MessagesPage />} />
              <Route path=":chatId" element={<ChatPage />}   />
            </Route>

            {/* ── Content pages ── */}
            <Route path="/product/:id"  element={<ProductDetailPage />} />
            <Route path="/login"           element={<LoginPage />}          />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify"       element={<VerificationPage />}  />
            <Route path="/user/:userId" element={<SellerProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings"     element={<SettingsPage />}      />
            <Route path="/help"         element={<HelpPage />}          />
            <Route path="/suspended"    element={<SuspendedPage />}     />

            {/* ── Info pages ── */}
            <Route path="/about"       element={<AboutPage />}         />
            <Route path="/contact"     element={<ContactPage />}       />
            <Route path="/how-it-works" element={<HowItWorksPage />}   />
            <Route path="/safety"      element={<SafetyTipsPage />}    />
            <Route path="/privacy"     element={<PrivacyPolicyPage />} />

            {/* ── Admin ── */}
            <Route path="/admin"           element={<AdminLoginPage />}   />
            <Route path="/admin/dashboard" element={<AdminDashboard />}  />
          </Routes>
        </PageTransition>
      </div>

      {/* Mobile bottom nav */}
      {showNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}

      <InstallPrompt />
    </>
  )
}

export default function App() {
  const [splash, setSplash] = useState(() => !sessionStorage.getItem('no_splash'))

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AnimatePresence>
              {splash && (
                <SplashScreen onDone={() => {
                  sessionStorage.setItem('no_splash', '1')
                  setSplash(false)
                }} />
              )}
            </AnimatePresence>

            {!splash && (
              <>
                <ScrollToTop />
                <AppShell />
              </>
            )}

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1c1c22',
                  color: '#f1f5f5',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  padding: '12px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#f97316', secondary: '#fff' } },
              }}
            />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
