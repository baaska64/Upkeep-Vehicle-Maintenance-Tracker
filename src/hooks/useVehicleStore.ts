import { create } from 'zustand'

interface VehicleStore {
  activeVehicleId: string | null
  setActiveVehicleId: (id: string | null) => void
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  activeVehicleId: null,
  setActiveVehicleId: (id) => set({ activeVehicleId: id }),
}))
