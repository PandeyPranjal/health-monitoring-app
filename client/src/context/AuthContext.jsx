import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const AuthContext = createContext(null)

/**
 * AuthProvider — manages authentication state across the app.
 *
 * Provides: { user, isLoading, login, register, logout, isAuthenticated }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── On mount: check if user is already logged in ───
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile()
          setUser(profile)
        } catch {
          // Token expired or invalid — clear
          authService.clearTokens()
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  // ── Login ──────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    authService.saveTokens({
      access: data.access,
      refresh: data.refresh,
    })
    setUser(data.user)
    return data
  }, [])

  // ── Register ───────────────────────────────────────
  const register = useCallback(async (formData) => {
    const data = await authService.register(formData)
    authService.saveTokens(data.tokens)
    setUser(data.user)
    return data
  }, [])

  // ── Logout ─────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = authService.getRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // Ignore — token may already be invalid
    } finally {
      authService.clearTokens()
      setUser(null)
    }
  }, [])

  // ── Session Expiry Event Listener ──────────────────
  useEffect(() => {
    const handleSessionExpired = () => {
      authService.clearTokens()
      setUser(null)
    }
    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  // ── Refresh Profile ────────────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile()
      setUser(profile)
      return profile
    } catch (err) {
      console.error('Failed to refresh profile:', err)
      throw err
    }
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
