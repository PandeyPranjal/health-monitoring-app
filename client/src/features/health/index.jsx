import { useState, useEffect, useCallback } from 'react'
import healthService from '../../services/healthService'
import { DEMO_LATEST, DEMO_SUMMARY, DEMO_RECORDS } from '../../services/demoData'
import { Card, MiniChart, Button } from '../../components'
import {
  HeartPulseIcon, ActivityIcon, DropletIcon, MoonIcon,
  ThermometerIcon, RefreshIcon,
} from '../../components/icons'

import { Plus } from 'lucide-react'
import AddRecordModal from './AddRecordModal'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function MetricPill({ icon, label, value, unit, color }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-center gap-2 bg-surface rounded-[var(--radius-md)] px-3 py-2.5 shadow-card border border-transparent hover:border-primary/10 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">{label}</p>
        <p className="text-sm font-bold text-text-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="text-text-muted font-normal ml-0.5">{unit}</span>
        </p>
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────

function HealthSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-[var(--radius-md)] px-3 py-3 shadow-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg shimmer-bg" />
              <div className="space-y-1.5">
                <div className="w-12 h-2.5 rounded shimmer-bg" />
                <div className="w-16 h-3.5 rounded shimmer-bg" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-[var(--radius-lg)] p-4 shadow-card">
        <div className="w-24 h-3 rounded shimmer-bg mb-4" />
        <div className="w-full h-[130px] rounded-lg shimmer-bg" />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────

export default function HealthPage() {
  const [latest, setLatest] = useState(null)
  const [records, setRecords] = useState([])
  const [period, setPeriod] = useState('week')
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [latestRes, summaryRes, recordsRes] = await Promise.allSettled([
        healthService.getLatest(),
        healthService.getSummary(period),
        healthService.getRecords(),
      ])
      const realLatest = latestRes.status === 'fulfilled' ? latestRes.value : null
      const realSummary = summaryRes.status === 'fulfilled' ? summaryRes.value : null
      const realRecords = recordsRes.status === 'fulfilled' ? (recordsRes.value.results || []) : []

      setLatest(realLatest || DEMO_LATEST)
      setSummary(realSummary?.record_count ? realSummary : DEMO_SUMMARY)
      setRecords(realRecords.length > 0 ? realRecords : DEMO_RECORDS)
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    fetchData()
  }

  const chartRecords = [...records].reverse().slice(-7)
  const chartLabels = chartRecords.map((r) =>
    new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
  )
  const periods = ['today', 'week', 'month']

  if (isLoading) return <HealthSkeleton />

  return (
    <div className="space-y-4 animate-slide-up relative pb-10">
      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full 
                   shadow-xl flex items-center justify-center z-40 
                   hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-in"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Header + Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Health Metrics</h2>
        <button
          onClick={fetchData}
          className="w-8 h-8 flex items-center justify-center rounded-full
                     bg-surface-elevated hover:bg-border transition-all active:rotate-180 duration-500"
        >
          <RefreshIcon className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* Period Tabs */}
      <div className="flex p-1 bg-surface-elevated rounded-full border border-border/50">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300
              ${period === p
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Current Vitals Grid */}
      {latest ? (
        <div className="grid grid-cols-2 gap-2.5">
          <MetricPill
            icon={<HeartPulseIcon className="w-4 h-4 text-danger" />}
            color="bg-danger/10"
            label="Heart Rate"
            value={latest.heart_rate}
            unit="bpm"
          />
          <MetricPill
            icon={<DropletIcon className="w-4 h-4 text-blue-500" />}
            color="bg-blue-500/10"
            label="SpO₂"
            value={latest.spo2 ? parseFloat(latest.spo2).toFixed(0) : null}
            unit="%"
          />
          <MetricPill
            icon={<ActivityIcon className="w-4 h-4 text-accent" />}
            color="bg-accent/10"
            label="Steps"
            value={latest.steps}
            unit=""
          />
          <MetricPill
            icon={<MoonIcon className="w-4 h-4 text-primary-light" />}
            color="bg-primary-light/10"
            label="Sleep"
            value={latest.sleep_hours ? parseFloat(latest.sleep_hours).toFixed(1) : null}
            unit="hrs"
          />
        </div>
      ) : (
        <div className="bg-surface rounded-[var(--radius-lg)] p-8 text-center border-2 border-dashed border-border/50">
          <p className="text-sm text-text-muted">No measurements today.</p>
          <Button variant="outlined" size="sm" className="mt-4 rounded-xl" onClick={() => setIsAddModalOpen(true)}>
            Log Vitals Now
          </Button>
        </div>
      )}

      {/* Charts */}
      {chartRecords.length > 1 && (
        <div className="space-y-4">
          <Card icon={<HeartPulseIcon className="w-4 h-4 text-primary" />} iconBg="bg-primary/10" title="Heart Rate Trend">
            <MiniChart labels={chartLabels} data={chartRecords.map((r) => r.heart_rate)} color="#6C5CE7" unit="bpm" height={130} />
          </Card>
          <Card icon={<ActivityIcon className="w-4 h-4 text-accent" />} iconBg="bg-accent/10" title="Steps Trend">
            <MiniChart labels={chartLabels} data={chartRecords.map((r) => r.steps)} color="#00D2D3" unit="steps" height={130} />
          </Card>
        </div>
      )}

      {/* Recent Records List */}
      {records.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Activity Log</h3>
          <div className="space-y-2">
            {records.slice(0, 5).map((record, i) => (
              <div
                key={record.id}
                className="bg-surface rounded-2xl p-3 shadow-card
                           flex items-center justify-between border border-transparent hover:border-primary/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center">
                    <HeartPulseIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {record.heart_rate && <span className="text-sm font-bold text-text-primary">{record.heart_rate} bpm</span>}
                      {record.steps && <span className="text-[11px] text-text-muted">• {record.steps.toLocaleString()} steps</span>}
                    </div>
                    <p className="text-[10px] text-text-muted font-medium">{formatDate(record.timestamp)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider
                  ${record.source === 'manual' ? 'bg-surface-elevated text-text-muted' : 'bg-accent/10 text-accent'}`}>
                  {record.source === 'apple_watch' ? 'Apple' : record.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
