import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HeartPulseIcon } from '../../components/icons'

export default function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    phone_number: '',
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setIsSubmitting(true)

    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // Field-level errors from DRF
        const fieldErrors = {}
        let hasFieldErrors = false
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            fieldErrors[key] = value[0]
            hasFieldErrors = true
          } else if (typeof value === 'string') {
            fieldErrors[key] = value
            hasFieldErrors = true
          }
        }
        if (hasFieldErrors) {
          setErrors(fieldErrors)
        } else {
          setGeneralError(JSON.stringify(data))
          // setGeneralError('Registration failed. Please try again.')
        }
      } else {
        setGeneralError(err.response?.data?.detail || 'Registration failed')
        // setGeneralError('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (fieldName) =>
    `w-full px-4 py-3 bg-surface-elevated border
     rounded-[var(--radius-md)] text-sm text-text-primary
     placeholder:text-text-muted
     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
     transition-all duration-200
     ${errors[fieldName] ? 'border-danger' : 'border-border'}`

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 bg-background">
      {/* Logo + Branding */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark
                        flex items-center justify-center shadow-button">
          <HeartPulseIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
        <p className="text-sm text-text-muted mt-1">Start your health journey with HealthPulse</p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-sm animate-slide-up">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6 space-y-4"
        >
          {/* General Error */}
          {generalError && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm
                            rounded-[var(--radius-md)] px-4 py-3 animate-scale-in">
              {generalError}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="signup-first-name" className="text-sm font-medium text-text-secondary">
                First name
              </label>
              <input
                id="signup-first-name"
                name="first_name"
                type="text"
                required
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                className={inputClass('first_name')}
              />
              {errors.first_name && (
                <p className="text-xs text-danger">{errors.first_name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="signup-last-name" className="text-sm font-medium text-text-secondary">
                Last name
              </label>
              <input
                id="signup-last-name"
                name="last_name"
                type="text"
                required
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className={inputClass('last_name')}
              />
              {errors.last_name && (
                <p className="text-xs text-danger">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="signup-username" className="text-sm font-medium text-text-secondary">
              Username
            </label>
            <input
              id="signup-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={inputClass('username')}
            />
            {errors.username && (
              <p className="text-xs text-danger">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-sm font-medium text-text-secondary">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClass('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-sm font-medium text-text-secondary">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className={inputClass('password')}
            />
            {errors.password && (
              <p className="text-xs text-danger">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="signup-password-confirm" className="text-sm font-medium text-text-secondary">
              Confirm password
            </label>
            <input
              id="signup-password-confirm"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              required
              value={form.password_confirm}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={inputClass('password_confirm')}
            />
            {errors.password_confirm && (
              <p className="text-xs text-danger">{errors.password_confirm}</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="signup-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-white font-semibold text-sm
                       rounded-[var(--radius-md)] shadow-button
                       hover:bg-primary-dark active:scale-[0.97]
                       disabled:opacity-50 disabled:pointer-events-none
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            id="signup-login-link"
            className="text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
