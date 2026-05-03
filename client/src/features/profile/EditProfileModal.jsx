import { useState, useEffect } from 'react'
import { Button } from '../../components'
import { XIcon } from '../../components/icons'
import authService from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, refreshProfile } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        dateOfBirth: user.date_of_birth || '',
      })
      setError(null)
    }
  }, [user, isOpen])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await authService.updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
      })
      await refreshProfile()
      onClose()
    } catch (err) {
      setError('Failed to update profile. Please check your inputs.')
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
            Edit Profile
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-elevated hover:bg-border transition-colors">
            <XIcon className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-bold rounded-xl animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">First Name</label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Last Name</label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Birthday</label>
            <input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl mt-4 font-bold relative overflow-hidden active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
