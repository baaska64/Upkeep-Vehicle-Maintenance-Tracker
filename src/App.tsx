import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister } from './lib/query-client'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { LoginPage } from './features/auth/LoginPage'
import { SignUpPage } from './features/auth/SignUpPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { LandingPage } from './features/marketing/LandingPage'
import { AppShell } from './components/AppShell'
import { GaragePage } from './features/vehicles/GaragePage'
import { ServiceLogsPage } from './features/services/ServiceLogsPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { FuelPage } from './features/fuel/FuelPage'
import { SpecsPage } from './features/specs/SpecsPage'
import { RemindersPage } from './features/reminders/RemindersPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { ReloadPrompt } from './components/ReloadPrompt'

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <BrowserRouter>
        <AuthProvider>
          <ReloadPrompt />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="garage" element={<GaragePage />} />
              <Route path="services" element={<ServiceLogsPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="specs" element={<SpecsPage />} />
              <Route path="fuel" element={<FuelPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  )
}
