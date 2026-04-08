import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HeartPulseIcon } from '../../components/icons'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
      navigate('/', { replace: true })
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-background">
      {/* Logo + Branding */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark
                        flex items-center justify-center shadow-button">
          <HeartPulseIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="text-sm text-text-muted mt-1">Sign in to your HealthPulse account</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm animate-slide-up">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-[var(--radius-xl)] shadow-card p-6 space-y-4"
        >
          {/* Error Alert */}
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm
                            rounded-[var(--radius-md)] px-4 py-3 animate-scale-in">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="login-username" className="text-sm font-medium text-text-secondary">
              Username
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-surface-elevated border border-border
                         rounded-[var(--radius-md)] text-sm text-text-primary
                         placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-text-secondary">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-surface-elevated border border-border
                         rounded-[var(--radius-md)] text-sm text-text-primary
                         placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            id="login-signup-link"
            className="text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
