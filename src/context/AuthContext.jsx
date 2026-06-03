import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getMe, logout as doLogout, getStoredUser, getStoredToken } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(() => getStoredUser())
  const [loading,   setLoading]   = useState(!!getStoredToken())
  const [suspended, setSuspended] = useState(false)

  // Verify token and refresh user data on mount
  useEffect(() => {
    if (!getStoredToken()) { setLoading(false); return }
    getMe()
      .then(u => { setUser(u); setLoading(false) })
      .catch(() => { doLogout(); setUser(null); setLoading(false) })
  }, [])

  // Listen for 401 → force logout
  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  // Listen for 403 BANNED → force logout + show suspended page
  useEffect(() => {
    const handler = () => {
      doLogout()
      setUser(null)
      setSuspended(true)
    }
    window.addEventListener('auth:banned', handler)
    return () => window.removeEventListener('auth:banned', handler)
  }, [])

  const login = useCallback((userData) => {
    setSuspended(false)
    setUser(userData)
    localStorage.setItem('no_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    doLogout()
    setUser(null)
    setSuspended(false)
  }, [])

  const updateUser = useCallback((partial) => {
    setUser(prev => {
      const updated = { ...prev, ...partial }
      localStorage.setItem('no_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  if (loading) return (
    <div
      style={{
        minHeight: '100svh',
        background: '#0c0c10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '3px solid rgba(124,106,247,0.2)',
          borderTopColor: '#7c6af7',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, loading, suspended, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
