import { useState } from 'react'
import healthService from '../../services/healthService'
import { Button } from '../../components'
import { XIcon, HeartPulseIcon, ActivityIcon, MoonIcon, DropletIcon } from '../../components/icons'

export default function AddRecordModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    heart_rate: '',
    steps: '',
    sleep_hours: '',
    spo2: '',
    systolic_bp: '',
    diastolic_bp: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Clean up empty fields
    const data = {}
    Object.keys(form).forEach(key => {
      if (form[key] !== '') data[key] = parseFloat(form[key])
    })

    if (Object.keys(data).length === 0) {
      setError('Please fill in at least one metric.')
      setIsSubmitting(false)
      return
    }

    try {
      await healthService.addRecord({ ...data, source: 'manual' })
      onSuccess()
    } catch (err) {
      setError('Failed to save record. Check your inputs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-0 sm:items-center sm:px-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-surface rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] shadow-2xl animate-slide-up p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            Log Vitals
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-elevated">
            <XIcon className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1.5">
                <HeartPulseIcon className="w-3 h-3 text-danger" /> Heart Rate
              </label>
              <input
                name="heart_rate"
                type="number"
                placeholder="bpm"
                value={form.heart_rate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Steps */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1.5">
                <ActivityIcon className="w-3 h-3 text-accent" /> Steps
              </label>
              <input
                name="steps"
                type="number"
                placeholder="count"
                value={form.steps}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Sleep */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1.5">
                <MoonIcon className="w-3 h-3 text-primary-light" /> Sleep
              </label>
              <input
                name="sleep_hours"
                type="number"
                step="0.1"
                placeholder="hours"
                value={form.sleep_hours}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* SpO2 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1.5">
                <DropletIcon className="w-3 h-3 text-blue-500" /> SpO2
              </label>
              <input
                name="spo2"
                type="number"
                placeholder="%"
                value={form.spo2}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 mt-2">
             {/* BP Systolic */}
             <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase">Systolic BP</label>
              <input
                name="systolic_bp"
                type="number"
                placeholder="mmHg"
                value={form.systolic_bp}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm"
              />
            </div>
             {/* BP Diastolic */}
             <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase">Diastolic BP</label>
              <input
                name="diastolic_bp"
                type="number"
                placeholder="mmHg"
                value={form.diastolic_bp}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl mt-4 font-bold"
          >
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </Button>
        </form>
      </div>
    </div>
  )
}
