import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { getStoredToken } from '../services/authService'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const instanceRef = useRef(null)
  const [socket,      setSocket]      = useState(null)
  const [connected,   setConnected]   = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    const token = getStoredToken()
    if (!user || !token) {
      instanceRef.current?.disconnect()
      instanceRef.current = null
      setSocket(null)
      setConnected(false)
      setOnlineUsers(new Set())
      return
    }

    // Use a dedicated VITE_SOCKET_URL if set, otherwise derive safely from VITE_API_BASE
    const socketUrl = (() => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL
      const base = import.meta.env.VITE_API_BASE
      if (!base) return 'http://localhost:5000'
      // Strip the trailing /api segment correctly using URL parsing
      try {
        const u = new URL(base)
        u.pathname = u.pathname.replace(/\/api\/?$/, '') || '/'
        return u.origin + (u.pathname === '/' ? '' : u.pathname)
      } catch { return 'http://localhost:5000' }
    })()

    const s = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] })
    instanceRef.current = s

    s.on('connect', () => {
      setConnected(true)
      setSocket(s)
    })

    s.on('disconnect', () => {
      setConnected(false)
      setSocket(null)
    })

    s.on('online_users', (ids) => {
      setOnlineUsers(new Set(ids))
    })

    s.on('user_status', ({ userId, online }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        if (online) next.add(userId)
        else next.delete(userId)
        return next
      })
    })

    // Reconnect → re-expose socket
    s.on('reconnect', () => {
      setConnected(true)
      setSocket(s)
    })

    return () => {
      s.disconnect()
      instanceRef.current = null
      setSocket(null)
      setConnected(false)
      setOnlineUsers(new Set())
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
