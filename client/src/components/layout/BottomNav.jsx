import { NavLink } from 'react-router-dom'
import { HomeIcon, HeartPulseIcon, AlertIcon, ProfileIcon } from '../icons'

const navItems = [
  { to: '/',             icon: HomeIcon,        label: 'Home'    },
  { to: '/health',       icon: HeartPulseIcon,  label: 'Health'  },
  { to: '/alerts',       icon: AlertIcon,       label: 'Alerts'  },
  { to: '/profile',      icon: ProfileIcon,     label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40
                 bg-surface/90 backdrop-blur-2xl border-t border-border
                 shadow-nav px-2 pb-[env(safe-area-inset-bottom,8px)]"
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
               rounded-2xl transition-all duration-200
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
                              rounded-xl transition-all duration-200
                              ${isActive
                                ? 'bg-primary/10 scale-105'
                                : 'group-hover:bg-surface-elevated'
                              }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200" />
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-all duration-200
                              ${isActive ? 'opacity-100' : 'opacity-60'}`}
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
