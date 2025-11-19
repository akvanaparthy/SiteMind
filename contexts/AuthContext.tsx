'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  username: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ⚠️ CRITICAL SECURITY WARNING ⚠️
// TODO: Replace with NextAuth.js backend authentication
// These hardcoded credentials are TEMPORARY and for development ONLY
// DO NOT deploy to production without implementing proper auth
// See TODO.md -> Critical Missing Features -> #1 Authentication System
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const userData: User = { username, role: 'admin' }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
