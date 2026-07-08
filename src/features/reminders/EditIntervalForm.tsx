import { useState } from 'react'
import { Clock, X, RotateCcw, Ban } from 'lucide-react'
import { useUpsertInterval, useDeleteInterval } from '../services/useUserIntervals'
import { useUpdateCategory } from '../services/api'
import { Button } from '../../components/Button'
import type { ServiceCategory, UserServiceInterval } from '../../types/database'

interface EditIntervalFormProps {
  vehicleId: string
  category: ServiceCategory
  currentInterval?: UserServiceInterval
  onClose: () => void
}

export function EditIntervalForm({ vehicleId, category, currentInterval, onClose }: EditIntervalFormProps) {
  const upsertInterval = useUpsertInterval()
  const deleteInterval = useDeleteInterval()
  const updateCategory = useUpdateCategory()

  const [categoryName, setCategoryName] = useState(category.name)

  // Initialize state with current user interval if it exists, otherwise fall back to category defaults
  const [months, setMonths] = useState<string>(
    currentInterval?.custom_interval_months !== undefined && currentInterval?.custom_interval_months !== null 
      ? String(currentInterval.custom_interval_months) 
      : category.default_interval_months !== null ? String(category.default_interval_months) : ''
  )
  
  const [km, setKm] = useState<string>(
    currentInterval?.custom_interval_km !== undefined && currentInterval?.custom_interval_km !== null && currentInterval?.custom_interval_km !== -1
      ? String(currentInterval.custom_interval_km) 
      : category.default_interval_km !== null ? String(category.default_interval_km) : ''
  )

  const [isIgnored, setIsIgnored] = useState(
    currentInterval?.custom_interval_months === -1 && currentInterval?.custom_interval_km === -1
  )

  const handleSave = () => {
    let parsedMonths = months.trim() === '' ? null : parseInt(months, 10)
    let parsedKm = km.trim() === '' ? null : parseInt(km, 10)

    if (isIgnored) {
      parsedMonths = -1
      parsedKm = -1
    }

    if (category.user_id !== null && categoryName.trim() !== category.name) {
      updateCategory.mutate({ id: category.id, name: categoryName.trim() })
    }

    upsertInterval.mutate({
      id: currentInterval?.id,
      vehicle_id: vehicleId,
      category_id: category.id,
      custom_interval_months: parsedMonths,
      custom_interval_km: parsedKm,
    }, {
      onSuccess: () => onClose(),
      onError: (err: any) => alert(err.message)
    })
  }

  const handleReset = () => {
    if (currentInterval) {
      deleteInterval.mutate({ id: currentInterval.id, vehicleId }, {
        onSuccess: () => onClose()
      })
    } else {
      // If no custom interval exists, just close
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 glass">
      <div 
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-3)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}
          >
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-xl headline text-[var(--color-text-primary)] mb-1">Customize Service</h2>
            {category.user_id !== null ? (
              <input
                type="text"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full bg-transparent outline-none border-b border-[var(--color-accent)] text-sm font-medium text-[var(--color-accent)] focus:border-b-2 py-0.5"
                placeholder="Service Name"
              />
            ) : (
              <p className="text-sm font-medium text-[var(--color-accent)]">{category.name}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`space-y-4 transition-opacity ${isIgnored ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Time Interval (Months)</label>
              <input
                type="number"
                value={months}
                onChange={e => setMonths(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                placeholder="e.g. 6"
              />
              {category.default_interval_months !== null && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                  Default: {category.default_interval_months} months
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Distance Interval</label>
              <input
                type="number"
                value={km}
                onChange={e => setKm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                placeholder="e.g. 8000"
              />
              {category.default_interval_km !== null && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                  Default: {category.default_interval_km.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 mt-4 rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--tier-warn)] transition-colors">
            <input
              type="checkbox"
              checked={isIgnored}
              onChange={e => setIsIgnored(e.target.checked)}
              className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--tier-warn)] focus:ring-[var(--tier-warn)] bg-[var(--color-surface)]"
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                <Ban size={16} /> Not Applicable (N/A)
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Remove this service completely for this vehicle</p>
            </div>
          </label>

          <div className="pt-4 mt-2 border-t border-[var(--color-border)] flex flex-col gap-2">
            <Button variant="primary" fullWidth onClick={handleSave} loading={upsertInterval.isPending}>
              Save Custom Interval
            </Button>
            
            {currentInterval && (
              <button
                onClick={handleReset}
                disabled={deleteInterval.isPending}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <RotateCcw size={16} />
                Reset to Default
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
