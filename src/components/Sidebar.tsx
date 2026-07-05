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
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../features/auth/AuthProvider'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/garage', icon: Car, label: 'Garage' },
  { to: '/app/services', icon: ClipboardList, label: 'Service Logs' },
  { to: '/app/reminders', icon: Bell, label: 'Reminders' },
  { to: '/app/specs', icon: BookOpen, label: 'Specs' },
  { to: '/app/fuel', icon: Fuel, label: 'Fuel Log' },
]

const bottomItems = [
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { signOut, user } = useAuth()

  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-out z-30"
      style={{
        width: collapsed ? '68px' : '240px',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-center gap-2.5 px-4 h-14 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--tier-good))' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-bold text-base" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Upkeep
          </span>
        )}
      </div>

      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive ? '' : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                : 'transparent',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            })}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-2.5 pb-2 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={({ isActive }) => ({
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                : 'transparent',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            })}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <div className="flex items-center gap-2 px-3 py-1">
          <ThemeToggle />
        </div>

        {!collapsed && user && (
          <div className="px-3 pt-1">
            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {user.email}
            </p>
          </div>
        )}

        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: 'var(--tier-warn)' }}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
