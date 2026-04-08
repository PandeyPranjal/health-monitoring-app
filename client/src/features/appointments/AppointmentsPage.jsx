import { useState, useEffect, useCallback } from 'react'
import appointmentService from '../../services/appointmentService'
import { Card, Button, Badge } from '../../components'
import {
  CalendarIcon, ClockIcon, UserCircleIcon,
  ChevronRightIcon, CheckIcon, StarIcon,
} from '../../components/icons'
import BookingModal from './BookingModal'

// ── Helpers ──────────────────────────────────────────

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

// ── Skeletons ──────────────────────────────────────

function DoctorSkeleton() {
  return (
    <div className="bg-surface rounded-[var(--radius-lg)] p-4 shadow-card flex gap-4">
      <div className="w-16 h-16 rounded-2xl shimmer-bg shrink-0" />
      <div className="flex-1 space-y-2 mt-1">
        <div className="w-1/2 h-4 rounded shimmer-bg" />
        <div className="w-1/3 h-3 rounded shimmer-bg" />
        <div className="w-1/4 h-3 rounded shimmer-bg" />
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState([])
  const [myAppointments, setMyAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('find') // 'find' | 'my'
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [docs, appts] = await Promise.all([
        appointmentService.getDoctors(),
        appointmentService.getAppointments(),
      ])
      setDoctors(docs.results || [])
      setMyAppointments(appts.results || [])
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor)
    setIsBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    setIsBookingModalOpen(false)
    fetchData() // Refresh my appointments
    setActiveTab('my')
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 h-9 rounded-full shimmer-bg" />
          <div className="flex-1 h-9 rounded-full shimmer-bg" />
        </div>
        {[...Array(3)].map((_, i) => <DoctorSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Tabs */}
      <div className="flex p-1 bg-surface-elevated rounded-full border border-border/50">
        <button
          onClick={() => setActiveTab('find')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-300
            ${activeTab === 'find' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
        >
          Find Doctors
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-300
            ${activeTab === 'my' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
        >
          My Bookings
          {myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-primary/10 text-[9px] rounded-full">
              {myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length}
            </span>
          )}
        </button>
      </div>

      {/* Find Doctors View */}
      {activeTab === 'find' && (
        <div className="space-y-3">
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-text-muted">No doctors found.</p>
            </div>
          ) : (
            doctors.map((doctor, i) => (
              <div
                key={doctor.id}
                className="bg-surface rounded-[var(--radius-xl)] p-4 shadow-card
                           flex gap-4 border border-transparent hover:border-primary/20
                           transition-all duration-300 slide-in-right"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Doctor Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                  <UserCircleIcon className="w-10 h-10 text-primary/40" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-text-primary mb-0.5 truncate">
                      Dr. {doctor.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 bg-warning/10 px-1.5 py-0.5 rounded-lg">
                      <StarIcon className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-[10px] font-bold text-yellow-700">{doctor.rating || '5.0'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-primary/80 uppercase tracking-wider">
                    {doctor.specialization}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1 line-clamp-1 italic">
                    {doctor.bio || "Specialist in wellness and preventive care."}
                  </p>

                  <div className="flex mt-3 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-4 py-1.5 text-[11px] font-bold h-auto rounded-xl"
                      onClick={() => handleBookClick(doctor)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Bookings View */}
      {activeTab === 'my' && (
        <div className="space-y-3">
          {myAppointments.length === 0 ? (
            <div className="text-center py-20 animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-1">No bookings found</h3>
              <p className="text-sm text-text-muted max-w-[200px] mx-auto">
                You haven't booked any appointments yet.
              </p>
              <Button
                variant="outlined"
                className="mt-6 rounded-xl text-xs"
                onClick={() => setActiveTab('find')}
              >
                Find a Doctor
              </Button>
            </div>
          ) : (
            myAppointments.map((appt, i) => (
              <div
                key={appt.id}
                className="bg-surface rounded-[var(--radius-xl)] p-4 shadow-card
                           border border-border/40 slide-in-right"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">
                      Appointment with
                    </h4>
                    <p className="text-sm font-bold text-text-primary">
                      Dr. {appt.doctor_name}
                    </p>
                  </div>
                  <Badge variant={
                    appt.status === 'confirmed' ? 'success' :
                    appt.status === 'pending' ? 'warning' :
                    appt.status === 'completed' ? 'default' : 'danger'
                  }>
                    {appt.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 py-3 border-y border-border/50">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-text-secondary">
                      {formatDate(appt.time_slot_details.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-text-secondary">
                      {appt.time_slot_details.start_time.slice(0, 5)} - {appt.time_slot_details.end_time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {appt.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <Button variant="danger-ghost" size="sm" className="flex-1 py-1.5 text-[11px] h-auto">
                      Cancel
                    </Button>
                    <Button variant="outlined" size="sm" className="flex-1 py-1.5 text-[11px] h-auto">
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          doctor={selectedDoctor}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}

// Missing StarIcon in icon index
function StarIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
