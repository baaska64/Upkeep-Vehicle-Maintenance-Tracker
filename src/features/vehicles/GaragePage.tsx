import { useState } from 'react'
import { Plus, Car, Trash2, CheckCircle2, Pencil } from 'lucide-react'
import { useVehicles, useDeleteVehicle } from './api'
import { useVehicleStore } from '../../hooks/useVehicleStore'
import { AddVehicleForm } from './AddVehicleForm'
import { EditVehicleForm } from './EditVehicleForm'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import type { Vehicle } from '../../types/database'

export function GaragePage() {
  const { data: vehicles, isLoading } = useVehicles()
  const deleteVehicle = useDeleteVehicle()
  const { activeVehicleId, setActiveVehicleId } = useVehicleStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
      </div>
    )
  }

  // Auto-select first vehicle if none is selected
  if (vehicles?.length && !activeVehicleId) {
    setActiveVehicleId(vehicles[0].id)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl headline text-[var(--color-text-primary)]">Garage</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your vehicles and fleet.</p>
        </div>
        <Button variant="primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles?.map(vehicle => {
          const isActive = activeVehicleId === vehicle.id

          return (
            <Card 
              key={vehicle.id} 
              hover 
              className={`relative overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-2 ring-[var(--color-accent)]' : ''
              }`}
              onClick={() => setActiveVehicleId(vehicle.id)}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-[var(--color-accent)]">
                  <CheckCircle2 size={20} className="fill-current text-white dark:text-black" />
                </div>
              )}
              
              <div className="p-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                    color: 'var(--color-accent)'
                  }}
                >
                  <Car size={24} />
                </div>
                
                <h3 className="text-lg headline text-[var(--color-text-primary)] truncate">
                  {vehicle.nickname}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 truncate">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-mono text-[var(--color-text-primary)] font-medium">
                      {vehicle.current_mileage.toLocaleString()}
                    </span>
                    <span className="text-[var(--color-text-secondary)] ml-1">{vehicle.mileage_unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingVehicle(vehicle)
                      }}
                      className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition-colors"
                      title="Edit Vehicle"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm('Are you sure you want to delete this vehicle?')) {
                          deleteVehicle.mutate(vehicle.id, {
                            onSuccess: () => {
                              if (activeVehicleId === vehicle.id) {
                                setActiveVehicleId(null)
                              }
                            }
                          })
                        }
                      }}
                      className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--tier-warn)] hover:bg-[color-mix(in_srgb,var(--tier-warn)_10%,transparent)] transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        {(!vehicles || vehicles.length === 0) && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] shadow-1 flex items-center justify-center mx-auto mb-4 text-[var(--color-text-secondary)]">
              <Car size={32} />
            </div>
            <h3 className="text-lg headline text-[var(--color-text-primary)]">Your garage is empty</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-sm mx-auto">
              Add your first car, motorcycle, or scooter to start tracking its maintenance.
            </p>
            <Button variant="primary" className="mt-6" onClick={() => setIsAdding(true)}>
              <Plus size={16} />
              Add Vehicle
            </Button>
          </div>
        )}
      </div>

      {isAdding && <AddVehicleForm onClose={() => setIsAdding(false)} />}
      {editingVehicle && <EditVehicleForm vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} />}
    </div>
  )
}
