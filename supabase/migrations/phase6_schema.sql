-- ============================================================
-- Upkeep Phase 6 Schema — User Service Intervals
-- ============================================================

-- Table: vt_user_service_intervals
-- Per-user, per-vehicle overrides for service intervals.
-- If a row exists here, it takes priority over the category's default.
create table if not exists public.vt_user_service_intervals (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vt_vehicles(id) on delete cascade,
  category_id uuid not null references public.vt_service_categories(id) on delete cascade,
  custom_interval_months int,
  custom_interval_km numeric,
  created_at timestamptz default now(),
  unique(vehicle_id, category_id)
);

alter table public.vt_user_service_intervals enable row level security;

create policy "Users manage own intervals"
  on public.vt_user_service_intervals
  for all
  using (
    exists (
      select 1 from public.vt_vehicles
      where id = vt_user_service_intervals.vehicle_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.vt_vehicles
      where id = vt_user_service_intervals.vehicle_id and user_id = auth.uid()
    )
  );
