import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate, useLocation } from 'react-router-dom'
import fitbitService from '../../services/fitbitService'
import {
  ProfileIcon, MoonIcon, SunIcon, WifiIcon,
  ShieldIcon, HeartPulseIcon, LogOutIcon, ChevronRightIcon,
  RefreshIcon, CheckIcon,
} from '../../components/icons'

function SettingsRow({ icon, iconBg, label, sublabel, onClick, trailing, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5
                 transition-all duration-200 active:scale-[0.99]
                 ${disabled ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-surface-elevated'}`}
    >
      <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {sublabel && (
          <p className="text-[11px] text-text-muted mt-0.5">{sublabel}</p>
        )}
      </div>
      {trailing || <ChevronRightIcon className="w-4 h-4 text-text-muted" />}
    </button>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [fitbitStatus, setFitbitStatus] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchFitbitStatus = useCallback(async () => {
    try {
      const status = await fitbitService.getStatus()
      setFitbitStatus(status)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchFitbitStatus()

    // Check for success message in URL
    const params = new URLSearchParams(location.search)
    if (params.get('fitbit') === 'success') {
      setMessage({ type: 'success', text: 'Fitbit connected successfully!' })
      // Clear URL params
      navigate('/profile', { replace: true })
    }
  }, [fetchFitbitStatus, location.search, navigate])

  const handleFitbitConnect = async () => {
    try {
      const { authorization_url } = await fitbitService.getConnectUrl()
      window.location.href = authorization_url
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to get Fitbit connect URL.' })
    }
  }

  const handleFitbitSync = async () => {
    setIsSyncing(true)
    try {
      await fitbitService.sync()
      setMessage({ type: 'success', text: 'Health data synced with Fitbit.' })
      fetchFitbitStatus()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to sync with Fitbit.' })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFitbitDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Fitbit?')) return
    try {
      await fitbitService.disconnect()
      fetchFitbitStatus()
      setMessage({ type: 'success', text: 'Fitbit disconnected.' })
    } catch { /* ignore */ }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : 'User'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl
                        text-xs font-bold animate-bounce-in flex items-center gap-2
                        ${message.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
          {message.type === 'success' ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-surface rounded-[var(--radius-xl)] shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary-dark px-5 pt-8 pb-10 text-center relative">
          <div className="absolute top-3 left-5 w-16 h-16 bg-white/5 rounded-full" />
          <div className="absolute bottom-4 right-8 w-10 h-10 bg-white/5 rounded-full" />

          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur
                          flex items-center justify-center mb-3 bounce-in border border-white/30">
            <span className="text-2xl font-bold text-white drop-shadow-sm">{initials}</span>
          </div>
          <h2 className="text-lg font-bold text-white">{fullName}</h2>
          <p className="text-sm text-white/60 mt-0.5">@{user?.username || 'user'}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 divide-x divide-border -mt-5 mx-4
                        bg-surface rounded-[var(--radius-lg)] shadow-md relative z-10 border border-border/50">
          {[
            { label: 'Status', value: 'Active', color: 'text-success' },
            { label: 'Role', value: user?.role === 'doctor' ? 'Doc' : 'User' },
            { label: 'ID', value: `#${user?.pk?.toString().padStart(3, '0') || '001'}` },
          ].map((s) => (
            <div key={s.label} className="text-center py-3.5">
              <p className={`text-sm font-bold ${s.color || 'text-text-primary'}`}>{s.value}</p>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Sections */}
      <div className="bg-surface rounded-[var(--radius-xl)] shadow-card overflow-hidden divide-y divide-border">
        <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-elevated/50">
          Preferences
        </p>
        <SettingsRow
          icon={isDark ? <SunIcon className="w-4 h-4 text-warning" /> : <MoonIcon className="w-4 h-4 text-primary-light" />}
          iconBg={isDark ? 'bg-warning/10' : 'bg-primary-light/10'}
          label={isDark ? 'Light Mode' : 'Dark Mode'}
          sublabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
          trailing={
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300
                            ${isDark ? 'bg-primary' : 'bg-border'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300
                              ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          }
        />
      </div>

      <div className="bg-surface rounded-[var(--radius-xl)] shadow-card overflow-hidden divide-y divide-border">
        <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface-elevated/50">
          Integrations
        </p>
        <SettingsRow
          icon={<WifiIcon className={`w-4 h-4 ${fitbitStatus?.connected ? 'text-accent' : 'text-text-muted'}`} />}
          iconBg={fitbitStatus?.connected ? 'bg-accent/10' : 'bg-surface-elevated'}
          label="Fitbit"
          sublabel={fitbitStatus?.connected ? `Connected (${fitbitStatus.fitbit_user_id})` : "Connect your device"}
          onClick={fitbitStatus?.connected ? handleFitbitSync : handleFitbitConnect}
          disabled={isSyncing}
          trailing={
            fitbitStatus?.connected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleFitbitSync(); }}
                  className={`w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center transition-all
                             ${isSyncing ? 'animate-spin' : 'hover:bg-accent/20 active:scale-90'}`}
                >
                  <RefreshIcon className="w-3.5 h-3.5 text-accent" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFitbitDisconnect(); }}
                  className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center hover:bg-danger/20 active:scale-90"
                >
                  <XIcon className="w-3.5 h-3.5 text-danger" />
                </button>
              </div>
            ) : (
              <Badge variant="muted">Not Connected</Badge>
            )
          }
        />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5
                   bg-surface rounded-[var(--radius-xl)] shadow-card
                   text-danger font-bold text-sm
                   hover:bg-danger/5 transition-all duration-200
                   active:scale-[0.98] border border-transparent active:border-danger/10"
      >
        <LogOutIcon className="w-4 h-4" />
        Sign Out
      </button>

      <p className="text-center text-[10px] text-text-muted pb-4 font-medium">
        HealthPulse v1.1.0 • Built with ❤️ for your health
      </p>
    </div>
  )
}

function XIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
