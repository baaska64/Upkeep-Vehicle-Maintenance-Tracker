import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings2, X, Lock, Trash2, Plus, Pencil, Check } from 'lucide-react'
import { useServiceCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from './api'
import { Button } from '../../components/Button'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  default_interval_months: z.number().min(1).optional().or(z.nan().transform(() => undefined)),
  default_interval_km: z.number().min(1).optional().or(z.nan().transform(() => undefined)),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function ManageCategoriesForm({ onClose }: { onClose: () => void }) {
  const { data: categories } = useServiceCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()
  const updateCategory = useUpdateCategory()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema)
  })

  const onSubmit = (data: CategoryFormValues) => {
    createCategory.mutate({
      name: data.name,
      default_interval_months: typeof data.default_interval_months === 'number' && !isNaN(data.default_interval_months) ? data.default_interval_months : null,
      default_interval_km: typeof data.default_interval_km === 'number' && !isNaN(data.default_interval_km) ? data.default_interval_km : null,
      icon: 'PenTool', // fallback icon
    }, {
      onSuccess: () => reset()
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service category? This will not delete existing logs for this category.')) {
      deleteCategory.mutate(id)
    }
  }

  const handleEditSave = (id: string) => {
    if (editingName.trim()) {
      updateCategory.mutate({ id, name: editingName.trim() }, {
        onSuccess: () => {
          setEditingId(null)
          setEditingName('')
        }
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 glass">
      <div 
        className="w-full max-w-lg rounded-2xl p-6 relative flex flex-col max-h-[90vh]"
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

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}
          >
            <Settings2 size={24} />
          </div>
          <div>
            <h2 className="text-xl headline text-[var(--color-text-primary)]">Manage Services</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Add or remove custom service categories</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          {/* Add Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Plus size={16} className="text-[var(--color-accent)]" /> Add Custom Service
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Name *</label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                  placeholder="e.g. Transmission Fluid"
                />
                {errors.name && <p className="text-xs mt-1 text-[var(--tier-warn)]">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Interval (Months)</label>
                  <input
                    type="number"
                    {...register('default_interval_months', { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                    placeholder="e.g. 24"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--color-text-secondary)]">Interval (Distance)</label>
                  <input
                    type="number"
                    {...register('default_interval_km', { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                    placeholder="e.g. 40000"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" size="sm" loading={createCategory.isPending}>Add Service</Button>
              </div>
            </div>
          </form>

          {/* List */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Existing Services</h3>
            <div className="space-y-2">
              {categories?.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors group">
                  {editingId === cat.id ? (
                    <div className="flex-1 mr-4">
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm bg-[var(--color-bg)] border border-[var(--color-accent)] text-[var(--color-text-primary)] outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(cat.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{cat.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {cat.default_interval_months && `${cat.default_interval_months} mo`}
                        {cat.default_interval_months && cat.default_interval_km && ' / '}
                        {cat.default_interval_km && `${cat.default_interval_km.toLocaleString()} dist`}
                        {!cat.default_interval_months && !cat.default_interval_km && 'No default interval'}
                      </p>
                    </div>
                  )}
                  
                  {cat.user_id === null ? (
                    <div className="p-2 text-[var(--color-text-secondary)] opacity-50" title="System default service (cannot be edited)">
                      <Lock size={16} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(cat.id)}
                            className="p-2 rounded-lg text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition-colors"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--color-text-secondary)_10%,transparent)] transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(cat.id)
                              setEditingName(cat.name)
                            }}
                            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition-colors"
                            title="Edit Service Name"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
