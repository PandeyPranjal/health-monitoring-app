import { useState, useEffect, useCallback } from 'react'
import { Card, MiniChart, Badge } from '../../components'
import { useAuth } from '../../context/AuthContext'
import healthService from '../../services/healthService'
import {
  HeartPulseIcon,
  ActivityIcon,
  DropletIcon,
  MoonIcon,
  ThermometerIcon,
  TrendUpIcon,
} from '../../components/icons'


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
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [latestData, summaryData, recordsData] = await Promise.allSettled([
        healthService.getLatest(),
        healthService.getSummary('week'),
        healthService.getRecords(),
      ])

      if (latestData.status === 'fulfilled') setLatest(latestData.value)
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value)
      if (recordsData.status === 'fulfilled') setRecords(recordsData.value.results || [])
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

  // ── Empty State ──────────────────────
  if (!latest && !error) {
    return (
      <div className="animate-slide-up text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <HeartPulseIcon className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">No health data yet</h2>
        <p className="text-sm text-text-muted mb-6 max-w-[250px] mx-auto">
          Connect a wearable or manually add your first health reading to get started.
        </p>
        <button
          onClick={fetchData}
          className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-[var(--radius-md)]
                     shadow-button hover:bg-primary-dark active:scale-[0.97] transition-all duration-200"
        >
          Refresh Data
        </button>
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
    </div>
  )
}
