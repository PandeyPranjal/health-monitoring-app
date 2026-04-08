import { useState, useMemo } from 'react'
import appointmentService from '../../services/appointmentService'
import { Button, Badge } from '../../components'
import { CalendarIcon, ClockIcon, XIcon, CheckIcon } from '../../components/icons'

export default function BookingModal({ isOpen, onClose, doctor, onSuccess }) {
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Group slots by date
  const groupedSlots = useMemo(() => {
    if (!doctor?.available_slots) return {}
    return doctor.available_slots.reduce((acc, slot) => {
      const date = slot.date
      if (!acc[date]) acc[date] = []
      acc[date].push(slot)
      return acc
    }, {})
  }, [doctor])

  const dates = Object.keys(groupedSlots).sort()
  const [activeDate, setActiveDate] = useState(dates[0] || null)

  const handleBook = async () => {
    if (!selectedSlotId) return
    setIsSubmitting(true)
    setError('')
    try {
      await appointmentService.book({
        doctor: doctor.id,
        time_slot: selectedSlotId,
        notes: "Online consultation",
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Booking failed. Slot might have been taken.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-0 sm:items-center sm:px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-surface rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]
                      shadow-2xl animate-slide-up p-6 pb-8 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Book Appointment</h3>
            <p className="text-xs text-text-muted">with Dr. {doctor.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-elevated hover:bg-border transition-colors"
          >
            <XIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-[11px] font-semibold rounded-xl animate-scale-in">
            {error}
          </div>
        )}

        {/* Date Selection */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3 block">
            Select Date
          </label>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((date) => {
              const d = new Date(date)
              const dayName = d.toLocaleDateString([], { weekday: 'short' })
              const dayNum = d.getDate()
              const isActive = activeDate === date

              return (
                <button
                  key={date}
                  onClick={() => {
                    setActiveDate(date)
                    setSelectedSlotId(null)
                  }}
                  className={`flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-2xl border transition-all duration-300
                    ${isActive
                      ? 'bg-primary border-primary text-white shadow-button scale-105'
                      : 'bg-surface border-border/60 text-text-secondary hover:border-primary/30'
                    }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-white/70' : 'text-text-muted'}`}>
                    {dayName}
                  </span>
                  <span className="text-lg font-bold mt-0.5">{dayNum}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-8">
          <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3 block">
            Available Slots
          </label>
          <div className="grid grid-cols-3 gap-2">
            {activeDate && groupedSlots[activeDate]?.map((slot) => {
              const isSelected = selectedSlotId === slot.id
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`py-2.5 px-1 rounded-xl border text-[11px] font-bold transition-all duration-200
                    ${isSelected
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface border-border text-text-secondary hover:border-primary/40'
                    }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              )
            })}
            {(!activeDate || !groupedSlots[activeDate]) && (
              <p className="col-span-3 text-center py-4 text-xs text-text-muted italic border border-dashed border-border rounded-xl">
                No slots available for this date.
              </p>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex gap-3">
          <Button
            variant="outlined"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBook}
            disabled={!selectedSlotId || isSubmitting}
            className="flex-2 rounded-xl h-12 relative overflow-hidden active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Booking...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
