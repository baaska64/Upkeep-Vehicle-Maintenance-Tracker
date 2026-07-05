import { useState, useMemo } from 'react'
import { Fuel, Plus, Calendar, Trash2, Pencil } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { useFuelLogs, useDeleteFuelLog } from './api'
import { useVehicleStore } from '../../hooks/useVehicleStore'
import { useVehicles } from '../vehicles/api'
import { LogFuelForm } from './LogFuelForm'
import { EditFuelLogForm } from './EditFuelLogForm'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import type { FuelLog } from '../../types/database'

export function FuelPage() {
  const { activeVehicleId } = useVehicleStore()
  const { data: vehicles } = useVehicles()
  const { data: logs, isLoading } = useFuelLogs(activeVehicleId)
  const deleteFuelLog = useDeleteFuelLog()
  
  const [isLogging, setIsLogging] = useState(false)
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null)

  const activeVehicle = vehicles?.find(v => v.id === activeVehicleId)

  // Calculate efficiency data for the chart
  const efficiencyData = useMemo(() => {
    if (!logs || logs.length < 2) return []

    // Sort ascending for calculation
    const sortedLogs = [...logs].sort((a, b) => a.mileage - b.mileage)
    const data = []

    for (let i = 1; i < sortedLogs.length; i++) {
      const current = sortedLogs[i]
      const prev = sortedLogs[i - 1]

      if (current.full_tank && prev.full_tank) {
        const distance = current.mileage - prev.mileage
        const efficiency = distance / current.volume // e.g. km/L

        if (distance > 0) {
          data.push({
            date: current.date,
            displayDate: format(parseISO(current.date), 'MMM d'),
            efficiency: Number(efficiency.toFixed(2))
          })
        }
      }
    }

    return data
  }, [logs])

  if (!activeVehicleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
          <Fuel size={32} />
        </div>
        <h2 className="text-xl headline text-[var(--color-text-primary)]">No Vehicle Selected</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-sm">
          Please select a vehicle from your Garage to view fuel logs.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
      </div>
    )
  }

  const isKm = activeVehicle?.mileage_unit === 'km'
  const efficiencyUnit = isKm ? 'km/L' : 'mpg'

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl headline text-[var(--color-text-primary)]">Fuel Log</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Tracking for {activeVehicle?.nickname || 'Selected Vehicle'}
          </p>
        </div>
        
        <Button variant="primary" onClick={() => setIsLogging(true)}>
          <Plus size={16} />
          Log Fuel
        </Button>
      </div>

      {efficiencyData.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-4 flex items-center justify-between">
            <span>Fuel Efficiency ({efficiencyUnit})</span>
            {efficiencyData.length > 0 && (
              <span className="text-[var(--color-text-primary)] font-mono text-lg lowercase">
                {efficiencyData[efficiencyData.length - 1].efficiency} <span className="text-sm text-[var(--color-text-secondary)]">{efficiencyUnit}</span>
              </span>
            )}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} ${efficiencyUnit}`, 'Efficiency']}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-2)'
                  }}
                  itemStyle={{ color: 'var(--color-accent)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="var(--color-accent)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-surface)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {!logs || logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <Fuel size={48} className="text-[var(--color-border)] mb-4" />
          <h3 className="text-lg headline text-[var(--color-text-primary)]">No fuel logs</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-sm">
            Log your fill-ups to track your vehicle's fuel efficiency over time.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => setIsLogging(true)}>
            Log First Fill-up
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg headline text-[var(--color-text-primary)] mb-4 pt-4 border-t border-[var(--color-border)]">History</h3>
          {logs.map(log => (
            <Card key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--color-border)_20%,transparent)] flex items-center justify-center text-[var(--color-text-secondary)]">
                  <Fuel size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      <Calendar size={12} />
                      {format(parseISO(log.date), 'MMM d, yyyy')}
                    </span>
                    {!log.full_tank && (
                      <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] text-[var(--tier-warn)] text-[10px] font-bold uppercase tracking-wider">
                        Partial
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg headline font-mono text-[var(--color-text-primary)]">
                      {log.mileage.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)] uppercase">
                      {activeVehicle?.mileage_unit || 'km'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-[var(--color-text-primary)]">
                    {log.volume} {isKm ? 'L' : 'gal'}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {log.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} total
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingLog(log)}
                    className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this fuel log?')) {
                        deleteFuelLog.mutate(log.id)
                      }
                    }}
                    className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isLogging && <LogFuelForm vehicleId={activeVehicleId} onClose={() => setIsLogging(false)} />}
      {editingLog && <EditFuelLogForm log={editingLog} onClose={() => setEditingLog(null)} />}
    </div>
  )
}
