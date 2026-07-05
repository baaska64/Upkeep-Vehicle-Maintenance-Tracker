export interface Vehicle {
  id: string
  user_id: string
  nickname: string
  make: string | null
  model: string | null
  year: number | null
  vehicle_type: 'car' | 'motorcycle' | 'scooter' | 'truck' | 'other' | null
  vin: string | null
  current_mileage: number
  mileage_unit: string
  photo_url: string | null
  fuel_type: string | null
  specs: Record<string, string> | null
  acquired_date: string | null
  created_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string | null
  default_interval_km: number | null
  default_interval_months: number | null
  user_id: string | null
  created_at: string
}

export interface ServiceLog {
  id: string
  vehicle_id: string
  category_id: string
  service_date: string
  mileage_at_service: number
  cost: number
  currency: string
  performed_by: string | null
  notes: string | null
  receipt_url: string | null
  created_at: string
}

export interface ServiceLogPart {
  id: string
  service_log_id: string
  part_name: string
  part_number: string | null
  brand: string | null
  quantity: number
  unit_cost: number
  created_at: string
}

export interface FuelLog {
  id: string
  vehicle_id: string
  date: string
  mileage: number
  volume: number
  cost: number
  full_tank: boolean
  created_at: string
}

export interface UserServiceInterval {
  id: string
  vehicle_id: string
  category_id: string
  custom_interval_months: number | null
  custom_interval_km: number | null
  created_at: string
}
