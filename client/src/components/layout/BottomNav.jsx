import { NavLink } from 'react-router-dom'
import { HomeIcon, HeartPulseIcon, AlertIcon, ProfileIcon, CalendarIcon } from '../icons'

const navItems = [
  { to: '/',             icon: HomeIcon,        label: 'Home'    },
  { to: '/health',       icon: HeartPulseIcon,  label: 'Health'  },
  { to: '/appointments', icon: CalendarIcon,    label: 'Book'    },
  { to: '/alerts',       icon: AlertIcon,       label: 'Alerts'  },
  { to: '/profile',      icon: ProfileIcon,     label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40
                 bg-surface/85 backdrop-blur-2xl border-t border-border/50
                 shadow-nav px-2 pb-[env(safe-area-inset-bottom,8px)]
                 transition-colors duration-300"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            id={`nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `group flex flex-col items-center justify-center gap-0.5 w-16 h-14
               rounded-2xl transition-all duration-300
               ${isActive
                 ? 'text-primary'
                 : 'text-text-muted hover:text-text-secondary'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative flex items-center justify-center w-10 h-8
                              rounded-xl transition-all duration-300
                              ${isActive
                                ? 'bg-primary/12 scale-110'
                                : 'group-hover:bg-surface-elevated scale-100'
                              }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300
                    ${isActive ? 'stroke-[2.2]' : ''}`} />
                  {/* Active dot indicator */}
                  {isActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary bounce-in" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-all duration-300
                              ${isActive ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-0.5'}`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
