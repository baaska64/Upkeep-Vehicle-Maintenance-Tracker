import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Car,
  ClipboardList,
  Bell,
  BookOpen,
  Fuel,
  Settings,
  MoreHorizontal,
  X,
  LogOut,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../features/auth/AuthProvider'

const primaryTabs = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/garage', icon: Car, label: 'Garage' },
  { to: '/app/services', icon: ClipboardList, label: 'Services' },
  { to: '/app/reminders', icon: Bell, label: 'Reminders' },
]

const overflowItems = [
  { to: '/app/specs', icon: BookOpen, label: 'Specs' },
  { to: '/app/fuel', icon: Fuel, label: 'Fuel Log' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export function BottomTabBar() {
  const [showMore, setShowMore] = useState(false)
  const { signOut } = useAuth()

  return (
    <>
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowMore(false)}
          />
          <div
            className="fixed bottom-16 left-3 right-3 z-50 rounded-2xl p-3 space-y-1 md:hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-3)',
            }}
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                More
              </span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-lg transition-colors duration-150"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            {overflowItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={({ isActive }) => ({
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                    : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                })}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="flex items-center gap-3 px-3 py-2">
              <ThemeToggle />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Theme</span>
            </div>

            <button
              onClick={() => { setShowMore(false); signOut() }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: 'var(--tier-warn)' }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
        style={{
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-around h-14 px-1">
          {primaryTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-200"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              })}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          ))}

          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-200"
            style={{ color: showMore ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}
