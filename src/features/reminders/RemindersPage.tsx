import { useState, useMemo } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Check, Plus, Settings } from 'lucide-react'
import { useVehicles } from '../vehicles/api'
import { useServiceLogs, useServiceCategories } from '../services/api'
import { useUserIntervals } from '../services/useUserIntervals'
import { useVehicleStore } from '../../hooks/useVehicleStore'
import { getAllReminders } from '../../lib/reminders'
import { LogServiceForm } from '../services/LogServiceForm'
import { EditIntervalForm } from './EditIntervalForm'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { RingGauge } from '../../components/RingGauge'

export function RemindersPage() {
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles()
  const { data: categories, isLoading: categoriesLoading } = useServiceCategories()
  
  const { activeVehicleId } = useVehicleStore()
  const { data: logs, isLoading: logsLoading } = useServiceLogs(activeVehicleId || '')
  const { data: userIntervals } = useUserIntervals(activeVehicleId || '')
  
  const selectedVehicle = vehicles?.find(v => v.id === activeVehicleId)

  const [loggingCategoryId, setLoggingCategoryId] = useState<string | null>(null)
  const [editingIntervalCategory, setEditingIntervalCategory] = useState<any>(null)

  const reminders = useMemo(() => {
    if (!categories || !selectedVehicle || !logs) return []
    return getAllReminders(categories, selectedVehicle, logs, userIntervals)
  }, [categories, selectedVehicle, logs, userIntervals])

  if (vehiclesLoading || categoriesLoading || logsLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading reminders...</div>
  }

  if (!selectedVehicle) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">No Vehicle Selected</h2>
        <p className="text-[var(--color-text-secondary)]">Please select a vehicle in the Garage tab.</p>
      </div>
    )
  }

  const overdue = reminders.filter(r => r.tier === 'warn')
  const dueSoon = reminders.filter(r => r.tier === 'ok')
  const good = reminders.filter(r => r.tier === 'good' || r.tier === 'unknown')

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl headline tracking-tight mb-2">Maintenance Reminders</h1>
        <p className="text-[var(--color-text-secondary)]">
          Tasks due for {selectedVehicle.nickname || selectedVehicle.model || 'your vehicle'}.
        </p>
      </div>

      <div className="space-y-6">
        {/* Overdue Section */}
        {overdue.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--tier-warn)] mb-4 flex items-center gap-2">
              <AlertTriangle size={16} />
              Action Required ({overdue.length})
            </h2>
            <div className="grid gap-4">
              {overdue.map(reminder => (
                <Card key={reminder.category.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[color-mix(in_srgb,var(--tier-warn)_30%,transparent)] bg-[color-mix(in_srgb,var(--tier-warn)_5%,var(--color-surface))] group">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 scale-90 sm:scale-100">
                      <RingGauge tier={reminder.tier} percentageRemaining={reminder.percentageRemaining} size={50} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reminder.category.name}</h3>
                      <p className="text-sm font-medium text-[var(--tier-warn)] flex items-center gap-1.5 mt-0.5">
                        <AlertTriangle size={14} />
                        {reminder.dueText}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setEditingIntervalCategory(reminder.category)}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Customize Interval"
                    >
                      <Settings size={18} />
                    </button>
                    <Button variant="primary" className="flex-1 sm:w-auto shrink-0" onClick={() => setLoggingCategoryId(reminder.category.id)}>
                      <Check size={16} />
                      Log as Done
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Due Soon Section */}
        {dueSoon.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--tier-ok)] mb-4 mt-8 flex items-center gap-2">
              <Clock size={16} />
              Due Soon ({dueSoon.length})
            </h2>
            <div className="grid gap-4">
              {dueSoon.map(reminder => (
                <Card key={reminder.category.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[color-mix(in_srgb,var(--tier-ok)_30%,transparent)] bg-[color-mix(in_srgb,var(--tier-ok)_5%,var(--color-surface))] group">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 scale-90 sm:scale-100">
                      <RingGauge tier={reminder.tier} percentageRemaining={reminder.percentageRemaining} size={50} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reminder.category.name}</h3>
                      <p className="text-sm font-medium text-[var(--tier-ok)] flex items-center gap-1.5 mt-0.5">
                        <Clock size={14} />
                        {reminder.dueText}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setEditingIntervalCategory(reminder.category)}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Customize Interval"
                    >
                      <Settings size={18} />
                    </button>
                    <Button variant="secondary" className="flex-1 sm:w-auto shrink-0" onClick={() => setLoggingCategoryId(reminder.category.id)}>
                      Log Service
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Good Standing Section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--tier-good)] mb-4 mt-8 flex items-center gap-2">
            <CheckCircle2 size={16} />
            In Good Standing ({good.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {good.map(reminder => (
              <Card key={reminder.category.id} className="p-4 flex items-center gap-4 group">
                <div className="shrink-0 scale-75">
                  <RingGauge tier={reminder.tier} percentageRemaining={reminder.percentageRemaining} size={40} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--color-text-primary)] truncate">{reminder.category.name}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
                        {reminder.dueText}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingIntervalCategory(reminder.category)}
                      className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Customize Interval"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setLoggingCategoryId(reminder.category.id)}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
                  title="Log Service"
                >
                  <Plus size={18} />
                </button>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {loggingCategoryId && activeVehicleId && (
        <LogServiceForm 
          vehicleId={activeVehicleId} 
          initialCategoryId={loggingCategoryId}
          onClose={() => setLoggingCategoryId(null)} 
        />
      )}

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
