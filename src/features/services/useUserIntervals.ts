import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { UserServiceInterval } from '../../types/database'

export function useUserIntervals(vehicleId: string | null) {
  return useQuery({
    queryKey: ['userIntervals', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return []
      const { data, error } = await supabase
        .from('vt_user_service_intervals')
        .select('*')
        .eq('vehicle_id', vehicleId)
      
      if (error) throw error
      return data as UserServiceInterval[]
    },
    enabled: !!vehicleId,
  })
}

export function useUpsertInterval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (interval: { id?: string, vehicle_id: string, category_id: string, custom_interval_months: number | null, custom_interval_km: number | null }) => {
      const { data, error } = await supabase
        .from('vt_user_service_intervals')
        .upsert(interval, { onConflict: 'vehicle_id,category_id' })
        .select()
        .single()
      
      if (error) throw error
      return data as UserServiceInterval
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userIntervals', variables.vehicle_id] })
    },
  })
}

export function useDeleteInterval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, vehicleId }: { id: string, vehicleId: string }) => {
      const { error } = await supabase
        .from('vt_user_service_intervals')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return vehicleId
    },
    onSuccess: (vehicleId) => {
      queryClient.invalidateQueries({ queryKey: ['userIntervals', vehicleId] })
    },
  })
}
