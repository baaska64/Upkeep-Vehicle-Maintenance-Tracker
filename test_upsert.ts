import { supabase } from './src/lib/supabase'

async function run() {
  const { data, error } = await supabase
    .from('vt_user_service_intervals')
    .upsert({
      vehicle_id: '9f24f469-63a2-411a-ab93-4a1804df9878',
      category_id: '861a8f9c-7be9-4500-acfa-b27a3c318dc3',
      custom_interval_months: -1,
      custom_interval_km: -1
    }, { onConflict: 'vehicle_id,category_id' })
    .select()

  console.log('Result:', data)
  console.log('Error:', error)
}
run()
