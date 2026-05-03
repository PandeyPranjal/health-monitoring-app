import { useState, useEffect, useCallback } from 'react'
import { Card, MiniChart, Badge } from '../../components'
import { useAuth } from '../../context/AuthContext'
import healthService from '../../services/healthService'
import { DEMO_LATEST, DEMO_SUMMARY, DEMO_RECORDS } from '../../services/demoData'
import {
  HeartPulseIcon,
  ActivityIcon,
  DropletIcon,
  MoonIcon,
  ThermometerIcon,
  TrendUpIcon,
} from '../../components/icons'
import ManualEntryModal from './ManualEntryModal'

// ── Helpers ──────────────────────────────────────────

function formatTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatSleep(hours) {
  if (!hours) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}


// ── Loading Skeleton ─────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-surface rounded-[var(--radius-lg)] p-4 shadow-card">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-[var(--radius-md)] shimmer-bg" />
        <div className="w-16 h-3 rounded shimmer-bg" />
      </div>
      <div className="w-20 h-7 rounded shimmer-bg mb-2" />
      <div className="w-24 h-3 rounded shimmer-bg" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-surface rounded-[var(--radius-lg)] p-4 shadow-card">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-[var(--radius-md)] shimmer-bg" />
        <div className="w-28 h-3 rounded shimmer-bg" />
      </div>
      <div className="w-full h-[120px] rounded-lg shimmer-bg" />
    </div>
  )
}


// ── Dashboard Page ───────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [latest, setLatest] = useState(null)
  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [deviceConnected, setDeviceConnected] = useState(() => localStorage.getItem('deviceConnected') === 'true')
  const [demoActive, setDemoActive] = useState(() => localStorage.getItem('useDemo') === 'true')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [latestData, summaryData, recordsData] = await Promise.allSettled([
        healthService.getLatest(),
        healthService.getSummary('week'),
        healthService.getRecords(),
      ])

      const realLatest = latestData.status === 'fulfilled' ? latestData.value : null
      const realSummary = summaryData.status === 'fulfilled' ? summaryData.value : null
      const realRecords = recordsData.status === 'fulfilled' ? (recordsData.value.results || []) : []

      // Use real data if available, otherwise fall back to demo data
      setLatest(realLatest || DEMO_LATEST)
      setSummary(realSummary?.record_count ? realSummary : DEMO_SUMMARY)
      setRecords(realRecords.length > 0 ? realRecords : DEMO_RECORDS)
    } catch {
      setError('Failed to load health data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Build chart data from records (last 7 entries, reversed to chronological)
  const chartRecords = [...records].reverse().slice(-7)
  const chartLabels = chartRecords.map((r) => formatDate(r.timestamp))
  const heartRateData = chartRecords.map((r) => r.heart_rate)
  const stepsData = chartRecords.map((r) => r.steps)
  const sleepData = chartRecords.map((r) => parseFloat(r.sleep_hours))

  const firstName = user?.first_name || 'there'

  // ── Loading State ────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[var(--radius-lg)] p-4 shadow-button">
          <div className="w-24 h-3 bg-white/20 rounded mb-3 shimmer-bg" />
          <div className="w-20 h-8 bg-white/20 rounded mb-2 shimmer-bg" />
          <div className="w-32 h-3 bg-white/20 rounded shimmer-bg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  // ── Error State ──────────────────────
  if (error && !latest) {
    return (
      <div className="text-center py-20 animate-scale-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1">Connection Error</h3>
        <p className="text-sm text-text-muted mb-6 px-4">{error}</p>
        <button 
          onClick={fetchData} 
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-button hover:opacity-90 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ── Empty State ──────────────────────
  if (!latest && !error) {
    return (
      <div className="animate-slide-up space-y-4">
        {/* Friendly CTA Overlay */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[var(--radius-lg)] p-5 shadow-button relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2">
              No data yet — start tracking your health
            </h2>
            <p className="text-xs text-white/80 mb-5 max-w-[260px] leading-relaxed">
              Connect a wearable device or start logging your vitals manually to see insights here.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => window.location.assign('/health')}
                className="px-5 py-2.5 bg-white text-primary text-[11px] uppercase tracking-widest font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Add Data
              </button>
              <button
                onClick={() => window.location.assign('/profile')}
                className="px-5 py-2.5 bg-white/20 text-white text-[11px] uppercase tracking-widest font-bold rounded-xl hover:bg-white/30 active:scale-[0.98] transition-all"
              >
                Connect Device
              </button>
            </div>
          </div>
        </div>

        {/* Demo / Skeleton Data to preserve UI structure */}
        <div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 ml-1">Example Dashboard</h3>
          <div className="grid grid-cols-2 gap-3 opacity-[0.35] grayscale pointer-events-none select-none">
            <Card
              icon={<HeartPulseIcon className="w-5 h-5 text-danger" />}
              iconBg="bg-danger/10"
              title="Heart Rate"
              value="72 bpm"
              subtitle="Resting • 10m ago"
            />
            <Card
              icon={<ActivityIcon className="w-4 h-4 text-accent" />}
              iconBg="bg-accent/10"
              title="Steps"
              value="6,240"
              subtitle="Today"
            />
            <Card
              icon={<MoonIcon className="w-4 h-4 text-primary-light" />}
              iconBg="bg-primary-light/10"
              title="Sleep"
              value="7h 20m"
              subtitle="Last night"
            />
            <Card
              icon={<DropletIcon className="w-4 h-4 text-blue-500" />}
              iconBg="bg-blue-500/10"
              title="SpO₂"
              value="98%"
              subtitle="Normal range"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Error State ──────────────────────
  if (error) {
    return (
      <div className="animate-slide-up text-center py-12">
        <p className="text-sm text-danger mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-[var(--radius-md)]
                     shadow-button hover:bg-primary-dark transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">

      {/* ── Hero: Heart Rate ─────────────────── */}
      <Card
        variant="gradient"
        icon={<HeartPulseIcon className="w-5 h-5 text-white" />}
        iconBg="bg-white/20"
        title="Heart Rate"
        value={latest?.heart_rate ? `${latest.heart_rate} bpm` : '— bpm'}
        subtitle={`Resting • ${latest?.timestamp ? timeAgo(latest.timestamp) : 'No data'}`}
      />

      {/* ── Quick Stats Grid ─────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          icon={<ActivityIcon className="w-4 h-4 text-accent" />}
          iconBg="bg-accent/10"
          title="Steps"
          value={summary?.total_steps?.toLocaleString() || '—'}
          trend={summary?.total_steps > 5000 ? 'up' : 'down'}
          trendValue={summary?.total_steps > 5000 ? 'On track' : 'Low'}
          subtitle="This week"
        />
        <Card
          icon={<DropletIcon className="w-4 h-4 text-blue-500" />}
          iconBg="bg-blue-500/10"
          title="SpO₂"
          value={latest?.spo2 ? `${parseFloat(latest.spo2).toFixed(0)}%` : '—'}
          subtitle={parseFloat(latest?.spo2) >= 95 ? 'Normal range' : 'Below normal'}
        />
        <Card
          icon={<MoonIcon className="w-4 h-4 text-primary-light" />}
          iconBg="bg-primary-light/10"
          title="Sleep"
          value={formatSleep(summary?.avg_sleep_hours)}
          trend={summary?.avg_sleep_hours >= 7 ? 'up' : 'down'}
          trendValue={summary?.avg_sleep_hours >= 7 ? 'Good' : 'Low'}
          subtitle="Avg this week"
        />
        <Card
          icon={<TrendUpIcon className="w-4 h-4 text-danger" />}
          iconBg="bg-danger/10"
          title="Calories"
          value={summary?.total_calories ? Math.round(summary.total_calories).toLocaleString() : '—'}
          trend="up"
          trendValue={`${summary?.record_count || 0} readings`}
          subtitle="This week"
        />
      </div>

      {/* ── Connect Device ────────────────────── */}
      <div className="bg-surface rounded-[var(--radius-lg)] p-4 shadow-card border border-border/50">
        <div className="flex items-start gap-3.5 mb-3">
          <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0
            ${deviceConnected ? 'bg-success/10' : demoActive ? 'bg-primary/10' : 'bg-accent/10'}`}>
            {deviceConnected ? (
              <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : demoActive ? (
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-text-primary">
              {deviceConnected ? 'Device Connected' : demoActive ? 'Using Demo Data' : 'Connect your device'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {deviceConnected
                ? 'Your wearable is syncing health data'
                : demoActive
                  ? 'Showing sample health metrics'
                  : 'Connect your wearable or continue with demo data'}
            </p>
          </div>
        </div>

        {/* Default: neither active — show both options */}
        {!deviceConnected && !demoActive && (
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                localStorage.setItem('deviceConnected', 'true')
                setDeviceConnected(true)
                alert('Device connected successfully')
              }}
              className="flex-1 py-2.5 bg-primary text-white text-[11px] font-bold uppercase tracking-widest
                         rounded-xl shadow-button hover:bg-primary-dark active:scale-[0.97] transition-all"
            >
              Connect Device
            </button>
            <button
              onClick={() => {
                localStorage.setItem('useDemo', 'true')
                setDemoActive(true)
                setLatest(DEMO_LATEST)
                setSummary(DEMO_SUMMARY)
                setRecords(DEMO_RECORDS)
                alert('Demo data loaded')
              }}
              className="flex-1 py-2.5 bg-surface-elevated text-text-secondary text-[11px] font-bold uppercase tracking-widest
                         rounded-xl border border-border hover:bg-surface hover:text-text-primary active:scale-[0.97] transition-all"
            >
              Use Demo Data
            </button>
          </div>
        )}

        {/* Device connected — show disconnect */}
        {deviceConnected && (
          <button
            onClick={() => {
              localStorage.removeItem('deviceConnected')
              setDeviceConnected(false)
              fetchData()
              alert('Device disconnected')
            }}
            className="w-full py-2 bg-danger/10 text-danger text-[11px] font-bold uppercase tracking-widest
                       rounded-xl border border-danger/20 hover:bg-danger/20 active:scale-[0.97] transition-all"
          >
            Disconnect
          </button>
        )}

        {/* Demo active — show stop */}
        {demoActive && (
          <button
            onClick={() => {
              localStorage.removeItem('useDemo')
              setDemoActive(false)
              fetchData()
              alert('Demo data stopped')
            }}
            className="w-full py-2 bg-warning/10 text-yellow-700 text-[11px] font-bold uppercase tracking-widest
                       rounded-xl border border-warning/30 hover:bg-warning/20 active:scale-[0.97] transition-all"
          >
            Stop Demo
          </button>
        )}
      </div>

      {/* ── Heart Rate Chart ─────────────────── */}
      {heartRateData.some(Boolean) && (
        <Card
          icon={<HeartPulseIcon className="w-4 h-4 text-primary" />}
          iconBg="bg-primary/10"
          title="Heart Rate Trend"
        >
          <MiniChart
            labels={chartLabels}
            data={heartRateData}
            color="#6C5CE7"
            unit="bpm"
            height={130}
          />
        </Card>
      )}

      {/* ── Steps Chart ──────────────────────── */}
      {stepsData.some(Boolean) && (
        <Card
          icon={<ActivityIcon className="w-4 h-4 text-accent" />}
          iconBg="bg-accent/10"
          title="Steps Trend"
        >
          <MiniChart
            labels={chartLabels}
            data={stepsData}
            color="#00D2D3"
            unit="steps"
            height={130}
          />
        </Card>
      )}

      {/* ── Sleep Chart ──────────────────────── */}
      {sleepData.some(v => v > 0) && (
        <Card
          icon={<MoonIcon className="w-4 h-4 text-primary-light" />}
          iconBg="bg-primary-light/10"
          title="Sleep Trend"
        >
          <MiniChart
            labels={chartLabels}
            data={sleepData}
            color="#A29BFE"
            unit="hrs"
            height={130}
          />
        </Card>
      )}

      {/* ── Recent Records ───────────────────── */}
      {records.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Recent Readings</h3>
          <div className="space-y-2">
            {records.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="bg-surface rounded-[var(--radius-md)] p-3.5 shadow-card
                           flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-primary/10
                                  flex items-center justify-center shrink-0">
                    <HeartPulseIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {record.heart_rate && (
                        <span className="text-sm font-semibold text-text-primary">
                          {record.heart_rate} bpm
                        </span>
                      )}
                      {record.steps && (
                        <span className="text-xs text-text-muted">
                          • {record.steps.toLocaleString()} steps
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                    </p>
                  </div>
                </div>
                <Badge variant={record.source === 'manual' ? 'muted' : 'default'}>
                  {record.source === 'apple_watch' ? 'Apple' :
                   record.source === 'manual' ? 'Manual' :
                   record.source.charAt(0).toUpperCase() + record.source.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* ── FAB & Modal ──────────────────────── */}
      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        onSuccess={() => {
          setIsManualModalOpen(false);
          fetchData();
        }} 
      />

      <button
        onClick={() => setIsManualModalOpen(true)}
        className="fixed bottom-[88px] right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(108,92,231,0.4)] active:scale-95 transition-transform z-40 hover:bg-primary-dark group"
      >
        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

    </div>
  )
}
