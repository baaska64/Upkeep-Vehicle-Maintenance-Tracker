import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateVehicle } from './api'
import { Car, X } from 'lucide-react'
import { Button } from '../../components/Button'

const vehicleSchema = z.object({
  nickname: z.string().min(1, 'Nickname is required'),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().or(z.nan().transform(() => undefined)),
  vehicle_type: z.enum(['car', 'motorcycle', 'scooter', 'truck', 'other']),
  vin: z.string().optional(),
  current_mileage: z.number().min(0),
  mileage_unit: z.string(),
  fuel_type: z.string().optional(),
  acquired_date: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

interface AddVehicleFormProps {
  onClose: () => void
}

export function AddVehicleForm({ onClose }: AddVehicleFormProps) {
  const createVehicle = useCreateVehicle()
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_type: 'car',
      current_mileage: 0,
      mileage_unit: 'km',
      acquired_date: new Date().toISOString().split('T')[0]
    }
  })

  const onSubmit = (data: VehicleFormValues) => {
    createVehicle.mutate({
      ...data,
      year: typeof data.year === 'number' && !isNaN(data.year) ? data.year : null,
      photo_url: null,
      make: data.make || null,
      model: data.model || null,
      vin: data.vin || null,
      fuel_type: data.fuel_type || null,
      acquired_date: data.acquired_date || new Date().toISOString().split('T')[0],
      mileage_unit: data.mileage_unit,
      specs: {},
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 glass">
      <div 
        className="w-full max-w-lg rounded-2xl p-6 relative overflow-y-auto max-h-[90vh]"
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
            <Car size={24} />
          </div>
          <h2 className="text-xl headline">Add Vehicle</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Nickname *
            </label>
            <input
              {...register('nickname')}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              placeholder="e.g. Daily Driver"
            />
            {errors.nickname && <p className="text-xs mt-1" style={{ color: 'var(--tier-warn)' }}>{errors.nickname.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Make
              </label>
              <input
                {...register('make')}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                placeholder="Toyota"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Model
              </label>
              <input
                {...register('model')}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                placeholder="Camry"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Year
              </label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                placeholder="2020"
              />
              {errors.year && <p className="text-xs mt-1" style={{ color: 'var(--tier-warn)' }}>{errors.year.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Type
              </label>
              <select
                {...register('vehicle_type')}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 appearance-none"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                <option value="car" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Car</option>
                <option value="motorcycle" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Motorcycle</option>
                <option value="scooter" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Scooter</option>
                <option value="truck" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Truck</option>
                <option value="other" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Current Mileage</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  {...register('current_mileage', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                />
                <select
                  {...register('mileage_unit')}
                  className="w-24 px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                >
                  <option value="km" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>km</option>
                  <option value="mi" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>mi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Acquisition Date</label>
              <Controller
                control={control}
                name="acquired_date"
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
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                  />
                )}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit" loading={createVehicle.isPending}>Add Vehicle</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
