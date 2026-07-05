import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomTabBar } from './BottomTabBar'
import { VehicleSelector } from './VehicleSelector'
import { OnboardingWizard } from './OnboardingWizard'

export function AppShell() {
  const location = useLocation()
  const isGaragePage = location.pathname.includes('/garage')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const isComplete = localStorage.getItem('upkeep-onboarding-complete')
    if (!isComplete) {
      setShowOnboarding(true)
    }
  }, [])

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}
      <Sidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {!isGaragePage && <VehicleSelector />}
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
    </div>
  )
}
