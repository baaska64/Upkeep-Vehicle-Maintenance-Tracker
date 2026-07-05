import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateFuelLog, useDeleteFuelLog } from './api'
import { Fuel, X, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import type { FuelLog } from '../../types/database'

const fuelSchema = z.object({
  date: z.string(),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  volume: z.number().min(0.01, 'Volume must be greater than 0'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  full_tank: z.boolean(),
})

type FuelFormValues = z.infer<typeof fuelSchema>

interface EditFuelLogFormProps {
  log: FuelLog
  onClose: () => void
}

export function EditFuelLogForm({ log, onClose }: EditFuelLogFormProps) {
  const updateLog = useUpdateFuelLog()
  const deleteLog = useDeleteFuelLog()

  const { register, handleSubmit, control, formState: { errors } } = useForm<FuelFormValues>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      date: log.date,
      mileage: log.mileage,
      volume: log.volume,
      cost: log.cost,
      full_tank: log.full_tank,
    }
  })

  const onSubmit = (data: FuelFormValues) => {
    updateLog.mutate({
      id: log.id,
      vehicleId: log.vehicle_id,
      updates: data,
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this fuel log?')) {
      deleteLog.mutate(log.id, {
        onSuccess: () => {
          onClose()
        }
      })
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
            <Fuel size={24} />
          </div>
          <h2 className="text-xl headline text-[var(--color-text-primary)]">Edit Fuel Log</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Date *</label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : new Date()}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                      field.onChange(localDate.toISOString().split('T')[0])
                    }
                  }}
                  dateFormat="MM/dd/yyyy"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  wrapperClassName="w-full"
                  showPopperArrow={false}
                />
              )}
            />
            {errors.date && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Odometer *</label>
            <input
              type="number"
              {...register('mileage', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-mono outline-none transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            {errors.mileage && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.mileage.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Volume *</label>
              <input
                type="number"
                step="0.01"
                {...register('volume', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {errors.volume && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.volume.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Total Cost *</label>
              <input
                type="number"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {errors.cost && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.cost.message}</p>}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)] transition-colors">
            <input
              type="checkbox"
              {...register('full_tank')}
              className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] bg-[var(--color-surface)]"
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Full Tank Fill-up</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Required for efficiency calculation</p>
            </div>
          </label>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] transition-colors"
            >
              <Trash2 size={16} />
              Delete Log
            </button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
              <Button variant="primary" type="submit" loading={updateLog.isPending}>Save Changes</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
