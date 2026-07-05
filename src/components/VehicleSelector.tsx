import { useState } from 'react'
import { Car, ChevronDown, Check } from 'lucide-react'
import { useVehicles } from '../features/vehicles/api'
import { useVehicleStore } from '../hooks/useVehicleStore'

export function VehicleSelector() {
  const { data: vehicles } = useVehicles()
  const { activeVehicleId, setActiveVehicleId } = useVehicleStore()
  const [isOpen, setIsOpen] = useState(false)
  
  if (!vehicles || vehicles.length <= 1) return null // Hide if 0 or 1 vehicles

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId)
  
  const getDisplayName = (v: typeof vehicles[0]) => 
    `${v.nickname} ${v.make && v.model ? `(${v.year || ''} ${v.make} ${v.model})` : ''}`

  return (
    <>
      {/* Invisible overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="relative mb-6 max-w-sm z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-1)] hover:border-[var(--color-accent)] transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <Car size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
              Selected Vehicle
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-[var(--color-text-primary)] font-semibold text-sm truncate">
                {activeVehicle ? getDisplayName(activeVehicle) : 'Select a vehicle...'}
              </span>
              <ChevronDown size={14} className={`text-[var(--color-text-secondary)] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-3)] animate-in fade-in slide-in-from-top-2 duration-200">
            {vehicles.map(v => {
              const isSelected = v.id === activeVehicleId
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveVehicleId(v.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isSelected 
                      ? 'bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)] font-medium' 
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  <span className="truncate pr-4 text-left">{getDisplayName(v)}</span>
                  {isSelected && <Check size={16} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
