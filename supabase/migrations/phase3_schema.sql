-- Upkeep Phase 3 Schema

-- 1. Fuel Logs Table
create table if not exists public.vt_fuel_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vt_vehicles(id) on delete cascade,
  date date not null default current_date,
  mileage numeric not null,
  volume numeric not null,
  cost numeric not null,
  full_tank boolean default true,
  created_at timestamptz default now()
);

alter table public.vt_fuel_logs enable row level security;

create policy "owner accesses own fuel logs" on public.vt_fuel_logs
  for all using (
    exists (
      select 1 from public.vt_vehicles
      where id = vt_fuel_logs.vehicle_id and user_id = auth.uid()
    )
  );
