import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFuelLog } from './api'
import { Fuel, X } from 'lucide-react'
import { Button } from '../../components/Button'

const fuelLogSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  mileage: z.number().min(0, 'Mileage must be positive'),
  volume: z.number().min(0.01, 'Volume must be greater than 0'),
  cost: z.number().min(0, 'Cost must be positive'),
  full_tank: z.boolean(),
})

type FuelLogFormValues = z.infer<typeof fuelLogSchema>

interface LogFuelFormProps {
  vehicleId: string
  onClose: () => void
}

export function LogFuelForm({ vehicleId, onClose }: LogFuelFormProps) {
  const createFuelLog = useCreateFuelLog()

  const { register, handleSubmit, control, formState: { errors } } = useForm<FuelLogFormValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      full_tank: true,
    }
  })

  const onSubmit = (data: FuelLogFormValues) => {
    createFuelLog.mutate({
      ...data,
      vehicle_id: vehicleId,
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 glass">
      <div 
        className="w-full max-w-md rounded-2xl p-6 relative overflow-y-auto max-h-[90vh]"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-3)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              color: 'var(--color-accent)',
            }}
          >
            <Fuel size={24} />
          </div>
          <h2 className="text-xl headline">Log Fuel</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
              Date *
            </label>
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
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)]"
                  wrapperClassName="w-full"
                  showPopperArrow={false}
                />
              )}
            />
            {errors.date && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
              Odometer Reading *
            </label>
            <input
              type="number"
              {...register('mileage', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-mono"
            />
            {errors.mileage && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.mileage.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Volume (L/gal) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('volume', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-mono"
              />
              {errors.volume && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.volume.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Total Cost *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-mono"
              />
              {errors.cost && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.cost.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="full_tank"
              {...register('full_tank')}
              className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
            <label htmlFor="full_tank" className="text-sm font-medium text-[var(--color-text-primary)]">
              This was a full tank
            </label>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] pl-8">
            Only full tanks are used to calculate fuel efficiency.
          </p>

          <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit" loading={createFuelLog.isPending}>Save Log</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
