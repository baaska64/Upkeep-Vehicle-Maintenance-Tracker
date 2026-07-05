import { useState } from 'react'
import { FileText, Plus, Search, Calendar, Tag, Pencil } from 'lucide-react'
import { useServiceLogs, type ServiceLogWithParts } from './api'
import { useVehicleStore } from '../../hooks/useVehicleStore'
import { useVehicles } from '../vehicles/api'
import { LogServiceForm } from './LogServiceForm'
import { EditServiceLogForm } from './EditServiceLogForm'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

export function ServiceLogsPage() {
  const { activeVehicleId } = useVehicleStore()
  const { data: vehicles } = useVehicles()
  const { data: logs, isLoading } = useServiceLogs(activeVehicleId)
  
  const [isLogging, setIsLogging] = useState(false)
  const [editingLog, setEditingLog] = useState<ServiceLogWithParts | null>(null)
  const [filterQuery, setFilterQuery] = useState('')

  const activeVehicle = vehicles?.find(v => v.id === activeVehicleId)

  if (!activeVehicleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
          <FileText size={32} />
        </div>
        <h2 className="text-xl headline text-[var(--color-text-primary)]">No Vehicle Selected</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-sm">
          Please select a vehicle from your Garage to view or add service logs.
        </p>
      </div>
    )
  }

  const filteredLogs = logs?.filter(log => {
    if (!filterQuery) return true
    const q = filterQuery.toLowerCase()
    return (
      log.category?.name.toLowerCase().includes(q) ||
      log.notes?.toLowerCase().includes(q) ||
      log.vt_service_log_parts?.some(p => p.part_name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl headline text-[var(--color-text-primary)]">Service History</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Logs for {activeVehicle?.nickname || 'Selected Vehicle'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search logs or parts..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-all focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
          <Button variant="primary" onClick={() => setIsLogging(true)} className="whitespace-nowrap">
            <Plus size={16} />
            Log Service
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
        </div>
      ) : filteredLogs?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <FileText size={48} className="text-[var(--color-border)] mb-4" />
          <h3 className="text-lg headline text-[var(--color-text-primary)]">No logs found</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {filterQuery ? "No records match your search." : "You haven't logged any services for this vehicle yet."}
          </p>
          {!filterQuery && (
            <Button variant="secondary" className="mt-6" onClick={() => setIsLogging(true)}>
              Log First Service
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs?.map(log => (
            <Card key={log.id} className="overflow-hidden group">
              <div className="p-5 sm:flex sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
                        <Tag size={12} />
                        {log.category?.name || 'Uncategorized'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                        <Calendar size={12} />
                        {new Date(log.service_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingLog(log)}
                        className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition-colors"
                        title="Edit Log"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-xl headline font-mono text-[var(--color-text-primary)]">
                      {log.mileage_at_service.toLocaleString()}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)] uppercase">
                      {activeVehicle?.mileage_unit || 'km'}
                    </span>
                  </div>

                  {log.notes && (
                    <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                      {log.notes}
                    </p>
                  )}
                  
                  {log.performed_by && (
                    <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      Performed by: <span className="font-medium text-[var(--color-text-primary)]">{log.performed_by}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 sm:mt-0 sm:text-right">
                  {log.cost > 0 && (
                    <div className="text-lg font-mono font-medium text-[var(--color-text-primary)]">
                      {log.currency} {log.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                  {log.receipt_url && (
                    <a
                      href={log.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      View Receipt
                    </a>
                  )}
                </div>
              </div>

              {log.vt_service_log_parts && log.vt_service_log_parts.length > 0 && (
                <div className="px-5 py-3 bg-[color-mix(in_srgb,var(--color-surface)_90%,var(--color-bg))] border-t border-[var(--color-border)]">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">Parts Replaced</h4>
                  <ul className="space-y-1">
                    {log.vt_service_log_parts.map(part => (
                      <li key={part.id} className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-primary)]">
                          {part.quantity}x {part.brand ? `${part.brand} ` : ''}{part.part_name}
                          {part.part_number && <span className="text-[var(--color-text-secondary)] ml-1 font-mono text-xs">#{part.part_number}</span>}
                        </span>
                        {part.unit_cost > 0 && (
                          <span className="text-[var(--color-text-secondary)] font-mono text-xs">
                            {log.currency} {(part.unit_cost * part.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isLogging && <LogServiceForm vehicleId={activeVehicleId} onClose={() => setIsLogging(false)} />}
      {editingLog && <EditServiceLogForm log={editingLog} onClose={() => setEditingLog(null)} />}
    </div>
  )
}
