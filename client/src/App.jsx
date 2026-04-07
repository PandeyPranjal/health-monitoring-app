import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MobileLayout } from './components'
import DashboardPage from './features/dashboard'
import HealthPage from './features/health'
import AlertsPage from './features/alerts'
import ProfilePage from './features/profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MobileLayout title="Good evening 👋" subtitle="Welcome back" />}>
          <Route index element={<DashboardPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
