import { useLocation } from 'react-router-dom'

const pageInfo: Record<string, { title: string; phase: string }> = {
  '/app/dashboard': { title: 'Dashboard', phase: 'Phase 3' },
  '/app/garage': { title: 'Garage', phase: 'Phase 2' },
  '/app/services': { title: 'Service Logs', phase: 'Phase 2' },
  '/app/reminders': { title: 'Reminders', phase: 'Phase 3' },
  '/app/specs': { title: 'Specs', phase: 'Phase 4' },
  '/app/fuel': { title: 'Fuel Log', phase: 'Phase 3' },
  '/app/settings': { title: 'Settings', phase: 'Phase 5' },
}

export function PlaceholderPage() {
  const location = useLocation()
  const info = pageInfo[location.pathname] || { title: 'Page', phase: 'a future phase' }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>

      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
      >
        {info.title}
      </h1>

      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Coming in {info.phase}
      </p>
    </div>
  )
}
