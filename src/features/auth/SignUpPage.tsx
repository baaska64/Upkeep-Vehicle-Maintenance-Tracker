import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react'

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--tier-good), #2ecc71)',
              boxShadow: '0 8px 24px rgba(52,199,89,0.3)',
            }}
          >
            <Mail size={32} color="white" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            Check your email
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>. Click the link to activate your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ backgroundColor: 'var(--color-accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--tier-good))',
              boxShadow: '0 8px 24px rgba(0,113,227,0.3)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            Create your account
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Start tracking your vehicle maintenance
          </p>
        </div>

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

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="signup-email"
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
                    id="signup-email"
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

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors duration-150 hover:opacity-70"
                    style={{ color: 'var(--color-text-secondary)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-confirm"
                  className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    id="signup-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
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
              onMouseDown={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
