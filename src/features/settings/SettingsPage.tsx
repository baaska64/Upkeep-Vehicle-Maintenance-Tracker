import { useState } from 'react'
import { Download, Moon, Sun, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { useVehicles } from '../vehicles/api'
import { useVehicleStore } from '../../hooks/useVehicleStore'
import { useServiceLogs } from '../services/api'
import { useFuelLogs } from '../fuel/api'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

export function SettingsPage() {
  const { user } = useAuth()
  const { data: vehicles } = useVehicles()
  
  // Quick theme toggle from localStorage (in a real app we'd use a robust theme context)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const { activeVehicleId } = useVehicleStore()
  const selectedVehicle = vehicles?.find(v => v.id === activeVehicleId)
  const { data: serviceLogs } = useServiceLogs(selectedVehicle?.id || '')
  const { data: fuelLogs } = useFuelLogs(selectedVehicle?.id || '')

  const [isExporting, setIsExporting] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const exportData = async () => {
    if (!selectedVehicle || !serviceLogs || !fuelLogs) return
    setIsExporting(true)

    try {
      // Create Service Logs CSV
      const serviceHeaders = ['Date', 'Category', 'Mileage', 'Cost', 'Currency', 'Performed By', 'Notes']
      const serviceRows = serviceLogs.map(log => [
        new Date(log.service_date).toLocaleDateString(),
        log.category?.name || 'Uncategorized',
        log.mileage_at_service.toString(),
        log.cost.toString(),
        log.currency,
        `"${log.performed_by || ''}"`,
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ])
      const serviceCsv = [serviceHeaders.join(','), ...serviceRows.map(r => r.join(','))].join('\n')

      // Create Fuel Logs CSV
      const fuelHeaders = ['Date', 'Mileage', 'Volume', 'Cost', 'Full Tank']
      const fuelRows = fuelLogs.map(log => [
        new Date(log.date).toLocaleDateString(),
        log.mileage.toString(),
        log.volume.toString(),
        log.cost.toString(),
        log.full_tank ? 'Yes' : 'No'
      ])
      const fuelCsv = [fuelHeaders.join(','), ...fuelRows.map(r => r.join(','))].join('\n')

      // Trigger downloads
      downloadBlob(serviceCsv, `${selectedVehicle.nickname || 'vehicle'}_service_logs.csv`)
      setTimeout(() => {
        downloadBlob(fuelCsv, `${selectedVehicle.nickname || 'vehicle'}_fuel_logs.csv`)
      }, 500)

    } finally {
      setIsExporting(false)
    }
  }

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('upkeep-theme', newTheme)
    // Force a re-render by dispatching a custom event if we had a ThemeProvider
    // For now, it will just change the CSS variables which updates the UI immediately
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl headline tracking-tight mb-2">Settings</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your account and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-4 ml-1">Account</h2>
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-2xl font-bold shadow-[var(--shadow-1)]">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-medium">{user?.email}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Logged in securely via Supabase</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sign Out</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">Log out of your account on this device.</p>
              </div>
              <Button variant="secondary" onClick={handleSignOut} className="text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] border-transparent">
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </section>

        {/* Data Export */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-4 ml-1">Data Backup</h2>
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Download size={18} className="text-[var(--color-accent)]" />
                  <h3 className="font-medium text-lg">Export Data</h3>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
                  Download all your service history and fuel logs as CSV files for your personal records or spreadsheet analysis.
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={exportData}
                disabled={!selectedVehicle || isExporting}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                {isExporting ? 'Exporting...' : 'Download CSV'}
              </Button>
            </div>
          </Card>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-4 ml-1">App Preferences</h2>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                  {isDark ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <h4 className="font-medium">Appearance</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">Toggle between light and dark mode.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={toggleTheme}>
                Switch to {isDark ? 'Light' : 'Dark'}
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
