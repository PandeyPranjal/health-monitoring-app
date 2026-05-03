import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import { Button, Card } from '../../components'
import {
  HeartPulse,
  Check,
  ChevronRight,
  UserCircle,
  TrendingDown,
  Activity,
  Moon,
  ShieldCheck,
  Wifi,
} from 'lucide-react'

// ── Constants ──────────────────────────────────────

const GOALS = [
  {
    id: 'weight_loss',
    label: 'Weight Loss',
    description: 'Burn fat and improve metabolic health.',
    icon: TrendingDown,
    color: 'bg-danger/10 text-danger',
  },
  {
    id: 'muscle_gain',
    label: 'Muscle Gain',
    description: 'Build strength and increase lean mass.',
    icon: Activity,
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'better_sleep',
    label: 'Better Sleep',
    description: 'Optimize recovery and mental clarity.',
    icon: Moon,
    color: 'bg-primary-light/10 text-primary-light',
  },
  {
    id: 'heart_health',
    label: 'Heart Health',
    description: 'Monitor vitals and reduce CV risk.',
    icon: HeartPulse,
    color: 'bg-accent/10 text-accent',
  },
]

// ── Components ──────────────────────────────────────

function GoalCard({ goal, isSelected, onSelect }) {
  const Icon = goal.icon
  return (
    <button
      onClick={() => onSelect(goal.id)}
      className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-300
        ${isSelected
          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
          : 'border-border bg-surface hover:border-primary/30 hover:shadow-sm'
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${goal.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-text-primary mb-1">{goal.label}</h4>
      <p className="text-[11px] text-text-muted leading-relaxed">{goal.description}</p>

      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center bounce-in">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}

// ── Main Page ──────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    dateOfBirth: user?.date_of_birth || '',
    gender: user?.gender || '',
    healthGoal: user?.health_goal || '',
  })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await authService.updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        health_goal: formData.healthGoal,
        onboarding_completed: true,
      })
      await refreshProfile()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Onboarding failed:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (step / 5) * 100

  return (
    <div className="flex flex-col min-h-[calc(100dvh-10rem)] px-6 pt-6 pb-28">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-elevated rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="animate-slide-up flex flex-col flex-1 h-full">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-3xl 
                            flex items-center justify-center shadow-lg mb-8 mx-auto bounce-in">
              <HeartPulse className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary text-center mb-4">
              Welcome to <span className="text-primary text-glow">HealthPulse</span>
            </h1>
            <p className="text-sm text-text-muted text-center mb-12 leading-relaxed">
              We&apos;re excited to help you take control of your health.
              Let&apos;s set up your profile to give you personalized insights.
            </p>
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
                <ShieldCheck className="w-5 h-5 text-success" />
                <p className="text-[11px] text-text-secondary">Your data is encrypted and secure.</p>
              </div>
              <Button onClick={nextStep} className="w-full py-4 text-base rounded-2xl shadow-button">
                Let&apos;s Get Started
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="animate-slide-up space-y-6">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Basic Profile</h2>
              <p className="text-sm text-text-muted">Tell us a bit more about yourself.</p>
            </header>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
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
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {['M', 'F', 'O'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all
                        ${formData.gender === g
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-surface text-text-secondary'}`}
                    >
                      {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 flex gap-3">
              <Button variant="outlined" onClick={prevStep} className="flex-1 rounded-2xl">Back</Button>
              <Button
                onClick={nextStep}
                disabled={!formData.firstName || !formData.dateOfBirth || !formData.gender}
                className="flex-[2] rounded-2xl shadow-button"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Health Goals */}
        {step === 3 && (
          <div className="animate-slide-up space-y-6">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Your Goal</h2>
              <p className="text-sm text-text-muted">What do you want to achieve with HealthPulse?</p>
            </header>

            <div className="grid grid-cols-1 gap-3">
              {GOALS.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isSelected={formData.healthGoal === goal.id}
                  onSelect={(id) => setFormData({ ...formData, healthGoal: id })}
                />
              ))}
            </div>

            <div className="pt-8 flex gap-3">
              <Button variant="outlined" onClick={prevStep} className="flex-1 rounded-2xl">Back</Button>
              <Button
                onClick={nextStep}
                disabled={!formData.healthGoal}
                className="flex-[2] rounded-2xl shadow-button"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Device Sync */}
        {step === 4 && (
          <div className="animate-slide-up flex flex-col flex-1 h-full">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Sync Wearable</h2>
              <p className="text-sm text-text-muted">Connect your smartwatch to automatically log vitals and health data.</p>
            </header>

            <div className="space-y-4">
              <button
                onClick={nextStep}
                className="w-full flex items-center justify-between p-5 bg-surface border-2 border-border hover:border-accent hover:bg-accent/5 rounded-2xl transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center pointer-events-none">
                    <Activity className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-text-primary">Fitbit</h3>
                    <p className="text-xs text-text-muted">Setup automatically</p>
                  </div>
                </div>
                <Wifi className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-8 pb-4 text-center">
              <button
                onClick={nextStep}
                className="w-full py-4 text-xs font-bold text-text-muted hover:text-text-primary transition-colors underline-offset-4 hover:underline"
              >
                I don't have a device (Skip)
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Confirmation */}
        {step === 5 && (
          <div className="animate-slide-up flex flex-col flex-1 h-full text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">You&apos;re All Set!</h2>
            <p className="text-sm text-text-muted mb-8 px-4 leading-relaxed">
              Thanks {formData.firstName}! Your personalized dashboard is ready.
              Let&apos;s start tracking your health.
            </p>

            <Card className="mb-12 border-primary/20 bg-primary/5 p-4 text-left">
              <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-3">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Goal</span>
                  <span className="font-bold text-text-primary">
                    {GOALS.find(g => g.id === formData.healthGoal)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Profile</span>
                  <span className="font-bold text-text-primary">
                    {formData.gender === 'M' ? 'Male' : 'Female'}, {new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()} years
                  </span>
                </div>
              </div>
            </Card>

            <div className="mt-auto">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl shadow-button relative overflow-hidden"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Enter Dashboard'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────
