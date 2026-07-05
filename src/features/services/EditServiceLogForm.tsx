import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServiceCategories, useUpdateServiceLog, useDeleteServiceLog, type ServiceLogWithParts } from './api'
import { Wrench, X, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'

const editServiceSchema = z.object({
  service_date: z.string(),
  mileage_at_service: z.number().min(0, 'Mileage cannot be negative'),
  category_id: z.string().min(1, 'Please select a category'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  currency: z.string().min(1, 'Currency is required'),
  performed_by: z.string().optional(),
  notes: z.string().optional(),
})

type EditServiceFormValues = z.infer<typeof editServiceSchema>

interface EditServiceLogFormProps {
  log: ServiceLogWithParts
  onClose: () => void
}

export function EditServiceLogForm({ log, onClose }: EditServiceLogFormProps) {
  const { data: categories } = useServiceCategories()
  const updateLog = useUpdateServiceLog()
  const deleteLog = useDeleteServiceLog()

  const { register, handleSubmit, control, formState: { errors } } = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      service_date: log.service_date,
      mileage_at_service: log.mileage_at_service,
      category_id: log.category_id,
      cost: log.cost,
      currency: log.currency,
      performed_by: log.performed_by || '',
      notes: log.notes || '',
    }
  })

  const onSubmit = (data: EditServiceFormValues) => {
    updateLog.mutate({
      id: log.id,
      vehicleId: log.vehicle_id,
      updates: {
        ...data,
        performed_by: data.performed_by || null,
        notes: data.notes || null,
      }
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this service log? This action cannot be undone.')) {
      deleteLog.mutate({ id: log.id, vehicleId: log.vehicle_id }, {
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
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-text-primary)_5%,transparent)]"
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
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-xl headline text-[var(--color-text-primary)]">Edit Service Log</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Update details for this maintenance record</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Date *
              </label>
              <Controller
                control={control}
                name="service_date"
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
              {errors.service_date && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.service_date.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Mileage *
              </label>
              <input
                type="number"
                {...register('mileage_at_service', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {errors.mileage_at_service && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.mileage_at_service.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
              Service Category *
            </label>
            <select
              {...register('category_id')}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)] appearance-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              <option value="" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Select category...</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.category_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Cost *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {errors.cost && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.cost.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Currency
              </label>
              <input
                {...register('currency')}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
              Performed By
            </label>
            <input
              {...register('performed_by')}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="e.g. Dealership, Local Shop, Self"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)] resize-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="Additional details about the service..."
            />
          </div>

          {log.vt_service_log_parts && log.vt_service_log_parts.length > 0 && (
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Parts Included</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">Parts cannot be edited after logging. Delete and recreate the log if parts need to be changed.</p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                {log.vt_service_log_parts.map(p => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.quantity}x {p.part_name} {p.brand ? `(${p.brand})` : ''}</span>
                    <span>{log.currency} {(p.quantity * p.unit_cost).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
