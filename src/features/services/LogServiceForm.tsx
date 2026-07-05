import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogService, useServiceCategories } from './api'
import { Wrench, X, Plus, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '../../components/Button'

const serviceLogSchema = z.object({
  service_date: z.string().min(1, 'Date is required'),
  mileage_at_service: z.number().min(0, 'Mileage must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  cost: z.number().min(0),
  currency: z.string(),
  performed_by: z.string().optional(),
  notes: z.string().optional(),
  parts: z.array(z.object({
    part_name: z.string().min(1, 'Part name required'),
    part_number: z.string().optional(),
    brand: z.string().optional(),
    quantity: z.number().min(1),
    unit_cost: z.number().min(0),
  })),
})

type ServiceLogFormValues = z.infer<typeof serviceLogSchema>

interface LogServiceFormProps {
  vehicleId: string
  initialCategoryId?: string
  onClose: () => void
}

export function LogServiceForm({ vehicleId, initialCategoryId, onClose }: LogServiceFormProps) {
  const { data: categories } = useServiceCategories()
  const logService = useLogService()
  const [receiptFile, setReceiptFile] = useState<File | undefined>()

  const { register, control, handleSubmit, formState: { errors } } = useForm<ServiceLogFormValues>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      service_date: new Date().toISOString().split('T')[0],
      category_id: initialCategoryId || '',
      cost: 0,
      currency: 'PHP',
      parts: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parts'
  })

  const onSubmit = (data: ServiceLogFormValues) => {
    const { parts, ...logData } = data
    
    logService.mutate({
      log: {
        ...logData,
        vehicle_id: vehicleId,
        notes: logData.notes || null,
        performed_by: logData.performed_by || null,
        receipt_url: null,
      },
      parts: parts.map(p => ({
        ...p,
        part_number: p.part_number || null,
        brand: p.brand || null,
      })),
      receiptFile
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 glass">
      <div 
        className="w-full max-w-2xl rounded-2xl p-6 relative overflow-y-auto max-h-[90vh]"
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
            <Wrench size={24} />
          </div>
          <h2 className="text-xl headline">Log a Service</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[var(--color-bg)] border-[var(--color-border)] border text-[var(--color-text-primary)]"
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
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-mono"
              />
              {errors.mileage_at_service && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.mileage_at_service.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Category *
              </label>
              <select
                {...register('category_id')}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] appearance-none"
              >
                <option value="" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>Select a category...</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.category_id.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Total Labor/Service Cost
              </label>
              <div className="flex gap-2">
                <input
                  {...register('currency')}
                  className="w-20 px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                />
                <input
                  type="number"
                  {...register('cost', { valueAsNumber: true })}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Performed By
              </label>
              <input
                {...register('performed_by')}
                placeholder="e.g. Self, Dealer, Local Shop"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] resize-none"
              />
            </div>
          </div>

          {/* Parts Sub-form */}
          <div className="pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Parts Replaced</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => append({ part_name: '', quantity: 1, unit_cost: 0 })}
                type="button"
              >
                <Plus size={16} /> Add Part
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] relative">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--tier-warn)] flex items-center justify-center hover:scale-110 transition-transform shadow-1"
                  >
                    <X size={12} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-2">
                      <input
                        {...register(`parts.${index}.part_name` as const)}
                        placeholder="Part Name *"
                        className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                      {errors.parts?.[index]?.part_name && <p className="text-[10px] mt-1 text-[var(--tier-warn)]">{errors.parts[index]?.part_name?.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register(`parts.${index}.part_number` as const)}
                        placeholder="Part Number"
                        className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`parts.${index}.brand` as const)}
                        placeholder="Brand"
                        className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                    <div className="flex gap-2 lg:col-span-4">
                      <div className="w-24">
                        <input
                          type="number"
                          {...register(`parts.${index}.quantity` as const, { valueAsNumber: true })}
                          placeholder="Qty"
                          className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          {...register(`parts.${index}.unit_cost` as const, { valueAsNumber: true })}
                          placeholder="Unit Cost"
                          className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {fields.length === 0 && (
                <p className="text-sm text-center py-4 text-[var(--color-text-secondary)] italic">
                  No parts added to this service log.
                </p>
              )}
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="pt-6 border-t border-[var(--color-border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-3">Receipt Photo</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] cursor-pointer transition-colors w-full sm:w-auto">
                <UploadCloud size={18} />
                {receiptFile ? receiptFile.name : 'Upload Receipt'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0])}
                />
              </label>
              {receiptFile && (
                <button
                  type="button"
                  onClick={() => setReceiptFile(undefined)}
                  className="p-2 text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit" loading={logService.isPending}>Save Log</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
