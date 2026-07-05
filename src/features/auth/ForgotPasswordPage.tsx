import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Mail, ArrowLeft } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await resetPassword(email)
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), #5856d6)',
              boxShadow: '0 8px 24px rgba(0,113,227,0.3)',
            }}
          >
            <Mail size={32} color="white" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            {sent ? 'Check your email' : 'Reset password'}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-2)',
              }}
            >
              {error && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--tier-warn) 12%, transparent)',
                    color: 'var(--tier-warn)',
                    border: '1px solid color-mix(in srgb, var(--tier-warn) 20%, transparent)',
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)'
                      e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-accent) 16%, transparent)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--color-accent) 30%, transparent)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 16px color-mix(in srgb, var(--color-accent) 40%, transparent)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px color-mix(in srgb, var(--color-accent) 30%, transparent)'
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>
        ) : null}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
