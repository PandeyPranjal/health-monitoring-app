import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { MobileLayout } from './components'
import { LoginPage, SignupPage } from './features/auth'
import DashboardPage from './features/dashboard'
import HealthPage from './features/health'
import { AppointmentsPage } from './features/appointments'
import { OnboardingPage } from './features/onboarding'
import AlertsPage from './features/alerts'
import ProfilePage from './features/profile'
import ErrorBoundary from './components/ErrorBoundary'
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <MobileLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="/health" element={<HealthPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
