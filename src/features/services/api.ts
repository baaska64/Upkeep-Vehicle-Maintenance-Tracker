import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ServiceCategory, ServiceLog, ServiceLogPart } from '../../types/database'

export function useServiceCategories() {
  return useQuery({
    queryKey: ['serviceCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vt_service_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as ServiceCategory[]
    },
  })
}

export type ServiceLogWithParts = ServiceLog & {
  vt_service_log_parts: ServiceLogPart[]
  category?: ServiceCategory
}

export function useServiceLogs(vehicleId: string | null) {
  return useQuery({
    queryKey: ['serviceLogs', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return []

      const { data, error } = await supabase
        .from('vt_service_logs')
        .select(`
          *,
          vt_service_log_parts (*),
          category:vt_service_categories(*)
        `)
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false })

      if (error) throw error
      return data as ServiceLogWithParts[]
    },
    enabled: !!vehicleId,
  })
}

interface NewServiceLogPayload {
  log: Omit<ServiceLog, 'id' | 'created_at'>
  parts: Omit<ServiceLogPart, 'id' | 'created_at' | 'service_log_id'>[]
  receiptFile?: File
}

export function useLogService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ log, parts, receiptFile }: NewServiceLogPayload) => {
      let receipt_url = null

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${log.vehicle_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('upkeep_receipts')
          .upload(filePath, receiptFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('upkeep_receipts')
          .getPublicUrl(filePath)
          
        receipt_url = publicUrlData.publicUrl
      }

      const logToInsert = { ...log, receipt_url }

      const { data: insertedLog, error: logError } = await supabase
        .from('vt_service_logs')
        .insert([logToInsert])
        .select()
        .single()

      if (logError) throw logError

      if (parts.length > 0) {
        const partsToInsert = parts.map(p => ({
          ...p,
          service_log_id: insertedLog.id
        }))

        const { error: partsError } = await supabase
          .from('vt_service_log_parts')
          .insert(partsToInsert)

        if (partsError) throw partsError
      }

      // Auto-update vehicle mileage if this service was at a higher mileage
      const { data: vehicle } = await supabase.from('vt_vehicles').select('current_mileage').eq('id', log.vehicle_id).single()
      if (vehicle && log.mileage_at_service > vehicle.current_mileage) {
        await supabase.from('vt_vehicles').update({ current_mileage: log.mileage_at_service }).eq('id', log.vehicle_id)
      }

      return insertedLog
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serviceLogs', variables.log.vehicle_id] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useUpdateServiceLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<ServiceLog>, vehicleId: string }) => {
      const { data, error } = await supabase
        .from('vt_service_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serviceLogs', variables.vehicleId] })
    },
  })
}

export function useDeleteServiceLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, vehicleId }: { id: string, vehicleId: string }) => {
      const { error } = await supabase
        .from('vt_service_logs')
        .delete()
        .eq('id', id)
      if (error) throw error
      return vehicleId
    },
    onSuccess: (vehicleId) => {
      queryClient.invalidateQueries({ queryKey: ['serviceLogs', vehicleId] })
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newCategory: { name: string, default_interval_months: number | null, default_interval_km: number | null, icon: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('vt_service_categories')
        .insert([{ ...newCategory, user_id: user.id }])
        .select()
        .single()
      if (error) throw error
      return data as ServiceCategory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vt_service_categories')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      const { data, error } = await supabase
        .from('vt_service_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
    },
  })
}
