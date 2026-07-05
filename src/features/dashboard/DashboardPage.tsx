import { useState, useMemo } from 'react'
import { AlertTriangle, Plus, LayoutDashboard, Car, Settings } from 'lucide-react'
import { useVehicles } from '../vehicles/api'
import { useServiceCategories, useServiceLogs } from '../services/api'
import { useUserIntervals } from '../services/useUserIntervals'
import { useVehicleStore } from '../../hooks/useVehicleStore'
import { getAllReminders } from '../../lib/reminders'
import { ManageCategoriesForm } from '../services/ManageCategoriesForm'
import { EditIntervalForm } from '../reminders/EditIntervalForm'
import { RingGauge } from '../../components/RingGauge'
import { Card } from '../../components/Card'
import { CostAnalytics } from './CostAnalytics'

export function DashboardPage() {
  const { activeVehicleId } = useVehicleStore()
  const [isManagingCategories, setIsManagingCategories] = useState(false)
  const [editingIntervalCategory, setEditingIntervalCategory] = useState<any>(null)
  
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles()
  const { data: categories, isLoading: categoriesLoading } = useServiceCategories()
  const { data: logs, isLoading: logsLoading } = useServiceLogs(activeVehicleId)
  const { data: userIntervals } = useUserIntervals(activeVehicleId)

  const activeVehicle = vehicles?.find(v => v.id === activeVehicleId)

  const reminders = useMemo(() => {
    if (!activeVehicle || !categories || !logs) return []
    return getAllReminders(categories, activeVehicle, logs, userIntervals)
  }, [activeVehicle, categories, logs, userIntervals])

  const overdueCount = reminders.filter(r => r.isOverdue).length

  if (!activeVehicleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
          <LayoutDashboard size={32} />
        </div>
        <h2 className="text-xl headline text-[var(--color-text-primary)]">No Vehicle Selected</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-sm">
          Please select a vehicle from your Garage to view its dashboard.
        </p>
      </div>
    )
  }

  if (vehiclesLoading || categoriesLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl headline text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Overview for {activeVehicle?.nickname || 'Selected Vehicle'}
          </p>
        </div>
      </div>

      {/* Overdue Banner */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-2xl flex items-start sm:items-center gap-3" 
             style={{ backgroundColor: 'color-mix(in srgb, var(--tier-warn) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--tier-warn) 20%, transparent)' }}>
          <div className="text-[var(--tier-warn)] mt-0.5 sm:mt-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Maintenance Due</h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              You have {overdueCount} service{overdueCount !== 1 ? 's' : ''} that need attention.
            </p>
          </div>
        </div>
      )}

      {/* Vehicle Vital Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
            <Car size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Current Mileage</p>
            <p className="text-xl headline font-mono text-[var(--color-text-primary)] mt-0.5">
              {activeVehicle?.current_mileage.toLocaleString()} <span className="text-sm text-[var(--color-text-secondary)] uppercase">{activeVehicle?.mileage_unit}</span>
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Total Services</p>
            <p className="text-xl headline font-mono text-[var(--color-text-primary)] mt-0.5">
              {logs?.length || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Reminders Grid */}
      <div>
        <h3 className="text-lg headline text-[var(--color-text-primary)] mb-4">Maintenance Schedule</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {reminders.map((reminder) => (
            <Card key={reminder.category.id} className="p-4 flex flex-col items-center text-center">
              <div className="mb-4">
                <RingGauge 
                  percentageRemaining={reminder.percentageRemaining} 
                  tier={reminder.tier} 
                  size={80}
                  strokeWidth={8}
                />
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 text-center">
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
                    {reminder.category.name}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium" 
                     style={{ color: reminder.tier === 'warn' ? 'var(--tier-warn)' : undefined }}>
                    {reminder.dueText}
                  </p>
                </div>
                <button
                  onClick={() => setEditingIntervalCategory(reminder.category)}
                  className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  title="Customize Interval"
                >
                  <Settings size={14} />
                </button>
              </div>
            </Card>
          ))}
          <Card className="flex flex-col items-center justify-center p-6 text-center border-dashed cursor-pointer" onClick={() => setIsManagingCategories(true)}>
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg)] text-[var(--color-text-secondary)] flex items-center justify-center mb-3">
              <Plus size={24} />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Add Service</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Track something new</p>
          </Card>
        </div>
      </div>

      {/* Cost Analytics */}
      {logs && logs.length > 0 && (
        <CostAnalytics logs={logs} currency={logs[0]?.currency || 'PHP'} />
      )}

      {isManagingCategories && <ManageCategoriesForm onClose={() => setIsManagingCategories(false)} />}
      
      {editingIntervalCategory && activeVehicleId && (
        <EditIntervalForm
          vehicleId={activeVehicleId}
          category={editingIntervalCategory}
          currentInterval={userIntervals?.find(ui => ui.category_id === editingIntervalCategory.id)}
          onClose={() => setEditingIntervalCategory(null)}
        />
      )}
    </div>
  )
}
