import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Gauge, Car, Wrench, WifiOff, Shield, Bell, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'

function RingGaugeDemo({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const features = [
    {
      icon: <Gauge size={24} />,
      title: 'Ring-Gauge Reminders',
      desc: 'Visual countdowns inspired by your actual dashboard gauges — know at a glance what needs attention.',
    },
    {
      icon: <Car size={24} />,
      title: 'Multi-Vehicle Garage',
      desc: 'Cars, motorcycles, scooters — track every vehicle in your fleet from a single dashboard.',
    },
    {
      icon: <Wrench size={24} />,
      title: 'Detailed Service Logs',
      desc: 'Log every service with exact part numbers, costs, receipts, and the shop that did the work.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Specs at Your Fingertips',
      desc: 'Oil type, spark plug codes, tire pressures — instant lookup when you\'re at the parts counter.',
    },
    {
      icon: <Bell size={24} />,
      title: 'Smart Reminders',
      desc: 'Mileage-based and time-based — whichever threshold hits first, just like the real maintenance schedule.',
    },
    {
      icon: <WifiOff size={24} />,
      title: 'Works Offline',
      desc: 'Installable as an app, loads instantly, and works fine with no signal in the garage.',
    },
  ]

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'var(--glass-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--tier-good))' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              Upkeep
            </Link>

            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--color-accent) 30%, transparent)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Get Started
              </Link>
            </div>

            <button
              className="sm:hidden p-2 rounded-xl transition-colors duration-150"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: 'var(--color-text-primary)' }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 sm:hidden"
          style={{
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <ThemeToggle />
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="text-xl font-medium transition-opacity duration-150 hover:opacity-70"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="text-xl font-semibold px-8 py-3 rounded-2xl text-white transition-all duration-200"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Get Started
          </Link>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              color: 'var(--color-accent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
            }}
          >
            <Gauge size={12} />
            Personal vehicle maintenance
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Know what's due{' '}
            <span style={{ color: 'var(--color-accent)' }}>before</span>{' '}
            it's overdue
          </h1>

          <p
            className="mt-5 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Track services, costs, and specs for every vehicle you own.
            Ring-gauge reminders tell you what needs attention at a glance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-semibold text-white transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-accent)',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--color-accent) 35%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 24px color-mix(in srgb, var(--color-accent) 45%, transparent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px color-mix(in srgb, var(--color-accent) 35%, transparent)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
            >
              Start Tracking
              <ChevronRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-medium transition-all duration-200"
              style={{
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-1)'
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Demo ring gauges */}
        <div className="flex items-center justify-center gap-6 mt-16 relative z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <RingGaugeDemo percent={78} color="var(--tier-good)" />
              <span
                className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ fontFamily: "'SF Mono', 'IBM Plex Mono', monospace" }}
              >
                78%
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Oil</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <RingGaugeDemo percent={32} color="var(--tier-ok)" />
              <span
                className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ fontFamily: "'SF Mono', 'IBM Plex Mono', monospace" }}
              >
                32%
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Brakes</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <RingGaugeDemo percent={12} color="var(--tier-warn)" />
              <span
                className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ fontFamily: "'SF Mono', 'IBM Plex Mono', monospace" }}
              >
                12%
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tires</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ letterSpacing: '-0.02em' }}
            >
              Everything your garage needs
            </h2>
            <p className="mt-3 text-base" style={{ color: 'var(--color-text-secondary)' }}>
              Built for the kind of owner who knows their torque specs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 transition-all duration-200 cursor-default"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-1)'
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold mb-1.5" style={{ letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl p-10 sm:p-14 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), #5856d6)',
            boxShadow: '0 20px 60px color-mix(in srgb, var(--color-accent) 30%, transparent)',
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, white, transparent 70%)' }}
          />
          <h2
            className="text-3xl sm:text-4xl font-bold text-white relative z-10"
            style={{ letterSpacing: '-0.02em' }}
          >
            Ready to take control of your maintenance?
          </h2>
          <p className="mt-3 text-base text-white/80 relative z-10">
            Free to use. Your data stays yours on your own Supabase backend.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-200 relative z-10"
            style={{
              backgroundColor: 'white',
              color: 'var(--color-accent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Get Started Free
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 sm:px-6"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--tier-good))' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            Upkeep
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            © {new Date().getFullYear()} Upkeep. Built for gearheads who wrench.
          </p>
        </div>
      </footer>
    </div>
  )
}
