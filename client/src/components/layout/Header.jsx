import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { BellIcon, SunIcon, MoonIcon } from '../icons'

export default function Header({ title = 'HealthPulse', subtitle = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl px-5 pt-4 pb-3
                        border-b border-border/50 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Left — Greeting / Title */}
        <div className="animate-fade-in">
          {subtitle && (
            <p className="text-[11px] font-semibold text-primary tracking-widest uppercase mb-0.5">
              {subtitle}
            </p>
          )}
          <h1 className="text-xl font-bold text-text-primary leading-tight">
            {title}
          </h1>
        </div>

        {/* Right — Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            id="header-theme-btn"
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-surface-elevated hover:bg-border transition-all duration-300
                       active:scale-90"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <SunIcon className="w-[18px] h-[18px] text-warning" />
            ) : (
              <MoonIcon className="w-[18px] h-[18px] text-text-secondary" />
            )}
          </button>

          {/* Notifications */}
          <button
            id="header-notifications-btn"
            onClick={() => navigate('/alerts')}
            className="relative w-10 h-10 flex items-center justify-center rounded-full
                       bg-surface-elevated hover:bg-border transition-all duration-300
                       active:scale-90"
            aria-label="Notifications"
          >
            <BellIcon className="w-[18px] h-[18px] text-text-secondary" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full
                             animate-pulse-glow" />
          </button>

          {/* Avatar */}
          <button
            id="header-profile-btn"
            onClick={() => navigate('/profile')}
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-gradient-to-br from-primary to-primary-dark
                       hover:shadow-button transition-all duration-300
                       active:scale-90"
            aria-label="Profile"
          >
            <span className="text-white text-sm font-bold">H</span>
          </button>
        </div>
      </div>
    </header>
  )
}
