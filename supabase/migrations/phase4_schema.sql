-- Upkeep Phase 4 Schema

-- Add specs jsonb column to vt_vehicles for arbitrary key-value storage
alter table public.vt_vehicles
add column if not exists specs jsonb default '{}'::jsonb;
