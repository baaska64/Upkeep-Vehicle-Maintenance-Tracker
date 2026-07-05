import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Vehicle } from '../../types/database'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vt_vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Vehicle[]
    },
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, 'id' | 'created_at' | 'user_id'>) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('vt_vehicles')
        .insert([{ 
          ...newVehicle, 
          user_id: user.user.id,
          acquired_date: newVehicle.acquired_date || null
        }])
        .select()
        .single()

      if (error) throw error
      return data as Vehicle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vt_vehicles')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vt_vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Vehicle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}
