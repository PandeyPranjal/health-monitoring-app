import { useState, useEffect, useCallback } from 'react'
import alertService from '../../services/alertService'
import {
  HeartPulseIcon, MoonIcon, DropletIcon, ThermometerIcon,
  ShieldIcon, CheckIcon, XIcon,
} from '../../components/icons'

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    dot: 'bg-danger',
    text: 'text-danger',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    dot: 'bg-warning',
    text: 'text-yellow-600',
    label: 'Warning',
  },
  info: {
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    dot: 'bg-accent',
    text: 'text-accent',
    label: 'Info',
  },
}

const TYPE_ICONS = {
  high_heart_rate: HeartPulseIcon,
  low_heart_rate: HeartPulseIcon,
  poor_sleep: MoonIcon,
  low_spo2: DropletIcon,
  high_bp: ShieldIcon,
  high_temperature: ThermometerIcon,
}

// ── Skeletons ──────────────────────────────────────

function AlertSkeleton() {
  return (
    <div className="bg-surface rounded-[var(--radius-lg)] p-4 shadow-card">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full shimmer-bg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-4 rounded shimmer-bg" />
          <div className="w-full h-3 rounded shimmer-bg" />
          <div className="w-1/3 h-3 rounded shimmer-bg" />
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (filter !== 'all') params.severity = filter
      const data = await alertService.getAlerts(params)
      setAlerts(data.results || [])
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleMarkRead = async (id) => {
    try {
      await alertService.markRead(id)
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      )
    } catch { /* ignore */ }
  }

  const handleDismiss = async (id) => {
    try {
      await alertService.dismiss(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllRead()
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
    } catch { /* ignore */ }
  }

  const unreadCount = alerts.filter((a) => !a.is_read).length
  const filters = ['all', 'critical', 'warning', 'info']

  // ── Loading ──────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <div className="w-20 h-6 rounded shimmer-bg" />
          <div className="w-24 h-4 rounded shimmer-bg" />
        </div>
        {[...Array(4)].map((_, i) => (
          <AlertSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Alerts</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-text-muted">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-primary hover:text-primary-dark
                       transition-colors active:scale-95"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200
              ${filter === f
                ? 'bg-primary text-white shadow-button'
                : 'bg-surface text-text-secondary hover:bg-surface-elevated border border-border'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <div className="animate-slide-up py-8">
          <div className="bg-gradient-to-br from-success/80 to-success rounded-[var(--radius-xl)] p-6 shadow-button relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 bounce-in">
                <CheckIcon className="w-8 h-8 text-white drop-shadow-sm" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
                All Clear!
              </h3>
              <p className="text-sm text-white/90 max-w-[220px] mx-auto font-medium">
                You have no active health alerts. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert, index) => {
            const severity = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
            const IconComp = TYPE_ICONS[alert.alert_type] || ShieldIcon

            return (
              <div
                key={alert.id}
                className={`relative bg-surface rounded-[var(--radius-lg)] p-4 shadow-card
                           border transition-all duration-300 slide-in-right
                           ${!alert.is_read ? severity.border : 'border-transparent'}
                           ${!alert.is_read ? 'border-l-[3px]' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                  ${severity.bg}`}>
                    <IconComp className={`w-5 h-5 ${severity.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold leading-tight
                                     ${alert.is_read ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {alert.title}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {!alert.is_read && (
                          <button
                            onClick={() => handleMarkRead(alert.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full
                                       hover:bg-surface-elevated transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="w-3.5 h-3.5 text-text-muted" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full
                                     hover:bg-danger/10 transition-colors"
                          title="Dismiss"
                        >
                          <XIcon className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                      {alert.message}
                    </p>

                    {/* Actionable Smart Alert CTA */}
                    {(alert.severity === 'critical' || alert.severity === 'high' || alert.severity === 'warning') && (
                      <div className="mt-2.5 mb-2">
                        <button 
                          onClick={() => window.location.assign('/appointments')}
                          className="w-full py-2 bg-danger/10 hover:bg-danger/20 text-danger text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors border border-danger/20 shadow-sm active:scale-[0.98]"
                        >
                          Consult a Doctor Now
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5
                                       rounded-full ${severity.bg} ${severity.text}`}>
                        {severity.label}
                      </span>
                      {alert.metric_value && (
                        <span className="text-[11px] text-text-muted font-medium">
                          {alert.metric_value}
                        </span>
                      )}
                      <span className="text-[11px] text-text-muted ml-auto">
                        {alert.time_ago}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
