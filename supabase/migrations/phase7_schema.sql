-- ============================================================
-- Upkeep Phase 7 Schema — Vehicle Acquired Date
-- ============================================================

-- Add acquired_date to vt_vehicles
-- Default to created_at if null so existing data doesn't break
alter table public.vt_vehicles
add column if not exists acquired_date date;
