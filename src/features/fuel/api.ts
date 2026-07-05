import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { FuelLog } from '../../types/database'

export function useFuelLogs(vehicleId: string | null) {
  return useQuery({
    queryKey: ['fuelLogs', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return []

      const { data, error } = await supabase
        .from('vt_fuel_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false })
        .order('mileage', { ascending: false })

      if (error) throw error
      return data as FuelLog[]
    },
    enabled: !!vehicleId,
  })
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newLog: Omit<FuelLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('vt_fuel_logs')
        .insert([newLog])
        .select()
        .single()

      if (error) throw error

      const { data: vehicle } = await supabase.from('vt_vehicles').select('current_mileage').eq('id', newLog.vehicle_id).single()
      if (vehicle && newLog.mileage > vehicle.current_mileage) {
        await supabase.from('vt_vehicles').update({ current_mileage: newLog.mileage }).eq('id', newLog.vehicle_id)
      }

      return data as FuelLog
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', variables.vehicle_id] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<FuelLog>, vehicleId: string }) => {
      const { data, error } = await supabase
        .from('vt_fuel_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as FuelLog
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', variables.vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: existing, error: fetchError } = await supabase
        .from('vt_fuel_logs')
        .select('vehicle_id')
        .eq('id', id)
        .single()
        
      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('vt_fuel_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      return existing.vehicle_id
    },
    onSuccess: (vehicleId) => {
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: ['fuelLogs', vehicleId] })
      }
    },
  })
}

