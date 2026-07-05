import { useState } from 'react'
import { Plus, Trash2, Shield, Settings2 } from 'lucide-react'
import { useVehicles, useUpdateVehicle } from '../vehicles/api'
import { useVehicleStore } from '../../hooks/useVehicleStore'

export function SpecsPage() {
  const { data: vehicles, isLoading } = useVehicles()
  const updateVehicle = useUpdateVehicle()
  
  const { activeVehicleId } = useVehicleStore()
  const selectedVehicle = vehicles?.find(v => v.id === activeVehicleId)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const specs = selectedVehicle?.specs || {}

  const handleAddSpec = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle || !newKey.trim() || !newValue.trim()) return

    const updatedSpecs = { ...specs, [newKey.trim()]: newValue.trim() }
    
    await updateVehicle.mutateAsync({
      id: selectedVehicle.id,
      specs: updatedSpecs
    })

    setNewKey('')
    setNewValue('')
    setIsAdding(false)
  }

  const handleDeleteSpec = async (keyToDelete: string) => {
    if (!selectedVehicle) return

    const updatedSpecs = { ...specs }
    delete updatedSpecs[keyToDelete]

    await updateVehicle.mutateAsync({
      id: selectedVehicle.id,
      specs: updatedSpecs
    })
  }

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading specs...</div>
  }

  if (!selectedVehicle) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">No Vehicle Selected</h2>
        <p className="text-[var(--color-text-secondary)]">Please select a vehicle in the Garage tab.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl headline tracking-tight mb-2">Vehicle Specs</h1>
          <p className="text-[var(--color-text-secondary)]">
            Quick reference for {selectedVehicle.nickname || selectedVehicle.model || 'your vehicle'}'s exact parts and capacities.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Spec
        </button>
      </div>

      {isAdding && (
        <div className="glass p-6 rounded-2xl border border-[var(--color-accent)] shadow-[var(--shadow-lg)]">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Settings2 size={18} className="text-[var(--color-accent)]" />
            Add New Specification
          </h3>
          <form onSubmit={handleAddSpec} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Spec Name</label>
              <input
                type="text"
                placeholder="e.g. Engine Oil Filter"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Value / Part #</label>
              <input
                type="text"
                placeholder="e.g. K&N HP-1008"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                required
              />
            </div>
            <div className="flex items-end gap-2 sm:mt-0 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateVehicle.isPending}
                className="px-6 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updateVehicle.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {Object.entries(specs).length === 0 && !isAdding ? (
        <div className="text-center py-16 px-4 border-2 border-dashed border-[var(--color-border)] rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-[var(--color-text-secondary)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Specs Yet</h3>
          <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto mb-6">
            Keep track of oil types, filter part numbers, tire pressures, and capacities all in one place.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-medium hover:border-[var(--color-accent)] transition-colors"
          >
            <Plus size={18} />
            Add First Spec
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="glass p-5 rounded-2xl flex items-start justify-between group">
              <div>
                <div className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  {key}
                </div>
                <div className="text-lg font-semibold font-mono">
                  {value as string}
                </div>
              </div>
              <button
                onClick={() => handleDeleteSpec(key)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--tier-warn)] opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Delete spec"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
