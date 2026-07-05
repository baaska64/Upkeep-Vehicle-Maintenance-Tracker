import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateVehicle, useDeleteVehicle } from './api'
import { Pencil, X, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import type { Vehicle } from '../../types/database'

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

interface EditVehicleFormProps {
  vehicle: Vehicle
  onClose: () => void
}

export function EditVehicleForm({ vehicle, onClose }: EditVehicleFormProps) {
  const updateVehicle = useUpdateVehicle()
  const deleteVehicle = useDeleteVehicle()
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      nickname: vehicle.nickname,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || undefined,
      vehicle_type: vehicle.vehicle_type || 'car',
      vin: vehicle.vin || '',
      current_mileage: vehicle.current_mileage,
      mileage_unit: vehicle.mileage_unit,
      fuel_type: vehicle.fuel_type || '',
      acquired_date: vehicle.acquired_date ? vehicle.acquired_date.split('T')[0] : vehicle.created_at.split('T')[0],
    }
  })

  const onSubmit = (data: VehicleFormValues) => {
    updateVehicle.mutate({
      id: vehicle.id,
      ...data,
      year: typeof data.year === 'number' && !isNaN(data.year) ? data.year : null,
      make: data.make || null,
      model: data.model || null,
      vin: data.vin || null,
      current_mileage: data.current_mileage,
      mileage_unit: data.mileage_unit,
      fuel_type: data.fuel_type || null,
      acquired_date: data.acquired_date || null,
      specs: vehicle.specs || {},
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this vehicle? This will delete all associated logs.')) {
      deleteVehicle.mutate(vehicle.id, {
        onSuccess: () => {
          onClose()
        }
      })
    }
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
            <Pencil size={24} />
          </div>
          <h2 className="text-xl headline text-[var(--color-text-primary)]">Edit Vehicle</h2>
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
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
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
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
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
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
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
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
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
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Current Mileage
              </label>
              <input
                type="number"
                {...register('current_mileage', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 font-mono"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Unit
              </label>
              <select
                {...register('mileage_unit')}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 appearance-none"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="km" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Kilometers (km)</option>
                <option value="mi" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Miles (mi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Acquisition Date
            </label>
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
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              When did you acquire this vehicle? Used for time-based reminders.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] transition-colors"
            >
              <Trash2 size={16} />
              Delete Vehicle
            </button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
              <Button variant="primary" type="submit" loading={updateVehicle.isPending}>Save Changes</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
