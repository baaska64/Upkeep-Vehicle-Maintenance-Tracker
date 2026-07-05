import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'transparent' }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
