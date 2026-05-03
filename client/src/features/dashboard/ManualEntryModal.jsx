import { useState } from 'react'
import { Button } from '../../components'
import { XIcon, HeartPulseIcon } from '../../components/icons'
import healthService from '../../services/healthService'

export default function ManualEntryModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    heart_rate: '',
    steps: '',
    sleep_hours: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Clean payload (remove empty strings to satisfy DRF validators)
    const payload = { source: 'manual' }
    if (formData.heart_rate) payload.heart_rate = parseInt(formData.heart_rate, 10)
    if (formData.steps) payload.steps = parseInt(formData.steps, 10)
    if (formData.sleep_hours) payload.sleep_hours = parseFloat(formData.sleep_hours)

    if (Object.keys(payload).length === 1) {
      setError("Please fill at least one metric to log.")
      setIsSubmitting(false)
      return
    }

    try {
      await healthService.createRecord(payload)
      onSuccess()
      setFormData({ heart_rate: '', steps: '', sleep_hours: '' }) // reset
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save health data. Please check inputs.")
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
            <HeartPulseIcon className="w-5 h-5 text-primary" />
            Quick Log
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-elevated hover:bg-border transition-colors">
            <XIcon className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-[11px] font-bold rounded-xl animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Heart Rate</label>
              <input
                name="heart_rate"
                type="number"
                placeholder="e.g. 72"
                min="30" max="220"
                value={formData.heart_rate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Steps</label>
              <input
                name="steps"
                type="number"
                placeholder="e.g. 8500"
                min="0"
                value={formData.steps}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Sleep (Hours)</label>
            <input
              name="sleep_hours"
              type="number"
              step="0.5"
              min="0" max="24"
              placeholder="e.g. 7.5"
              value={formData.sleep_hours}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <p className="text-[10px] text-text-muted italic pt-2">
            Leave fields blank if you aren't logging them.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl mt-4 font-bold relative overflow-hidden active:scale-[0.98] shadow-button"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Health Data'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
