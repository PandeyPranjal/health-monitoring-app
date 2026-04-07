import { BellIcon, UserCircleIcon } from '../icons'

export default function Header({ title = 'HealthPulse', subtitle = '' }) {
  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl px-5 pt-4 pb-3">
      <div className="flex items-center justify-between">
        {/* Left — Greeting / Title */}
        <div>
          {subtitle && (
            <p className="text-xs font-medium text-text-secondary tracking-wide uppercase">
              {subtitle}
            </p>
          )}
          <h1 className="text-xl font-bold text-text-primary leading-tight">
            {title}
          </h1>
        </div>

        {/* Right — Action icons */}
        <div className="flex items-center gap-2">
          <button
            id="header-notifications-btn"
            className="relative w-10 h-10 flex items-center justify-center rounded-full
                       bg-surface-elevated hover:bg-border transition-colors duration-200"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5 text-text-secondary" />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
          </button>

          <button
            id="header-profile-btn"
            className="w-10 h-10 flex items-center justify-center rounded-full
                       bg-primary/10 hover:bg-primary/20 transition-colors duration-200"
            aria-label="Profile"
          >
            <UserCircleIcon className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </header>
  )
}
