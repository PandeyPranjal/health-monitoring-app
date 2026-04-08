import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Header from './Header'
import BottomNav from './BottomNav'

const PAGE_TITLES = {
  '/': null,      // Greeting-based
  '/health': 'Health Metrics',
  '/alerts': 'Alerts',
  '/profile': 'Profile',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function MobileLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const firstName = user?.first_name || 'there'

  const isHome = location.pathname === '/'
  const title = isHome
    ? `${getGreeting()}, ${firstName} 👋`
    : PAGE_TITLES[location.pathname] || 'HealthPulse'
  const subtitle = isHome ? 'Your health overview' : null

  return (
    <div className="min-h-dvh flex flex-col bg-background transition-colors duration-300">
      <Header
        title={title}
        subtitle={subtitle}
      />

      {/* Scrollable content area with page transition */}
      <main
        key={location.pathname}
        className="flex-1 px-5 pt-3 pb-24 overflow-y-auto animate-fade-in"
      >
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
